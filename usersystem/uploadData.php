<?php
session_start();
ini_set('upload_max_filesize', '50M');
ini_set('post_max_size', '50M');

//Can check max filesize below
//echo phpinfo();

//Determine whether this instance is on localhost or online, by seeing if the blank text file islocalhost.txt exists
$isLocalHost = (file_exists('islocalhost.txt'));

//get credentials for postgres
	if($isLocalHost){
		$myfile = fopen("../../appservers/apache-tomcat-7x/webapps/geoserver/data/security/cubicle.txt", "r") or die("Unable to authenticate!");
	}
	else {
		$myfile = fopen("../../geoserver/data/security/cubicle.txt", "r") or die("Unable to authenticate!");
	}
	$password_db = substr(sha1(sha1(fgets($myfile)."verybest")),0,9);
	fclose($myfile);

$username = preg_replace('/[^A-Za-z0-9_]+/', '', $_SESSION['username']);
$dataSetName = preg_replace('/[^A-Za-z_0-9]/', '', $_POST["dataSetName"]);
$_POST["unitAnalysisUpload"] = preg_replace('/[^A-Za-z_0-9_.]/', '', $_POST["unitAnalysisUpload"]);

$target_dir = "uploads/".$username."/";
$uploadOk=1;
$abortupload=false;

//Define quick function for writing to user logfile
function writetologfile($textToWrite) {
	//fwrite($logfh, date("Y-m-d H:i:s",time())."--> ".$textToWrite."\r\n");
	file_put_contents('users/'.$_SESSION['username'].'_logfile.txt', date("Y-m-d H:i:s",time())." --> ".$textToWrite."\r\n", FILE_APPEND);
	return $textToWrite;
}

//Define function to choose between English and Spanish versions of a piece of text:
function l($englishText, $spanishText) {
	$textInCurrentLanguage=$spanishText;
	if($_SESSION['language']==1){
		$textInCurrentLanguage=$englishText;
	}
	return $textInCurrentLanguage;
}

//Define quick function to convert file sizes to human form
function human_filesize($bytes, $decimals = 2) {
  $sz = 'BKMGTP';
  $factor = floor((strlen($bytes) - 1) / 3);
  return sprintf("%.{$decimals}f", $bytes / pow(1024, $factor)) . @$sz[$factor];
}

writetologfile("Upload data request: ".basename($_FILES["uploadData"]["name"])." with name '".$dataSetName."'");

// Check file size < 50MB
if ($_FILES["uploadData"]["size"] > 50000000) {
    echo l(writetologfile("Sorry, your file is too large. Size limit is 50MB. Please make sure you have enabled maximum compression in the ZIP file, or if you are uploading a DBF file, try zipping it."),"Lo sentimos, el archivo es demasiado grande. Límite de tamaño es 50 MB. Por favor, asegúrese de que ha habilitado la compresión máxima en el archivo de código postal, o si va a cargar un archivo DBF, intente comprimir ella.");
    $uploadOk = 0;
}

//Check that total file size is not greater than limit
$dataSizeLimit = 200000000;
if(file_exists('users/' .$username.'.xml')){
	$xml = new SimpleXMLElement('users/' . $username .'.xml', 0, true);
	$dataSizeLimit = $xml->datasizelimit;
}

$totalfilesize = 0;
if ((file_exists('uploads/'.$username.'/'.$username.'_files.xml'))) {
		$doc = new DOMDocument();
		$doc->load('uploads/'.$username.'/'.$username.'_files.xml');						
		$xp = new DOMXPath($doc);
		
		foreach ($xp->query('//datasets/dataset') as $ds) {$totalfilesize+=$ds->getElementsByTagName('sizebytes')->item(0)->nodeValue;}
		foreach ($xp->query('//datasets/file') as $ds) {$totalfilesize+=$ds->getElementsByTagName('sizebytes')->item(0)->nodeValue;}
		
}
//echo "Total file size: ".$totalfilesize;
//echo "File size limit: ".$dataSizeLimit;

if (($totalfilesize+$_FILES["uploadData"]["size"])>$dataSizeLimit) {
	echo l(writetologfile("Uploading this file would exceed your allowed space of ".human_filesize($dataSizeLimit).". Your current total filesize is: ".human_filesize($totalfilesize).", and the file you are uploading is ".human_filesize($_FILES["uploadData"]["size"]).". Please delete some files, or email <a href='mailto:fc-targeting-tool@rff.org'>fc-targeting-tool@rff.org</a> to request more space."),"Cargar este archivo excedería su espacio permitido de ".human_filesize($dataSizeLimit).". Su tamaño total actual es: ".human_filesize($totalfilesize).", y el archivo que está cargando es ".human_filesize($_FILES["uploadData"]["size"]).". Por favor, elimine algunos archivos, o correo electrónico <a href='mailto:fc-targeting-tool@rff.org'>fc-targeting-tool@rff.org</a> para solicitar más espacio.")."<br>";
	$uploadOk = 0;
}


// Only ZIP or DBF files allowed 
$allowed =  array('zip','dbf');
$filename = $_FILES['uploadData']['name'];
$ext = pathinfo($filename, PATHINFO_EXTENSION);
if(!in_array($ext,$allowed) ) {
	echo l(writetologfile("Sorry, only ZIP or DBF files are allowed. ".$_FILES["uploadData"]["type"]),"Lo sentimos, sólo se permiten archivos ZIP o DBF. ".$_FILES["uploadData"]["type"]).'<br>';
    $uploadOk = 0;
}

if ((file_exists('uploads/'.$username.'/'.$username.'_files.xml'))) {
		$doc = new DOMDocument();
		$doc->load('uploads/'.$username.'/'.$username.'_files.xml');						
		$xp = new DOMXPath($doc);
		$recordoftablefound=0;
		
		foreach ($xp->query('//datasets/file[filename="'.$dataSetName.'"]') as $ds) {$recordoftablefound=1;}
		
		if ($recordoftablefound==1) {
			writetologfile("Detected existing dataset ".$dataSetName." in XML dataset list. Aborting...");
			echo l("A dataset or file named ".$dataSetName." already exists.  Please choose a different name or delete ".$dataSetName." and try again.<br>","Un conjunto de datos o archivo llamado ".$dataSetName." ya existe.  Por favor, elija un nombre diferente o eliminar ".$dataSetName." y vuelva a intentarlo.<br>");
			$uploadOk = 0;
		}
}


// Check if $uploadOk is set to 0 by an error
if ($uploadOk==0) {
    echo l(writetologfile("Your file was not uploaded. File selected may be invalid or blank."),"Su archivo no se ha subido. Archivo seleccionado no sea válido o en blanco.");
} else {
	if (move_uploaded_file($_FILES["uploadData"]["tmp_name"], "./".$target_dir . $dataSetName . "." . $ext)) {

		echo l(writetologfile("The file ". basename( $_FILES["uploadData"]["name"]). " has been uploaded. <br>"),"El archivo ". basename( $_FILES["uploadData"]["name"]). " se ha subido. <br>");
						
		if ($_POST["chksharedata"]=="on") {
			//if (copy ($target_dir . $dataSetName.".zip", "uploadsbackup/" . $username . "_" . $dataSetName.".zip")){writetologfile("Uploaded file copied to uploadsbackup/" . $username . "_" . $dataSetName.".zip");}
			echo l('Data posted to the <a href="communitydata.php">Community Data Layers</a> page. If you would like it removed, please contact us at <a href="mailto:fc-targeting-tool@rff.org">fc-targeting-tool@rff.org</a><br>','Datos ha publicado en el <a href="communitydata.php">Capas de Datos de la Comunidad</a> page. Si desea que se elimine, por favor contacte con nosotros en<a href="mailto:fc-targeting-tool@rff.org">fc-targeting-tool@rff.org</a><br>');
		}		
		
		if (!(mkdir('uploads/'.$username.'/staging_'.$dataSetName.'/'))) {
			echo l(writetologfile("Could not create temporary staging directory"),"No se pudo crear el directorio de montaje temporal").'<br>';
		}
		else {
			if($ext=="zip") {
				$zip = zip_open($target_dir . $dataSetName.'.zip');
				while ($zip_entry = zip_read($zip))    {
					$thisext = pathinfo(zip_entry_name($zip_entry), PATHINFO_EXTENSION);
					zip_entry_open($zip, $zip_entry);					
					if (substr(zip_entry_name($zip_entry), -1) == '/') {
						echo l(writetologfile("Folders ignored: ".zip_entry_name($zip_entry)),"Carpetas ignorados: ".zip_entry_name($zip_entry)).'<br>';
					}
					elseif ($thisext!= "qpj" && $thisext!= "shp" && $thisext!= "shx" && $thisext!= "cpg" && $thisext!= "dbf" && $thisext!= "prj" && $thisext!= "sbn" && $thisext!= "sbx" && $thisext!= "fbn" && $thisext!= "fbx" && $thisext!= "ain" && $thisext!= "aih" && $thisext!= "atx" && $thisext!= "ixs" && $thisext!= "msx") {
						echo l(writetologfile("File ignored, not a valid shapefile component: ".zip_entry_name($zip_entry)),"Archivo ignorado, no es un componente válida de shapefile: ".zip_entry_name($zip_entry)).'<br>';
					}
					else {
						$name = 'uploads/'.$username.'/staging_'.$dataSetName.'/'.$dataSetName.'.'.$thisext;
						writetologfile("File unzipped: ".zip_entry_name($zip_entry)).'to '.$name.'<br>';
						if (file_exists($name)) {
							echo l(writetologfile("File ".zip_entry_name($zip_entry)."ignored. Archive can only have one file of each of the following types: QPJ, SHP, SHX, CPG, DBF, PRJ, SBN, SBX, FBN, FBX, AIN, AIH, ATX, IXS, MSX. <br>"),"Archivo ".zip_entry_name($zip_entry)." ignorado. Archivo sólo puede tener un archivo de cada uno de los siguientes tipos: QPJ, SHP, SHX, CPG, DBF, PRJ, SBN, SBX, FBN, FBX, AIN, AIH, ATX, IXS, MSX. <br>");
						}
						$fopen = fopen($name, "w+");
						fwrite($fopen, zip_entry_read($zip_entry, zip_entry_filesize($zip_entry)), zip_entry_filesize($zip_entry));
					}
					zip_entry_close($zip_entry);
				}
				zip_close($zip);
			}
			elseif($ext=="dbf") {
				if (copy ($target_dir . $dataSetName.'.dbf', 'uploads/'.$username.'/staging_'.$dataSetName.'/'.$dataSetName.'.dbf')){
					echo l(writetologfile("DBF file copied to staging directory"),"DBF archivo copiado al directorio de ensayo")."<br>";
				}
				else {
					echo l(writetologfile("DBF file copy failed"),"Copia de archivo DBF fracasado")."<br>";
				}			
			}
			
			//create postgres table
				$dbconn = pg_connect("host=localhost port=5432 dbname=forestro_users_db user=forestro_users password=".$password_db);		
				if(!($dbconn)) {
					$activateDataOutput = l("Unable to connect to database.","Incapaz de conectar a la base de datos.");
					die;
				}
				else {
					echo l(writetologfile("Connected to database..."),"Conectado a la base de datos...")."<br>";
					//if ($_POST["chkcomplete"]=="on") {
					//	$tablename = $username.'_ds_'.$dataSetName;		
					//}
					//else {
						$tablename = 'userdata_'.$username.'_fi_'.$dataSetName;		
					//}
					//open a file handle for binary safe write - this creates a logfile...Use it or leave it, just an extra		
					if(file_exists($target_dir.'/staging_'.$dataSetName.'/'.$dataSetName.'.dbf')) {
						
							if($isLocalHost){
								$pathToshp2psql = "/usr/bin/";
							}
							else{
								$pathToshp2psql = "/usr/pgsql-9.3/bin/";
							}
							
							//Whether or not there is a shapefile, the AcuGIS version of shp2pgsql doesn't seem to care whether we point to a DBF or SHP, or put in a -G tag to tell it to just expect DBF.  So, we'll point it to dbf put leave out -G
							$ret = shell_exec($pathToshp2psql.'shp2pgsql -s 4326 uploads/'.$username.'/staging_'.$dataSetName.'/'.$dataSetName.'.dbf '.$tablename.' > uploads/'.$username.'/create_'.$tablename.'.sql');
							
							//$ret = shell_exec($pathToshp2psql.'shp2pgsql -s 4326 uploads/'.$username.'/MREDD_AATR.shp '.$tablename.' > uploads/'.$username.'/create_'.$tablename.'.sql');
							
							// note: the '2>&1' at the end directs the error/summary part of the output to go with the rest in the sql file.  this was the only way I could find to prevent the results from displaying on the page.  so, we'll have to deal with this below to avoid running this part of the SQL file
											
							if(file_exists('uploads/'.$username.'/create_'.$tablename.'.sql')) {
							
								//$activateDataOutput = $ret;				
								echo l(writetologfile("Shapefile converted to SQL query."),"Shapefile convierte a query SQL.")."<br>";
								echo l(writetologfile("Please wait..."),"Por favor espera...")."<br>";
								
								//To avoid reading in full SQL file (which will be the size of the whole dataset) into memory at once, we'll read it line by line and execute each SQL statement
								$featurenum = -6;
								$sqlline_nocr = "";
								$file = fopen('uploads/'.$username.'/create_'.$tablename.'.sql', "r");
								while(!(feof($file) || ($sqlline_nocr == "COMMIT;"))){
									$sqlline = fgets($file);
									
									//if line from file has no semicolon, read in subsequent lines until we get one
									if (strpos($sqlline,';') == false) {
										$line = fgets($file);
										while (strpos($line,';') == false) {
											$sqlline = $sqlline.$line;
											$line = fgets($file);
										}
										$sqlline = $sqlline.$line;
									};
							
									//get rid of any \r \n carriage return special chracters in the line
									$sqlline_nocr =  trim(preg_replace('/[\r\n]+/', ' ', $sqlline));
									
									//Skip first line of SQL file, which is the "SET CLIENT_ENCODING TO UTF8;" which always throws an error:	
									//Also skip the BEGIN; and COMMIT; lines, because they require that all lines in between are run as a single block		
									if(!(($sqlline_nocr == "SET CLIENT_ENCODING TO UTF8;") || ($sqlline_nocr == "BEGIN;") || ($sqlline_nocr == "COMMIT;"))) {
									//	if(!(($line_nocr == "SET CLIENT_ENCODING TO UTF8;"))) {
										$featurenum++;
										
										//Restrict "aggregate by mexico predio" number of points to 5000 by default
										//To allow an easy work-around for case-by-case, permissions, we'll take the maximum of
										//5000 and $dataSizeLimit/400000, which by default is 200000000/400000=5000
										if (($_POST["unitAnalysisUpload"] == "mex_pred") && ($featurenum>max(5000,$dataSizeLimit/40000))) {
											echo writetologfile(l("Your uploaded dataset exceeds the maximum allowed number of points for aggregation by Mexico predio. Aggregation of more than 5000 points is not available through the web-interface due to excessive load on our server. If you would like to request special permission, please email us at <a href='mailto:fc-targeting-tool@rff.org'>fc-targeting-tool@rff.org</a>.<br>","Su cargado de datos excede el número máximo permitido de puntos para la agregación de México predio. La agregación de más de 5000 puntos no está disponible a través de la interfaz web debido a la carga excesiva en nuestro servidor. Si desea solicitar un permiso especial, por favor escríbanos a <a href='mailto:fc-targeting-tool@rff.org'>fc-targeting-tool@rff.org</a>.<br>"));
											$abortupload=true;
											break;
										}
										
										//Allow data activation to overwrite existing table of same name, if there is one
										if (substr($sqlline_nocr,0,12)=='CREATE TABLE'){								
											$res = pg_query($dbconn, 'DROP TABLE IF EXISTS public.'.$tablename);
											$activateDataOutput = $res;
										}
										
										//Get rid of all data within quotes that isn't alphanumeric (or underscore)
										
											//Clean-up expressions in single quotes:
											$sqlline_nocr_quotescleaned="";
											$thingsinquotes = preg_split('/(\'[^\']*\')/', $sqlline_nocr, -1, PREG_SPLIT_DELIM_CAPTURE | PREG_SPLIT_NO_EMPTY);
											foreach($thingsinquotes as $thing){
												if (substr($thing,0,1)=="'" & substr($thing,strlen($thing)-1,1)=="'"){
													$sqlline_nocr_quotescleaned.="'".preg_replace('/[^A-Za-z0-9_\.+-]+/','',$thing)."'";
												}
												else{
													$sqlline_nocr_quotescleaned.=$thing;
												}
											}

											//Clean-up expressions in double quotes:
											$sqlline_nocr = $sqlline_nocr_quotescleaned;
											$sqlline_nocr_quotescleaned="";
											$thingsinquotes = preg_split('/("[^"]*")/', $sqlline_nocr, -1, PREG_SPLIT_DELIM_CAPTURE | PREG_SPLIT_NO_EMPTY);
											foreach($thingsinquotes as $thing){
												if (substr($thing,0,1)=='"' & substr($thing,strlen($thing)-1,1)=='"'){
													$sqlline_nocr_quotescleaned.='"'.preg_replace('/[^A-Za-z0-9_\.+-]+/','',$thing).'"';
												}
												else{
													$sqlline_nocr_quotescleaned.=$thing;
												}
											}

										
										$res = pg_query($dbconn, $sqlline_nocr_quotescleaned);
										if (pg_last_error($dbconn)!=""){echo writetologfile(pg_last_error($dbconn))."<br>";};
										//$activateDataOutput.="Feature ".$featurenumtext.": ".$res;
										
										//ERROR: relation "userdata" already exists
										
										//if table has just been created, detect this and alter owner to 'forestro' role. Also, grant privileges to forestro, forestro_users now. This way, if there are any errors later, we won't have any trouble deleting the table manually later
										if (substr($sqlline_nocr,0,12)=='CREATE TABLE'){
											$res = pg_query($dbconn, 'GRANT ALL PRIVILEGES ON '.$tablename.' TO forestro, forestro_users;');
											$res = pg_query($dbconn, 'ALTER TABLE '.$tablename.' OWNER TO forestro;');
											$res = pg_query($dbconn, 'VACUUM ANALYZE '.$tablename.';');
										}
									};
									
									// Because of using '2>&1' in the shell command, we'll have some extra output at the end of the file that isn't SQL. Detect the end of the SQL portion by looking for the COMMIT command in the while condition
								}
								fclose($file);
								
								if($abortupload){
									writetologfile("Loop aborted due to number of points in mexico predio aggregation.");
									@writetologfile(pg_query($dbconn, 'DROP TABLE '.$tablename.';'));
									echo l("<br><a href='userconsole.php?lang=".$_SESSION['language']."'>Click here</a> to go back to the user dashboard.","<br><a href='userconsole.php?lang=".$_SESSION['language']."'>Clic aquí</a> para volver al consola de usuario.");
									exit();
								}
								
								echo l(writetologfile("Shapefile sucessfully converted to postGIS table! Table name: ".$tablename.", approximately ".$featurenum." features loaded."),"	Shapefile con éxito convierte en tabla PostGIS! Nombre de la tabla: ".$tablename.", aproximadamente ".$featurenum." formas cargados.")."<br>";
								
								$mexPredName ="Aggregate from 250m grid to Mexico predios";
								$mexPredNameSpan = "Agregada de 250 rejilla para México predios";					
								
								//Add upload to user file XML list
									if ((file_exists('uploads/'.$username.'/'.$username.'_files.xml'))) {
										$doc = new DOMDocument();
										$doc->load('uploads/'.$username.'/'.$username.'_files.xml');
										$root = $doc->documentElement;
									}
									else {
										writetologfile("User file list not found, creating...");
										$doc = new DOMDocument();
										$doc->preserveWhiteSpace = false;
										$doc->formatOutput = true;
										$root = $doc->appendChild($doc->createElement('datasets'));
									}	

									$fileobject = $root->appendChild($doc->createElement('file'));	
									$fileobject->appendChild($doc->createElement('filename'))->appendChild($doc->createTextNode($dataSetName));		
									$fileobject->appendChild($doc->createElement('unitofanalysis'))->appendChild($doc->createTextNode($_POST["unitAnalysisUpload"]));		
									$fileobject->appendChild($doc->createElement('size'))->appendChild($doc->createTextNode(human_filesize($_FILES["uploadData"]["size"])));		
									$fileobject->appendChild($doc->createElement('sizebytes'))->appendChild($doc->createTextNode($_FILES["uploadData"]["size"]));
									$fileobject->appendChild($doc->createElement('originalfilename'))->appendChild($doc->createTextNode(preg_replace('/[^A-Za-z_0-9_.]/', '', basename($_FILES["uploadData"]["name"]))));
									$fileobject->appendChild($doc->createElement('datetime'))->appendChild($doc->createTextNode(date("Y-m-d H:i:s",time())));

									//write to xml file
									$doc->save('uploads/'.$username.'/'.$username.'_files.xml');
							
							}
							else {
								echo l(writetologfile("Shapefile failed to convert to SQL: ".$ret),"Shapefile no pudo convertir a SQL: ".$ret)."<br>";
							}
					}
					else {
						echo l(writetologfile("User uploaded data DBF file not found on server."),"Usuario subido archivo DBF de datos no encontrado en el servidor.")."<br>";
					}
				}
				//$pg->close();
				pg_close($dbconn);
				
			//delete SQL script
			if(file_exists('uploads/'.$username.'/create_'.$tablename.'.sql')) {
				if(unlink('uploads/'.$username.'/create_'.$tablename.'.sql')){
					writetologfile('uploads/'.$username.'/create_'.$tablename.'.sql');
				}
			}
			
			//delete original .zip or .dbf file
			if (file_exists('uploads/'.$username.'/'.$dataSetName.'.' . $ext)) {
				if (unlink('uploads/'.$username.'/'.$dataSetName.'.' . $ext)) {
					writetologfile('Cleanup: original file uploads/'.$username.'/'.$dataSetName.'.' . $ext . ' deleted');
				}
			};
							
			//clean up by deleting original upload files		
			$dir = new DirectoryIterator(dirname('uploads/'.$username.'/staging_'.$dataSetName.'/*'));
			foreach ($dir as $fileinfo) {
				if (!$fileinfo->isDot()) {
					//var_dump($fileinfo->getFilename());
					$thisfilename = 'uploads/'.$username.'/staging_'.$dataSetName.'/';
					$thisfilename .= $fileinfo->getFilename();
					if (file_exists($thisfilename)) {
						if (unlink($thisfilename)) {
							writetologfile("Cleanup: file ".$thisfilename." deleted");
						}
					}
				}
			}
				
				//Now delete staging folder itself
				if (rmdir("uploads/".$username."/staging_$dataSetName")) {	//
					echo l(writetologfile("Temporary folder deleted."),"Carpeta temporal eliminado.");
				}
				else {
					echo l('Note: could not delete temporary staging directory. Please email us at <a href="mailto:fc-targeting-tool@rff.org">fc-targeting-tool@rff.org</a> with your username.','Nota: no se pudo eliminar directorio de ensayo temporal. Por favor envíenos un email a <a href="mailto:fc-targeting-tool@rff.org">fc-targeting-tool@rff.org</a> con su nombre de usuario.');
					writetologfile("Note: could not delete temporary staging directory");	
				}
		}
	}
	else {
		echo l(writetologfile("Sorry, there was an error uploading your file. A file with the same name ".$datasetName." may exist already on server. If you do not have a file or dataset with this name appearing in your User Console, please contact us at <a href='mailto:fc-targeting-tool@rff.org'>fc-targeting-tool@rff.org</a>"),"Lo sentimos, hubo un error al subir el archivo. Un archivo con el mismo nombre ".$datasetName." pueden existir ya en el servidor. Si usted no tiene un archivo o conjunto de datos con el nombre que aparece en su usuario de la consola, por favor contacte con nosotros a <a href='mailto:fc-targeting-tool@rff.org'>fc-targeting-tool@rff.org</a>");
	}		
}

echo l("<br><a href='userconsole.php?lang=".$_SESSION['language']."'>Click here</a> to go back to the user dashboard.","<br><a href='userconsole.php?lang=".$_SESSION['language']."'>Clic aquí</a> para volver al consola de usuario.");
?>

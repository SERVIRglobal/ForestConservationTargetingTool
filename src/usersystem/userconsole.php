<?php session_start(); ?>
<html xmlns="http://www.w3.org/xhtml">
<head>
	<title>FCTT User Console</title>
	<meta charset="UTF-8">
	<meta name="viewport" content="initial-scale=1">

	<style type="text/css">
	
	    /*Customize fieldset appearance */
		
		/* CSS code to remove extra line skipped after h1, h2, h3 tags */
		h1, h2, h3, h4 {
			display: inline;
		}
		
		.fieldset-auto-width {
			display: inline-block;
			border: solid 2px green;
		}
		
		.fieldset-auto-width-small {
			display: inline-block;
			border: solid 1px green;
			text-align: left;
		}
	
		.fieldset{
			border-style: solid;
			border-color: green;
		}
		
		legend {
		  padding: 0.2em 0.5em;
		  border:2px solid green;
		  color:green;
		  font-size:25;
		  text-align:left;
		  font-weight:normal;
		 }
	
		/*CSS code to remove extra line skipped after h1, h2, h3 tags*/
		h1, h2, h3 {
		display: inline;
		}
		
		/*Make big pretty submit buttons for splashscreen */
		.bigSubmitButton {
			width:175x;
			height:40px;
			background-color:teal;
			border-color:black;
			color:white;
			font-face:arial;
			font-size:20px;
			font-weight:bold;
		}
		
		/*"Steps" numbered list*/
		.stepslist {
			margin-left: 0;
			padding-right: 0;
			list-style-type: none;
			list-style-position: inside;
		}
	
/*	
		.stepslist li {
			counter-increment: step-counter;
			list-style-position: inside;
			text-indent: -4.8em;
			padding-left: 2.5em;
			margin: 0 0 5px 0;	
		}
		
		.stepslist li::before {
			content: 'Step ' counter(step-counter) ":";
			margin-right: 5px;
			font-size: 120%;
			background-color: rgb(255,255,255);
			color: black;
			font-weight: bold;
			padding: 3px 8px;
			border-radius: 3px;
		}
		
		dd {
			display: list-item;
			list-style-type: disc;
			text-indent:  0em;
			padding-left: 0em;
		}
		
		dl {
			margin: 0 0 0 0;
		}
*/		
	</style>
</head>
<body>

<font face="arial">

<?php

//Determine whether this instance is on localhost or online, by seeing if the blank text file islocalhost.txt exists
$isLocalHost = 0;
if(file_exists('islocalhost.txt')) {$isLocalHost = 1;}

//get credentials for postgres
	if($isLocalHost){
		$myfile = fopen("../../appservers/apache-tomcat-7x/webapps/geoserver/data/security/cubicle.txt", "r") or die("Unable to authenticate!");
	}
	else {
		$myfile = fopen("../../geoserver/data/security/cubicle.txt", "r") or die("Unable to authenticate!");
	}
	$password_db = substr(sha1(sha1(fgets($myfile)."verybest")),0,9);
	fclose($myfile);

//Define quick function for writing to user logfile
function writetologfile($textToWrite) {
	//fwrite($logfh, date("Y-m-d H:i:s",time())."--> ".$textToWrite."\r\n");
	file_put_contents('users/'.$_SESSION['username'].'_logfile.txt', date("Y-m-d H:i:s",time())." --> ".$textToWrite."\r\n", FILE_APPEND);
	return $textToWrite;
}

//Define function to choose between English and Spanish versions of a piece of text:
function l($englishText, $spanishText) {
	$textInCurrentLanguage=$spanishText;
	if($_GET["lang"]==1){
		$textInCurrentLanguage=$englishText;
	}
	return $textInCurrentLanguage;
}

//Update session variable for language to pass back to FCTT, in case this has changed since login
$_SESSION['language'] = $_GET["lang"];

$caAdmName = "Central America Administrative";
$caAdmNameSpan = "Límites Administrativos Centroamérica";
$ca10kmName = "Central America 10km";
$ca10kmNameSpan = "Centroamérica polígonos rejilla 10km";
$ca1kmName = "Central America 1km";
$ca1kmNameSpan = "Centroamérica polígonos rejilla 1km";
$mexPredName ="Aggregate from 250m grid to Mexico predios";
$mexPredNameSpan = "Agregada de 250m rejilla para México predios";
$caMex250mName ="Mexico 250m";
$caMex250mNameSpan ="México 250m";
$sa10kmName = "South America 10km";
$sa10kmNameSpan = "Sudamérica polígonos rejilla 10km";
$customName = "Custom...";
$customNameSpan ="Personalizado...";

function returnUnitOfAnalysisName($handle) {
	$niceName = "";
		
		if ($handle=="ca_adm"){$niceName = l($GLOBALS['caAdmName'],$GLOBALS['caAdmNameSpan']);}
		if ($handle=="ca_10km") {$niceName = l($GLOBALS['ca10kmName'],$GLOBALS['ca10kmNameSpan']);}
		if ($handle=="ca_1km") {$niceName = l($GLOBALS['ca1kmName'],$GLOBALS['ca1kmNameSpan']);}
		if ($handle=="ca_mex_250m") {$niceName = l($GLOBALS['caMex250Name'],$GLOBALS['caMex250NameSpan']);}
		if ($handle=="mex_pred") {$niceName = l($GLOBALS['mexPredName'],$GLOBALS['mexPredNameSpan']);}
		if ($handle=="sa_10km") {$niceName = l($GLOBALS['sa10kmName'],$GLOBALS['sa10kmNameSpan']);}
		if ($handle=="custom") {$niceName = l($GLOBALS['customName'],$GLOBALS['customNameSpan']);}
	
	return $niceName;
}

$onBoardName = "Original onboard";
$onBoardNameSpan= "Original a bordo";


if(($_SESSION['application'] != "fctt519") || (!file_exists('users/' . $_SESSION['username'] .'.xml'))) {
	//echo "Not logged in. <a href='login.php'>Login</a>"; 
	echo("<script type='text/javascript'>window.top.location.href = '../index_user.html'</script>;");
	die;
} 
else {

	$username = preg_replace('/[^A-Za-z0-9_]+/', '', $_SESSION['username']);

    echo "<h1>".l("User Console: welcome ","Consola de Usuario: bienvenido ") . htmlspecialchars($username);
			
}
?>

</h1>

<br><br><h3>
<? echo l("This console allows you to upload and manage your own spatial data. Three steps are required: <ol><li>Upload data<li>Join uploaded data with the onboard data<li>Reload and return to the FCTT</ol> Detailed instructions can be found <a href='../documents/instructions.pdf'>here</a>. <br><br> Please note that while access to your user-uploaded layers requires your unique passcode, we cannot guarantee the security of your data on our server. By uploading your data you acknowledge and accept this.","Aquí puede cargar datos y administrar sus capas personalizadas. Se requieren tres pasos: <ol><li>Cargar datos<li>Únete a los datos cargados con los datos a bordo<li>Recargar y volver a la FCTT</ol> Instrucciones detalladas se pueden encontrar <a href='../documents/instructions.pdf'>aquí</a>. <br><br> Tenga en cuenta que, si bien el acceso a sus capas subidos por el usuario requiere el código de acceso único, no podemos garantizar la seguridad de sus datos en nuestro servidor. Al cargar sus datos, usted reconoce y acepta esto."); ?>
<?php

if(isset($_POST['composedataset'])){

	$goahead = 1;
	
	$cleanDataSetName = preg_replace('/[^A-Za-z_0-9]/', '', $_POST['dataSetNameCompose']);
	//Should I screen for length too?
	
	$tableName =  'userdata_'.$username."_ds_".$cleanDataSetName;
		
	if ($cleanDataSetName=="") {
		writetologfile("Request to compose dataset received with no name");
		$lastTaskResult =  l("Please enter a dataset name!","Por favor, introduzca un nombre de conjunto de datos");
		$goahead = 0;
	}
	
	writetologfile("Request to compose dataset ".$cleanDataSetName." received. Table name: ".$tableName);
	
	$doc = new DOMDocument();
	$doc->load('uploads/'.$username.'/'.$username.'_files.xml');
	$root = $doc->documentElement;
				
	$xp = new DOMXPath($doc);
	
	//Check if user already has a dataset with this name, or too many datasets already	
		$numdatasetsalready=0;
		foreach ($xp->query('//datasets/dataset') as $ds) {
			$numdatasetsalready++;
			if($ds->getElementsByTagName('datasetname')->item(0)->nodeValue==$cleanDataSetName){
				writetologfile("Existing dataset with name ".$cleanDataSetName." detected");
				$lastTaskResult =  l("You already have a dataset with the name ".$cleanDataSetName.". Please delete this dataset first or choose a different name. If you do not see this dataset reflected in your list, please email <a href='mailto:fc-targeting-tool@rff.org'>fc-targeting-tool@rff.org</a> for assistance.","Ya tiene un conjunto de datos con el nombre ".$cleanDataSetName.". Por favor, elimine este conjunto de datos primero o elegir un nombre diferente. Si usted no ve este conjunto de datos se refleja en su lista, envíe un correo electrónico <a href='mailto:fc-targeting-tool@rff.org'>fc-targeting-tool@rff.org</a> para ayuda.");
				$goahead = 0;
			}
		}
	
		$maxNumDataSets = 10;
		if(file_exists('users/' .$username.'.xml')){
			$xml = new SimpleXMLElement('users/' . $username .'.xml', 0, true);
			$maxNumDataSets = $xml->maxnumdatasets;
		}
		if($numdatasetsalready >= $maxNumDataSets){
			$lastTaskResult =  writetologfile(l("You already have ".$numdatasetsalready." datasets in memory, and your limit is ".$maxNumDataSets.". Please delete some to free up space, or email <a href='mailto:fc-targeting-tool@rff.org'>fc-targeting-tool@rff.org</a> to request more space.","Ya tiene ".$numdatasetsalready." conjuntos de datos en la memoria, y su límite es ".$maxNumDataSets.". Por favor, elimine algunos para liberar espacio, o enviar un correo electrónico a <a href='mailto:fc-targeting-tool@rff.org'>fc-targeting-tool@rff.org</a> para solicitar más espacio."));
			$goahead = 0;
		}
	
	
	//Figure out unit of analysis
		$onBoardTableName = 'Not set';
		
		if($_POST['unitAnalysisCompose']=="ca_adm") {$onBoardTableName = 'obd_ca_adm';}
		if($_POST['unitAnalysisCompose']=="ca_10km") {$onBoardTableName = 'obd_ca_10km';}
		if($_POST['unitAnalysisCompose']=="ca_1km") {$onBoardTableName = 'obd_ca_1km';}
		if($_POST['unitAnalysisCompose']=="mex_pred") {$onBoardTableName = 'obd_mex_pred';}
		if($_POST['unitAnalysisCompose']=="sa_10km") {$onBoardTableName = 'obd_sa_10km';}
		//Add 250m on board table here later
		if ($_POST['unitAnalysisCompose']=="custom") {$onBoardTableName = "userdata_".$username."_fi_".preg_replace('/[^A-Za-z0-9_]+/', '', $_POST['carbonComposeDataSet']);}
		//Detect if this table doesn't have an fctt_id attribute?
		$geomBoardTableName = $onBoardTableName;
		if($onBoardTableName=='Not set') {
			writetologfile("Valid unit of analysis not detected");
			$lastTaskResult = l("Be sure to select a unit of analysis!","Asegúrese de seleccionar una unidad de análisis!");
			$goahead=0;
		}
			
	foreach(array('carbon', 'bio', 'hydro', 'cost', 'risk', 'forest', 'info') as $thisAttribute) {

		//Write original request to log file
			writetologfile("Requested ".$thisAttribute.": ".$_POST[$thisAttribute.'ComposeDataSet'].".".$_POST[$thisAttribute.'ComposeAttribute']);	
		
		//Add username prefix to get table names
			if($_POST[$thisAttribute.'ComposeDataSet'] != "obd") {
				$_POST[$thisAttribute.'ComposeDataSet'] = "userdata_".$username."_fi_".$_POST[$thisAttribute.'ComposeDataSet'];			
			}
			else{
				$_POST[$thisAttribute.'ComposeDataSet'] =$onBoardTableName;
			}
			
		//Regex the dataset and attrbiute variables:
		$_POST[$thisAttribute.'ComposeDataSet'] = preg_replace('/[^A-Za-z_0-9]/', '',$_POST[$thisAttribute.'ComposeDataSet']);
		$_POST[$thisAttribute.'ComposeAttribute'] = preg_replace('/[^A-Za-z_0-9]/', '',$_POST[$thisAttribute.'ComposeAttribute']);
		
	}
	
	//Go ahead with building and running query, if no errors
	if($goahead==1){
		writetologfile("Cleared to go ahead with building SQL query");
		
		//Build main part of SQL Query
			$geometryAttribute = 'geom';
			$sqlQuery = "";
			$sqlQuery .= "CREATE TABLE ".$tableName." AS ";
			$sqlQuery .= "WITH TableWithValues AS (";
			$sqlQuery .= "SELECT ".$geomBoardTableName.".".$geometryAttribute.", ".$onBoardTableName.".fctt_id, ".$onBoardTableName.".fctt_id AS gid, ";
			if(($_POST['unitAnalysisCompose']=="mex_pred")){
				$sqlQuery .= $onBoardTableName.".identifying_info, ";
			}
			//Create optional prefix and suffix that do nothing unless we are aggregating 250m by predios
			$averagePrefix = "";
			$averageSuffix = "";
			if(($_POST['unitAnalysisCompose']=="mex_pred")){
				echo writetologfile("Attempting aggregation from 250m grid to Mexico predios");
				$averagePrefix = "AVG(";
				$averageSuffix = ")";
			
			}
			$sqlQuery .= $averagePrefix.$_POST['carbonComposeDataSet'].".".$_POST['carbonComposeAttribute'].$averageSuffix." AS carbon, ";
			$sqlQuery .= $averagePrefix.$_POST['bioComposeDataSet'].".".$_POST['bioComposeAttribute'].$averageSuffix." AS bio, ";
			$sqlQuery .= $averagePrefix.$_POST['hydroComposeDataSet'].".".$_POST['hydroComposeAttribute'].$averageSuffix." AS hydro, ";
			$sqlQuery .= $averagePrefix.$_POST['costComposeDataSet'].".".$_POST['costComposeAttribute'].$averageSuffix." AS cost, ";
			$sqlQuery .= $averagePrefix.$_POST['riskComposeDataSet'].".".$_POST['riskComposeAttribute'].$averageSuffix." AS risk, ";
			//Putting info before forest for comma
			if(($_POST['unitAnalysisCompose']!="mex_pred")){
				$sqlQuery .= $_POST['infoComposeDataSet'].".".$_POST['infoComposeAttribute']."::text AS identifying_info, ";
			}

			$sqlQuery .= $averagePrefix.$_POST['forestComposeDataSet'].".".$_POST['forestComposeAttribute'].$averageSuffix." AS forarea ";
			$sqlQuery .= "FROM ".$onBoardTableName;
		
		//Get list of unique tables included, and add them as inner joins on the SQL query
			$tables=array($_POST['carbonComposeDataSet'],$_POST['bioComposeDataSet'],$_POST['hydroComposeDataSet'],$_POST['costComposeDataSet'],$_POST['riskComposeDataSet'],$_POST['forestComposeDataSet'],$_POST['infoComposeDataSet']);
			$tables = array_unique($tables);
			foreach($tables as $thisTable) {
				if($thisTable != "obd" && $thisTable != $onBoardTableName) {
					if(($_POST['unitAnalysisCompose']=="mex_pred")){
						$sqlQuery .= " JOIN ".$thisTable." ON ST_Intersects(".$thisTable.".geom, ".$onBoardTableName.".geom)";
					}
					else {
						$sqlQuery .= " INNER JOIN ".$thisTable." ON ".$onBoardTableName.".fctt_id=".$thisTable.".fctt_id";
					}
				}
			}
			
			if(($_POST['unitAnalysisCompose']=="mex_pred")){
				$sqlQuery .= " GROUP BY ".$onBoardTableName.".gid, ".$onBoardTableName.".geom, ".$onBoardTableName.".fctt_id,".$onBoardTableName.".identifying_info";
			}
					
		
		$sqlQuery .= ") SELECT *, (CASE WHEN cost = 0 THEN null ELSE carbon*risk/cost END) as scenario1, (CASE WHEN cost = 0 THEN null ELSE bio*risk/cost END) as scenario2,(CASE WHEN cost = 0 THEN null ELSE hydro*risk/cost END) as scenario3 FROM TableWithValues";

		$sqlQuery .=";";
		//$sqlQuery = str_replace("obd", $onBoardTableName, $sqlQuery);
		writetologfile("SQL query: ".$sqlQuery);
		
		//Run the SQL Query"	
		$dbconn = pg_connect("host=localhost port=5432 dbname=forestro_users_db user=forestro_users password=".$password_db);		
			if(!($dbconn)) {
				$lastTaskResult = l(writetologfile("Unable to connect to database."),"Incapaz de conectar a la base de datos.");
			}
			else {
				writetologfile("Connected to database.");
				
				//Detect if table exists already
				
				@writetologfile(pg_query($dbconn, $sqlQuery));
				$ret = pg_query($dbconn, 'GRANT ALL PRIVILEGES ON '.$tableName.' TO forestro, forestro_users;');
				$ret = pg_query($dbconn, 'ALTER TABLE '.$tableName.' OWNER TO forestro;');
				$ret = pg_query($dbconn, 'VACUUM ANALYZE '.$tableName.';');
				$ret = writetologfile(pg_last_error($dbconn));
				writetologfile($ret);	
				
				writetologfile("SQL query result: ".$ret);	
				
				//See if dataset build was successful or not
				if($ret==""){
					$lastTaskResult = l("Dataset ".$cleanDataSetName." created successfully. Click <a href='javascript:void' onClick=goToFCTT()>here</a> to reload the FCTT.","Conjunto de datos ".$cleanDataSetName." creado correctamente. Clickea <a href='javascript:void' onClick=goToFCTT()>aquí</a> para recargar la FCTT.");
							
					//Add composed dataset to user file XML list
					$datasetobject = $root->appendChild($doc->createElement('dataset'));	
					$datasetobject->appendChild($doc->createElement('datasetname'))->appendChild($doc->createTextNode($cleanDataSetName));		
					$datasetobject->appendChild($doc->createElement('unitofanalysis'))->appendChild($doc->createTextNode($_POST['unitAnalysisCompose']));
					$datasetobject->appendChild($doc->createElement('datetime'))->appendChild($doc->createTextNode(date("Y-m-d H:i:s",time())));
													
					//write to xml file
					$doc->save('uploads/'.$username.'/'.$username.'_files.xml');	
				}
				else {
					$lastTaskResult = l("An error occurred while building your dataset. Please try again, or email <a href='mailto:fc-targeting-tool@rff.org'>fc-targeting-tool@rff.org</a> for assistance.","Se produjo un error al construir su conjunto de datos. Por favor, inténtelo de nuevo, o correo electrónico <a href='mailto:fc-targeting-tool@rff.org'>fc-targeting-tool@rff.org</a> para obtener ayuda.");
				};
			
			}
		pg_close($dbconn);
	}
	else {	
		writetologfile("Not cleared to go ahead with building SQL query");
	}
}

if(isset($_POST['deletedtablename'])){

	$tabletodelete = preg_replace('/[^A-Za-z0-9_]+/', '', $_POST['deletedtablename']);
	writetologfile("Attempting to delete table ". $tabletodelete);	

	if ((file_exists('uploads/'.$username.'/'.$username.'_files.xml'))) {
		$doc = new DOMDocument();
		$doc->load('uploads/'.$username.'/'.$username.'_files.xml');						
		$xp = new DOMXPath($doc);
		$recordoftablefound=0;
		
		//If deleted table was a "dataset":
		if ($_POST['tableisfile']==0) {
			$datasetsmatchingname = $xp->query('//datasets/dataset[datasetname="'.$tabletodelete.'"]');
			foreach ($datasetsmatchingname as $ds) {
				$recordoftablefound=1;
				if ($doc->documentElement->removeChild($ds)) {
					writetologfile("Deleted ".$tabletodelete." from XML dataset list");
				}
			}
		}
		else{
			//If deleted table was a "file"
			$filesmatchingname = $xp->query('//datasets/file[filename="'.$tabletodelete.'"]');
			foreach ($filesmatchingname as $file) {
				$recordoftablefound=1;
				if ($doc->documentElement->removeChild($file)) {
					writetologfile("Deleted ".$tabletodelete." from XML file list");
				}
			}
		
		}
		
		$doc->save('uploads/'.$username.'/'.$username.'_files.xml');
		
	}
		
	$dbconn = pg_connect("host=localhost port=5432 dbname=forestro_users_db user=forestro_users password=".$password_db);		
		if(!($dbconn)) {
			$lastTaskResult = l(writetologfile("Unable to connect to database."),"Incapaz de conectar a la base de datos.");
		}
		else {
			writetologfile("Connected to database.");
			if (($tabletodelete = preg_replace('/[^A-Za-z_0-9_]/', '', $tabletodelete)) && ($recordoftablefound==1)) {
				if ($_POST['tableisfile']==0) {
					$fulltabletodelete = 'userdata_'.$username.'_ds_'.$tabletodelete;
				}
				else {
					$fulltabletodelete = 'userdata_'.$username.'_fi_'.$tabletodelete;		
				}
				@writetologfile(pg_query($dbconn, 'DROP TABLE '.$fulltabletodelete.';'));
				$ret = writetologfile(pg_last_error($dbconn));
				if(strpos($ret,'does not exist') !== false) {
					$ret = l(writetologfile("Note: table ".$tabletodelete." not found to be deleted"),"Nota: tabla ".$tabletodelete." no se ha encontrado para ser eliminado");
				}
				else {
					$ret = l("Successfully deleted table ".$tabletodelete.".","Tabla ".$tabletodelete." eliminada con éxito.");
					writetologfile("Drop table command successful");
				}			
				$lastTaskResult = $ret;
			}
			else {
				echo l(writetologfile("Invalid table name or table not found in your repository. Query not run."),"Nombre de la tabla no válida o tabla que no se encuentran en su repositorio. Query no correr.");
			}
		}
	pg_close($dbconn);
}

?>

<script language="JavaScript">
		<!--
		
		function goToFCTT() {
			window.top.location.href = '../index_user.html';
			return true;
		}
		
		function showPleaseWait(elementID) {
			var butt = document.getElementById(elementID);
			butt.innerHTML= '<font color="red"><? echo l("Please Wait...","Por favor, espera..."); ?><font color="black">';
			return true;
		}
		//-->
		
		function checkUpload() {
			var goAhead=true;
			
			if(document.forms["uploadForm"].unitAnalysisUpload.value=="noneselected" || document.forms["uploadForm"].unitAnalysisUpload.value=="" || document.forms["uploadForm"].unitAnalysisUpload.value==null) {
				alert('<? echo l("Be sure to select the spatial unit of analysis for your file!","Asegúrese de seleccionar la unidad espacial de análisis para su archivo!"); ?>');
				goAhead=false;
			}
			if(document.forms["uploadForm"].dataSetName.value=="" || document.forms["uploadForm"].dataSetName.value==null) {
				alert('<? echo l("Whoops! You didn not indicate a name for your file.","¡Upa! Usted no indique un nombre para su archivo."); ?>');
				goAhead=false;
			}
			
			if(goAhead==true) {
				document.uploadForm.submit();
			}
			
			return true;
		}
		
		function download_sa1km() {
			window.top.location.href = 'unitofanalysis_shapefiles/sa_1km/sa_1km_r'+document.forms["downloadForm"].subdataset.value+'.zip';
			return true;
		}
		
		function deleteDatasetJS(datasetname) {	
			if (confirm("<? echo l("Are you sure you want to delete this dataset '","¿Seguro que quieres borrar este conjunto de datos ") ?>"+datasetname+"'?")==true) {
				document.forms["deleteTableForm"].deletedtablename.value = datasetname;
				document.forms["deleteTableForm"].tableisfile.value = 0;
				document.deleteTableForm.submit();
			} 
			return true;
		}
		
		function deleteFileJS(filename) {		
			if (confirm("<? echo l("Are you sure you want to delete the file '","¿Seguro que quieres borrar este archivo ") ?>"+filename+"'?")==true) {
				document.forms["deleteTableForm"].deletedtablename.value = filename;
				document.forms["deleteTableForm"].tableisfile.value = 1;
				document.deleteTableForm.submit();
			}
			return true;
		}
		
		function updateAttributeListJSRelay(priorityAttribute) {
			var dataSetName=document.getElementById(priorityAttribute+'DataSet').value;

			if(document.getElementById("unitAnalysisCompose").value == "custom") {
				document.getElementById('carbonDataSet').value = dataSetName; updateAttributeListJS('carbon');
				document.getElementById('bioDataSet').value = dataSetName; updateAttributeListJS('bio'); document.getElementById('bioDataSet').disabled = true;
				document.getElementById('hydroDataSet').value = dataSetName; updateAttributeListJS('hydro'); document.getElementById('hydroDataSet').disabled = true;
				document.getElementById('costDataSet').value = dataSetName; updateAttributeListJS('cost'); document.getElementById('costDataSet').disabled = true; 
				document.getElementById('riskDataSet').value = dataSetName; updateAttributeListJS('risk'); document.getElementById('riskDataSet').disabled = true;
				document.getElementById('forestDataSet').value = dataSetName; updateAttributeListJS('forest'); document.getElementById('forestDataSet').disabled = true;
				document.getElementById('infoDataSet').value = dataSetName; updateAttributeListJS('info'); document.getElementById('infoDataSet').disabled = true;
			}
			else {
				document.getElementById('carbonDataSet').disabled = false; document.getElementById('bioDataSet').disabled = false; document.getElementById('hydroDataSet').disabled = false; document.getElementById('costDataSet').disabled = false; document.getElementById('riskDataSet').disabled = false; document.getElementById('forestDataSet').disabled = false; document.getElementById('infoDataSet').disabled = false;
				if(document.getElementById("unitAnalysisCompose").value == "mex_pred") {document.getElementById('infoDataSet').disabled=true;};
				updateAttributeListJS(priorityAttribute)
			}
		}
		
		function updateAttributeListJS(priorityAttribute) {
			var dataSetName=document.getElementById(priorityAttribute+'DataSet').value;
			var unifOfAnalysisName=document.getElementById("unitAnalysisCompose").value;
			
			if(dataSetName == "obd" || dataSetName == "") {
				if(unifOfAnalysisName=="ca_adm" || unifOfAnalysisName=="ca_10km" || unifOfAnalysisName=="ca_1km"){
					if(priorityAttribute=="carbon"){
						document.getElementById('carbonAttributeListDiv').innerHTML='<? echo l("Attribute","Atributo"); ?>: <select name = "carbonAttribute" id = "carbonAttribute" onChange=updateAttributeJS("carbon")><option value="carbon"><? echo l("Non-soil carbon (biomass)","Carbono no suelo (biomasa)");?></option><option value="carbon_total"><? echo l("Total carbon (biomass and soil)","Carbono total (biomasa y suelo)");?></option><option value="carbon_soil"><? echo l("Carbon in soil","Carbono en el suelo");?></option></select>';
						document.getElementById('carbonComposeAttribute').value = 'carbon';
					}
					else if(priorityAttribute=="bio"){
						document.getElementById('bioAttributeListDiv').innerHTML='<? echo l("Attribute","Atributo"); ?>: <select name = "bioAttribute" id = "bioAttribute" onChange=updateAttributeJS("bio")><option value="bio"><? echo l("RWRI index (global weights)","Índice RWRI (pesos globales)");?></option><option value="bio_loc"><? echo l("RWRI index (national weights)","Índice RWRI (pesos nacionales)");?></option><option value="bio_count"><? echo l("Threatened species count","Número especies amenazadas");?></option></select>';
						document.getElementById('bioComposeAttribute').value = 'bio';
					}
					else{
						document.getElementById(priorityAttribute+'AttributeListDiv').innerHTML="";
					}
				}
				else{
					document.getElementById(priorityAttribute+'AttributeListDiv').innerHTML="";
				}				
			}
			else {
				if(priorityAttribute=="info"){
					document.getElementById(priorityAttribute+'AttributeListDiv').innerHTML='<? echo l("Attribute","Atributo"); ?>: <select name = "'+priorityAttribute+'Attribute" id = "'+priorityAttribute+'Attribute" onChange=updateAttributeJS("'+priorityAttribute+'")>'+attributeListsAllNotJustNumeric[dataSetName]+'</select>';
				}
				else{
					document.getElementById(priorityAttribute+'AttributeListDiv').innerHTML='<? echo l("Attribute","Atributo"); ?>: <select name = "'+priorityAttribute+'Attribute" id = "'+priorityAttribute+'Attribute" onChange=updateAttributeJS("'+priorityAttribute+'")>'+attributeLists[dataSetName]+'</select>';
				}
				document.getElementById(priorityAttribute+'ComposeAttribute').value=firstAttribute[dataSetName];
			}
					
			document.getElementById(priorityAttribute+'ComposeDataSet').value=dataSetName;
			return true;
		}		

		function updateAttributeJS(priorityAttribute) {
			document.getElementById(priorityAttribute+'ComposeAttribute').value=document.getElementById(priorityAttribute+'Attribute').value;
			return true;
		}
		
		function updateDataSetListJS() {
			
			var fileListHTML = dataSetLists[document.getElementById("unitAnalysisCompose").value];
			
			if(typeof fileListHTML==='undefined' && document.getElementById("unitAnalysisCompose").value == "custom"){
				fileListHTML="<option value=''><? echo l("No custom files found.","No hay archivos personalizados.");?></option>";
				document.getElementById('carbonDataSet').disabled = true
			}
	
			if(document.getElementById("unitAnalysisCompose").value != "custom") {
				fileListHTML = "<option value='obd'><? echo l($onBoardName,$onBoardNameSpan); ?></option>" + fileListHTML;
			}	
			
			document.getElementById("carbonDataSet").innerHTML = fileListHTML;
			document.getElementById("carbonDataSet").selectedIndex = 0;
			document.getElementById("carbonDataSet").text = document.getElementById("carbonDataSet").options[0].text;
			updateAttributeListJSRelay("carbon");
		
			document.getElementById("bioDataSet").innerHTML = fileListHTML;
			document.getElementById("bioDataSet").selectedIndex = 0;
			document.getElementById("bioDataSet").text = document.getElementById("bioDataSet").options[0].text;
			updateAttributeListJSRelay("bio");

			document.getElementById("hydroDataSet").innerHTML = fileListHTML;
			document.getElementById("hydroDataSet").selectedIndex = 0;
			document.getElementById("hydroDataSet").text = document.getElementById("hydroDataSet").options[0].text;
			updateAttributeListJSRelay("hydro");
			
			document.getElementById("costDataSet").innerHTML = fileListHTML;
			document.getElementById("costDataSet").selectedIndex = 0;
			document.getElementById("costDataSet").text = document.getElementById("costDataSet").options[0].text;
			updateAttributeListJSRelay("cost");

			document.getElementById("riskDataSet").innerHTML = fileListHTML;
			document.getElementById("riskDataSet").selectedIndex = 0;
			document.getElementById("riskDataSet").text = document.getElementById("riskDataSet").options[0].text;
			updateAttributeListJSRelay("risk");
			
			document.getElementById("forestDataSet").innerHTML = fileListHTML;
			document.getElementById("forestDataSet").selectedIndex = 0;
			document.getElementById("forestDataSet").text = document.getElementById("forestDataSet").options[0].text;
			updateAttributeListJSRelay("forest");
			
			if(document.getElementById("unitAnalysisCompose").value=="mex_pred"){
				document.getElementById("infoDataSet").disabled=true;
			}
			else {
				document.getElementById("infoDataSet").disabled=false;
				document.getElementById("infoDataSet").innerHTML = fileListHTML;
				document.getElementById("infoDataSet").selectedIndex = 0;
				document.getElementById("infoDataSet").text = document.getElementById("infoDataSet").options[0].text;
				updateAttributeListJSRelay("info");
			}
		}
	
		var dataSetLists = [];
		var attributeLists = [];
		var attributeListsAllNotJustNumeric = [];
		var firstAttribute = [];
		<?php 
			$fileListHTML ="";

			$dbconn = pg_connect("host=localhost port=5432 dbname=forestro_users_db user=forestro_users password=".$password_db);		
			if($dbconn) {
				//$lastTaskResult = writetologfile("Connected to database.");				
				if (file_exists('uploads/'.$username.'/'.$username.'_files.xml')) {				
					$doc = new DOMDocument();
					$doc->load('uploads/'.$username.'/'.$username.'_files.xml');
					
					$files = $doc->getElementsByTagName("file");
					if(count($files)>0){
						foreach( $files as $file ) {
							$thisAttributeListHTML="";
							$filename = preg_replace('/[^A-Za-z0-9_]+/', '', $file->getElementsByTagName('filename')->item(0)->nodeValue);
							
							$unitofanalysis = $file->getElementsByTagName('unitofanalysis')->item(0)->nodeValue;
							
							echo 'if(dataSetLists["'.$unitofanalysis.'"]==null){dataSetLists["'.$unitofanalysis.'"]=""};';						
							echo 'dataSetLists["'.$unitofanalysis.'"]+="<option value=\''.$filename.'\'>'.$filename.'</option>";';
						  
							// Get list of numeric attributes (Got list of all POSTGRESQL numeric types from http://www.postgresql.org/docs/9.0/static/datatype-numeric.html)
							$HTMLlist = pg_query($dbconn, "SELECT column_name FROM information_schema.columns WHERE table_name = 'userdata_".$username.'_fi_'.$filename."' AND (data_type = 'smallint' OR data_type = 'integer' OR data_type = 'bigint'  OR data_type = 'decimal' OR data_type = 'numeric' OR data_type = 'real' OR data_type = 'double precision' OR data_type = 'serial' OR data_type = 'bigserial');");
							
							$attributes = pg_fetch_all($HTMLlist);
							
							if (is_array($attributes)) {
								$on_first_attribute = true;
								foreach($attributes as $thisAttribute) {
									foreach($thisAttribute as $attributeName) {
										if($on_first_attribute) {
											echo 'firstAttribute["'.$filename.'"]="'.$attributeName.'";';
											$on_first_attribute = false;
										}
										$thisAttributeListHTML .= "<option>".$attributeName."</option>";
									}
								}
							}
							echo 'attributeLists["'.$filename.'"]="'.$thisAttributeListHTML.'";';
							
							// Get list of ALL attributes for identifying_info
							$HTMLlist = pg_query($dbconn, "SELECT column_name FROM information_schema.columns WHERE table_name = 'userdata_".$username.'_fi_'.$filename."';");
		
							$attributes = pg_fetch_all($HTMLlist);
							
							if (is_array($attributes)) {
								$on_first_attribute = true;
								foreach($attributes as $thisAttribute) {
									foreach($thisAttribute as $attributeName) {
										if($on_first_attribute) {
											echo 'firstAttribute["'.$filename.'"]="'.$attributeName.'";';
											$on_first_attribute = false;
										}
										$thisAttributeListHTML .= "<option>".$attributeName."</option>";
									}
								}
							}
							echo 'attributeListsAllNotJustNumeric["'.$filename.'"]="'.$thisAttributeListHTML.'";';
						}
					}
					else{
						$fileListHTML = '<option value="none">'.l('No datasets uploaded','No hay conjuntos de datos subidos').'</option>';
					}
				}
				else {
					$fileListHTML = '<option value="none">'.l('No datasets uploaded','No hay conjuntos de datos subidos').'</option>';
				} 							
			}
			pg_close($dbconn);			

			
		?>	
		
</script>
	<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
	"http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

	<h3>
	<font color="red">	
			<br><br>
			<? echo $lastTaskResult ?>
	<font color="black">
	</h3>

	<font color="black">
	<table cellpadding=10>
		<tr valign = "top" width=100%>
			<td width = 60%>
				<fieldset class="fieldset">
					<legend><? echo l("Step 1: Upload data","Paso 1: Cargar datos"); ?></legend>
					<? echo l("Note: these files will only be available to you, not any other users",""); ?>
					<form name="downloadForm" id="downloadForm">
					<ol type = "A">
					  <li><? echo l("Choose a spatial unit of analysis and download appropriate shapefile template (ZIP format): ","Descarga su unidad de análisis shapefile preferida (formato ZIP): "); ?>
					  <ul>
						<li> <a href="unitofanalysis_shapefiles/ca_adm.zip"><? echo l("Central America Administrative Boundaries (mostly counties)", "Límites Administrativos Centroamérica"); ?></a>
						<li> <a href="unitofanalysis_shapefiles/ca_10km.zip"><? echo l("Central America 10km x 10km cell polygons", "Centroamérica polígonos rejilla 10km"); ?></a>
						<li> <a href="unitofanalysis_shapefiles/ca_1km.zip"><? echo l("Central America 1km x 1km cell polygons", "Centroamérica polígonos rejilla 1km"); ?></a>
						<li> <a href="unitofanalysis_shapefiles/mex_250m_pt.zip"><? echo l("Mexico 250m cell centroids: ","México rejilla 250m: "); ?></a>
						<li> <? echo l('Mexico property polygons are not available for download. Instead, please use Mexico 250m cell centroids and choose "Aggregate from 250m grid to Mexico predios" below (max 5000 points, except by <a href="mailto:fc-targeting-tool@rff.org">request</a>).', 'Para predios de México, use la rejilla 250m y seleccione "Agregada de 250m rejilla para México predios" abajo (max 5000 puntos, excepto <a href="mailto:fc-targeting-tool@rff.org">por la petición</a>).'); ?>
						<li> <a href="unitofanalysis_shapefiles/sa_10km.zip"><? echo l("South America 10km x 10km cell polygons", "Sudamérica polígonos rejilla 10km"); ?></a>
						<li> <? echo l('For South America 1km cells, please download the desired subdatasets here, complete with FCTT data. You may combine these datasets yourself using GIS software and upload using the "Custom" unit of analysis below (max 150,000 points, except by <a href="mailto:fc-targeting-tool@rff.org">request</a>).', 'Para células de 1km de Sudamérica, descargue los subdatasets deseados aquí, completos con datos FCTT. Puede combinar estos conjuntos de datos usando el software GIS y cargar usando la unidad de análisis "Personalizada" a continuación (max 150,000 puntos, excepto <a href="mailto:fc-targeting-tool@rff.org">por la petición</a>).'); ?>
						<? echo l("Subdataset: ","Subdatos: "); ?> <select name = "subdataset" id = "subdataset">
							<option value=1>Ecuador</option>
							<option value=2>Bolivia-Santa Cruz</option>
							<option value=3>Bolivia-El Beni, La Paz</option>
							<option value=4>Bolivia-Others</option>
							<option value=5>Colombia-A</option>
							<option value=6>Colombia-B</option>
							<option value=7>Colombia-C</option>
							<option value=8>Brazil-A</option>
							<option value=9>Brazil-B</option>
							<option value=10>Brazil-C</option>
							<option value=11>Brazil-D</option>
							<option value=12>Brazil-E</option>
							<option value=13>Brazil-F</option>
							<option value=14>Brazil-G</option>
							<option value=15>Brazil-H(São Paulo)</option>
							<option value=16>Brazil-I</option>
							<option value=17>Brazil-J</option>
							<option value=18>Brazil-K</option>
							<option value=19>Brazil-L</option>
							<option value=20>Brazil-M(Mato Grosso I)</option>
							<option value=21>Brazil-N(Mato Grosso II)</option>
							<option value=22>Brazil-O(Pará I)</option>
							<option value=23>Brazil-P(Pará II)</option>
							<option value=24>Brazil-Q(Pará III)</option>
							<option value=25>Brazil-R(Amazonas I)</option>
							<option value=26>Brazil-S(Amazonas II)</option>
							<option value=27>Brazil-T(Amazonas III)</option>
							<option value=28>Guyana and Uruguay</option>
							<option value=29>Paraguay</option>
							<option value=30>Venezuela-Amazonas, Anzoátegui, and Bolívar</option>
							<option value=31>Venezuela-Others</option>
							<option value=32>Chile-A*</option>
							<option value=33>Suriname & Chile-B</option>
							<option value=34>Chile-C</option>
							<option value=35>Peru-A</option>
							<option value=36>Peru-B</option>
							<option value=37>Peru-C</option>
							<option value=38>Argentina-A(Buenos Aires)</option>
							<option value=39>Argentina-B</option>
							<option value=40>Argentina-C</option>
							<option value=41>Argentina-D</option>
							<option value=42>Argentina-E</option>
							<option value=43>Argentina-F</option>
							<option value=44>Argentina-G</option>
							<option value=45>Argentina-H</option>
							<option value=46>Argentina-I</option>
						</select>  <a href='javascript:void' onClick=download_sa1km()><? echo l("Download","Desgargar"); ?></a>
					  </ul>	
					  <li><? echo l("For South America: choose a spatial unit of analysis and download appropriate shapefile template (ZIP format): ","Descarga su unidad de análisis shapefile preferida (formato ZIP): "); ?>
					  <li><? echo l("Using these polygons or centroids as a template, add values from your own data in ArcMap or <a href='https://www.qgis.org' target='_blank'>QGIS</a>, keeping and leaving unchanged the attribute <b>fctt_id</b>.","El uso de estos polígonos o centroides como plantilla, añada los valores de sus propios datos en ArcMap o <a href='https://www.qgis.org' target='_blank'>QGIS</a>, manteniendo y dejando inalterada la atributo <b>fctt_id</b>."); ?></li>
					  <?// echo "<li>".l("If you do not wish to use the original onboard data or shapes, you may select Custom as the unit of analysis and upload a shapefile with arbitrary shapes. This shapefile must have a unique numeric attribute named <b>fctt_id</b>. Attributes from multiple shapefiles can be joined on this attribute.","Si no desea utilizar los datos originales de a bordo o formas, puede seleccionar Personalizado como la unidad de análisis y cargar un archivo de formas con formas arbitrarias. Esta shapefile debe tener un atributo único llamado <b> fctt_id </b>. Los atributos de varios archivos de forma se pueden unir en este atributo."); ?>
					  <li><? echo l("Upload the modified data: ","Sube los datos modificados: "); ?>
					 </ol>
					</form>
					<div id="uploadDataOuputLabel" align = "center">
					<form action="uploadData.php" method="post" enctype="multipart/form-data"  onSubmit="return showPleaseWait('uploadDataOuputLabel')" name="uploadForm" id="uploadForm">
					 <fieldset  class="fieldset-auto-width-small">
					  <? echo l("Choose updated ZIP file:", "Elegir archivo ZIP actualización:"); ?> <input type="file" name="uploadData"><br>
					  <? echo l("Unit of Analysis:","Unidad de Análisis:"); ?> <select name = "unitAnalysisUpload" id = "unitAnalysisUpload"><option value="noneselected"><? echo l("Choose...","Seleccionar..."); ?></option><option value="ca_adm"><? echo l($caAdmName,$caAdmNameSpan); ?></option><option value="ca_10km"><? echo l($ca10kmName,$ca10kmNameSpan); ?></option><option value="ca_1km"><? echo l($ca1kmName,$ca1kmNameSpan); ?></option> <!--<option value="ca_mex_250m"><?// echo l($caMex250mName,$caMex250mNameSpan); ?></option>--><option value="mex_pred"><? echo l($mexPredName,$mexPredNameSpan); ?></option><option value="sa_10km"><? echo l($sa10kmName,$sa10kmNameSpan); ?></option><option value="custom"><? echo l($customName, $customNameSpan); ?></option></select><br>
					  <? echo l("Give this file a name:","Dale este archivo un nombre:"); ?> <input type="text" name="dataSetName"><br>
					  <!-- <input type="checkbox" name = "chksharedata">Share this file with other users on the <a href="communitydata.php">Commmunity Data Layers</a> page.</input><br> -->
					  <input type="button" onClick=checkUpload() value="<? echo l('Upload File','Subir Archivo'); ?>">
					  </fieldset>
					</form>
					</div>	
					<? echo l("*Note: the `Chile-A' subdataset constructs the hydrological benefit by normalizing water balance and water quality changes by their mean in the study area, rather than their median. Caution should be exercised in combining this with the other datasets.","* Nota: el subdataset `Chile-A 'construye el beneficio hidrológico mediante la normalización del balance hídrico y los cambios en la calidad del agua por su media en el área de estudio, en lugar de su mediana. Se debe tener precaución al combinar esto con los otros conjuntos de datos."); ?>					
				</fieldset>
			</td><td>
				<fieldset class="fieldset">
					<legend>Uploaded files</legend>
					<?php 			
						echo "<form method='post' action='' name='deleteTableForm' id='deleteTableForm'><input type='hidden' id='deletedtablename' name='deletedtablename' value='' /><input type='hidden' id='tableisfile' name='tableisfile' value='' /></form>";
						
						if (file_exists('uploads/'.$username.'/'.$username.'_files.xml')) {				
							$doc = new DOMDocument();
							$doc->load('uploads/'.$username.'/'.$username.'_files.xml');
							
							$files = $doc->getElementsByTagName("file");
							if ($doc->getElementsByTagName("file")->length>0) {
								echo "<table cellpadding='10' border=1><tr><td><b><u>Name</u></b></td><td><b><u>".l("Unit of Analysis","Unidad de Análisis")."</u></b></td><td><b><u>Size</u></b></td><td><b><u>".l("Original File Name","Nombre de archivo original")."</u></b></td><td><b><u>".l("Uploaded","Subido")."</u></b></td><td><b><u>".l("Delete","Borrar")."</u></b></td></tr>";
								foreach( $files as $file ) {
								  $filename = $file->getElementsByTagName('filename')->item(0)->nodeValue;
								  echo "<tr>";
								  echo "<td>{$filename}</td>";
								  echo "<td>".returnUnitOfAnalysisName($file->getElementsByTagName('unitofanalysis')->item(0)->nodeValue)."</td>";
								  echo "<td>{$file->getElementsByTagName('size')->item(0)->nodeValue}</td>";
								  echo "<td>{$file->getElementsByTagName('originalfilename')->item(0)->nodeValue}</td>";
								  echo "<td>{$file->getElementsByTagName('datetime')->item(0)->nodeValue}</td>";				
								  echo "<td><center><button onClick=deleteFileJS('".$filename."');>".l("Delete","Borrar")."</button>".$deleteFileOutput."</center></td>";
								  echo "</tr>";
								}
								echo "</table>";
							}
							else{
								echo "<center><b>".l("No files uploaded yet","No hay archivos se han subido aún")."</b></center>";
							}
						}
						else {
							echo "<center><b>".l("No files uploaded yet","No hay archivos se han subido aún")."</b></center>";
						} 
					?>
				</fieldset><br>
				<center><button id = "nextButton" class = "bigSubmitButton" onClick="document.getElementById('composeDiv').scrollIntoView();"><? echo l("Next","Siguiente"); ?></button></center>
			</td>
		</tr><tr valign = "top" width=100%>
			<td colspan=2>
				<div id="composeDiv">
				</div>
			</td>
		</tr>
	</table>
	<table cellpadding=10>
		<tr valign = "top" width=100%>
			<td width = 65%>
				<fieldset  class="fieldset" width = 100%>
					<legend><? echo l("Step 2: Create new dataset by joining uploaded and onboard data","Paso 2: Crear nuevo conjunto de datos al unirse subido a bordo y datos"); ?></legend>
					<form method='post' action='' name='updateAttributeListForm' id='updateAttributeListForm'>			
						<input type='hidden' id='priorityattribute' name='priorityattribute' value='' />
						<input type='hidden' id='datasetnametoloadfrom' name='datasetnametoloadfrom' value='' />
					</form>
					<form method='post' action='' name='composeDataForm' id='composeDataForm'>
						<input type='hidden' id='carbonComposeDataSet' name='carbonComposeDataSet' value='obd' /><input type='hidden' id='carbonComposeAttribute' name='carbonComposeAttribute' value='carbon' />
						<input type='hidden' id='bioComposeDataSet' name='bioComposeDataSet' value='obd' /><input type='hidden' id='bioComposeAttribute' name='bioComposeAttribute' value='bio' />
						<input type='hidden' id='hydroComposeDataSet' name='hydroComposeDataSet' value='obd' /><input type='hidden' id='hydroComposeAttribute' name='hydroComposeAttribute' value='hydro' />
						<input type='hidden' id='costComposeDataSet' name='costComposeDataSet' value='obd' /><input type='hidden' id='costComposeAttribute' name='costComposeAttribute' value='cost' />
						<input type='hidden' id='riskComposeDataSet' name='riskComposeDataSet' value='obd' /><input type='hidden' id='riskComposeAttribute' name='riskComposeAttribute' value='risk' />
						<input type='hidden' id='forestComposeDataSet' name='forestComposeDataSet' value='obd' /><input type='hidden' id='forestComposeAttribute' name='forestComposeAttribute' value='forarea' />					
						<input type='hidden' id='infoComposeDataSet' name='infoComposeDataSet' value='obd' /><input type='hidden' id='infoComposeAttribute' name='infoComposeAttribute' value='identifying_info' />
						  <? echo l("Choose a name for your new dataset:","Elija un nombre para el nuevo conjunto de datos:"); ?> <input type="text" name="dataSetNameCompose"><br><br>
						  <? echo l("Choose a spatial unit of analysis:","Elija una unidad de análisis:"); ?> <select name = "unitAnalysisCompose" id = "unitAnalysisCompose" onChange=updateDataSetListJS()><option><? echo l("Choose...","Seleccionar..."); ?></option><option value="ca_adm"><? echo l($caAdmName,$caAdmNameSpan); ?></option><option value="ca_10km"><? echo l($ca10kmName,$ca10kmNameSpan); ?></option><option value="ca_1km"><? echo l($ca1kmName,$ca1kmNameSpan); ?></option><!--<option value="ca_mex_250m"><? //echo l($caMex250mName,$caMex250mNameSpan); ?></option>--><option value="mex_pred"><? echo l($mexPredName,$mexPredNameSpan); ?></option><option value="sa_10km"><? echo l($sa10kmName,$sa10kmNameSpan); ?></option><option value="custom"><? echo l($customName, $customNameSpan); ?></option></select><br><br>
						  <? echo l("Choose whether to use uploaded or onboard data for each variable:","Seleccione si desea utilizar los datos cargados a bordo o para cada variable:"); ?> <br><br>
							<table cellpadding=2>																		
								<tr><td width = 20></td><td><? echo l("Carbon","Carbono"); ?> </td><td><? echo l("File","Archivo"); ?>: <select name = "carbonDataSet" id = "carbonDataSet" onChange=updateAttributeListJSRelay('carbon')><option value="obd"><? echo l($onBoardName,$onBoardNameSpan); ?></option></select></td><td><div id="carbonAttributeListDiv" name="carbonAttributeListDiv"></div></td></tr>
								<tr><td width = 20></td><td><? echo l("Biodiversity","Biodiversidad"); ?> </td><td><? echo l("File","Archivo"); ?>: <select name = "bioDataSet" id = "bioDataSet" onChange=updateAttributeListJSRelay('bio')><option value="obd"><? echo l($onBoardName,$onBoardNameSpan); ?></option></select></td><td><div id="bioAttributeListDiv" name="bioAttributeListDiv"></div></td></tr>
								<tr><td width = 20></td><td><? echo l("Hydrological services","Servicios hidrológicos"); ?> </td><td><? echo l("File","Archivo"); ?>: <select name = "hydroDataSet" id = "hydroDataSet" onChange=updateAttributeListJSRelay('hydro')><option value="obd"><? echo l($onBoardName,$onBoardNameSpan); ?></option></select></td><td><div id="hydroAttributeListDiv" name="hydroAttributeListDiv"></div></td></tr>
								<tr><td width = 20></td><td><? echo l("Cost","Costo"); ?> </td><td><? echo l("File","Archivo"); ?>: <select name = "costDataSet" id = "costDataSet" onChange=updateAttributeListJSRelay('cost')><option value="obd"><? echo l($onBoardName,$onBoardNameSpan); ?></option></select></td><td><div id="costAttributeListDiv" name="costAttributeListDiv"></div></td></tr>
								<tr><td width = 20></td><td><? echo l("Risk","Riesgo"); ?> </td><td><? echo l("File","Archivo"); ?>: <select name = "riskDataSet" id = "riskDataSet" onChange=updateAttributeListJSRelay('risk')><option value="obd"><? echo l($onBoardName,$onBoardNameSpan); ?></option></select></td><td><div id="riskAttributeListDiv" name="riskAttributeListDiv"></div></td></tr>
								<tr><td width = 20></td><td><? echo l("Forest cover percentage","Porcentaje de cobertura forestal"); ?> </td><td><? echo l("File","Archivo"); ?>: <select name = "forestDataSet" id = "forestDataSet" onChange=updateAttributeListJSRelay('forest')><option value="obd"><? echo l($onBoardName,$onBoardNameSpan); ?></option></select></td><td><div id="forestAttributeListDiv" name="forestAttributeListDiv"></div></td></tr>
								<tr><td width = 20></td><td><? echo l("Identifying information","Información de identificación"); ?> </td><td><? echo l("File","Archivo"); ?>: <select name = "infoDataSet" id = "infoDataSet" onChange=updateAttributeListJSRelay('info')><option value="obd"><? echo l($onBoardName,$onBoardNameSpan); ?></option></select></td><td><div id="infoAttributeListDiv" name="infoAttributeListDiv"></div></td></tr>
							</table><br>
						<center><input type="submit" id="composedataset" name="composedataset" value="<?php echo l("Create new dataset","Crear nuevo conjunto de datos"); ?>"></center> <?php echo " ".$composeDataOutput ?>
						<br> <? echo l("Note: when you click this button your dataset will appear in the box to the right.","Nota: al hacer clic en este botón el conjunto de datos aparecerá en el cuadro de la derecha."); ?>
					</form>
				</fieldset>
			</td><td>
				<fieldset class="fieldset-auto-width">
				<legend><? echo l("New datasets available for use","Nuevos conjuntos de datos disponibles para su uso"); ?></legend>
				<?php 			
					if (file_exists('uploads/'.$username.'/'.$username.'_files.xml')) {				
						$doc = new DOMDocument();
						$doc->load('uploads/'.$username.'/'.$username.'_files.xml');
						
						
						$datasets = $doc->getElementsByTagName("dataset");
						if(count($datasets>0)){
							echo "<table cellpadding='10' border=1><tr><td><b><u>Name</u></b></td><td><b><u>".l("Unit of Analysis","Unidad de Análisis")."</u></b></td><td><b><u>".l("Created","Creado")."</u></b></td><td><b><u>".l("Delete","Borrar")."</u></b></td></tr>";
							foreach( $datasets as $dataset ) {
							  $datasetname = $dataset->getElementsByTagName('datasetname')->item(0)->nodeValue;
							  echo "<tr>";
							  echo "<td>{$datasetname}</td>";
							  echo "<td>{$dataset->getElementsByTagName('unitofanalysis')->item(0)->nodeValue}</td>";
							  echo "<td>{$dataset->getElementsByTagName('datetime')->item(0)->nodeValue}</td>";
							  echo "<td><center><button onClick=deleteDatasetJS('".$datasetname."');>".l("Delete","Borrar").".</button>".$deleteDataOutput."</center></td>";
							  echo "</tr>";
							}
							echo "<tr><td><b>".l("Original onboard data","Datos a bordo original")."</b><td><center>".l("All","Todos")."</center></td><td/><td/>";
						}
						else {
							echo "<b><center>".l("Original onboard data active. <br> No new datasets uploaded yet.","De datos a bordo originales activos. <br> No hay nuevos conjuntos de datos se han subido aún.")."</b></center>";
						}
					}
					else {
						echo "<b><center>".l("Original onboard data active. <br> No new datasets uploaded yet.","De datos a bordo originales activos. <br> No hay nuevos conjuntos de datos se han subido aún.")."</b></center>";
					}
					echo "</table>";
				?>
			</fieldset>			
				<br><br>
				<center><button id = "nextButton2" class = "bigSubmitButton" onClick="document.getElementById('reloadDiv').scrollIntoView();"><? echo l("Next","Siguente"); ?></button></center>
			</td>		
		</tr>
	</table>
	<br><br>
		<div id="reloadDiv">
		</div>
		<fieldset class="fieldset">
			<legend><? echo l("Reload & Return to FCTT","Recargar y Regreso a FCTT"); ?></legend>
			<center><button id = "reloadFCTT2" class = "bigSubmitButton" onClick="window.top.location.href = '../index_user.html'"><? echo l("Reload FCTT","Recargar FCTT"); ?></button></center><br>
			<? echo l('Your new dataset will be available as a choice of Dataset in the "Define Study Area" menu of the FCTT.','Su nuevo conjunto de datos estará disponible como una opción de conjunto de datos en el menú "Definir Área de Estudio" del FCTT.'); ?>
		</fieldset>
	<br><br><br><br><br><br><br><br><br><br><br><br>
</body>
</html>
<?php

//Define quick function for writing to user logfile
	function writetologfile($textToWrite) {
		//fwrite($logfh, date("Y-m-d H:i:s",time())."--> ".$textToWrite."\r\n");
		file_put_contents('users/'.preg_replace('/[^A-Za-z0-9]/', '', $_POST['username']).'_logfile.txt', date("Y-m-d H:i:s",time())." --> ".$textToWrite."\r\n", FILE_APPEND);
		return $textToWrite;
	}	

//Figure out whether this is the local instance or not
	$isLocalHost = 0;
	if(file_exists('islocalhost.txt')) {$isLocalHost = 1;}

//Define function to choose between English and Spanish versions of a piece of text:
	function l($englishText, $spanishText) {
		$textInCurrentLanguage=$spanishText;
		if($_GET["lang"]==1){
			$textInCurrentLanguage=$englishText;
		}
		return $textInCurrentLanguage;
	}
	
//REGISTRATION HANDLING SCRIPT:
$justRegistered=0;
$errors = array();
if(isset($_POST['register'])){
	$username=strtolower(preg_replace('/[^A-Za-z0-9]/', '', $_POST['username']));
	$password = substr(md5(microtime()),rand(0,26),5);
	$layerPIN = preg_replace('/[^A-Za-z0-9]+/', '', substr(sha1(microtime()),rand(0,26),10));
	$email = $_POST['email'];	
	$institution = $_POST['institution'];
	$location = $_POST['location'];	
	$use = $_POST['use'];	
	
	if(file_exists('users/' . $username .'.xml')){
		$errors[] = l('Username already exists','Nombre de usuario ya existe');
	}
	elseif($username != $_POST['username']){
		$errors[] = l('Username invalid (letters and numbers only, please)','Nombre de usuario no es válido (letras y números solamente, por favor)');
	}
	if($username == ''){
		$errors[] = l('Username blank','Nombre de usuario está vacío');
	}
	if(count($errors) == 0){
		//Create user XML file
		$xml = new SimpleXMLElement('<user></user>');
		//Salt with $layerPIN
		$xml->addChild('password', sha1(sha1($password.$layerPIN)));
		$xml->addChild('email', $email);
		$xml->addChild('institution', $institution);
		$xml->addChild('location', $location);
		$xml->addChild('use', $use);
		$xml->addChild('layerPIN', $layerPIN);
		$xml->addChild('datasizelimit', 200000000);
		$xml->addChild('maxnumdatasets', 10);
		$xml->asXML('users/' . $username .'.xml');
		if (file_exists('users/' . $username .'.xml')) {						
			// Open/create user log file
			file_put_contents("users/".$username."_logfile.txt", date('Y-m-d H:i:s',time())." --> Logfile created \r\n", FILE_APPEND);
		
			writetologfile("Create user request");
					
			//get credentials for postgres
				if($isLocalHost){
					$myfile = fopen("../../appservers/apache-tomcat-7x/webapps/geoserver/data/security/cubicle.txt", "r") or die("Unable to authenticate!");
				}
				else {
					$myfile = fopen("../../geoserver/data/security/cubicle.txt", "r") or die("Unable to authenticate!");
				}
				$password_db = substr(sha1(sha1(fgets($myfile)."verybest")),0,9);
				fclose($myfile);
			
			//Create user upload directory
			
				if (!(file_exists("uploads/".$username."/"))) {
					if (!(mkdir("uploads/".$username."/", 0777))) {
						writetologfile("Error creating user directory");
					}
					else {
						writetologfile("User directory for ".$username." created");
					}
				}
				else {
					writetologfile("User directory created");
				}			
				
			//Add user's layerPIN to the postgres database

				if($isLocalHost){
					$dbconn = pg_connect("host=localhost port=5432 dbname=forestro_users_db user=postgres password=postgres");
				}
				else{
					$dbconn = pg_connect("host=localhost port=5432 dbname=forestro_users_db user=forestro_users password=".$password_db);
				}					
			
				if(!($dbconn)) {
					writetologfile("Unable to connect to database");
					echo l('Error creating user account. Please email us at ','Error al crear la cuenta de usuario. Por favor envíenos un email a ').'<a href="mailto:fc-targeting-tool@rff.org">fc-targeting-tool@rff.org</a>';
					die;
				}
				else {
					writetologfile("Connected to database. Adding LayerPIN to database:");
					writetologfile(".......".pg_query($dbconn, "INSERT INTO standingdesk (username, layerPIN) VALUES ('".$username."','".$layerPIN."');"));
				}
				
				//Add username to users.xml list
			if ((file_exists("users/userlist.xml"))) {
				$doc = new DOMDocument();
				$doc->load("users/userlist.xml");
				$root = $doc->documentElement;				
				$newuser=$root->appendChild($doc->createElement('user'));
				$newuser->appendChild($doc->createElement('username'))->appendChild($doc->createTextNode($username));
				if($doc->save("users/userlist.xml")){
					writetologfile("Username ".$username." added to userlist.xml");
				}
				else{
					writetologfile("File userlist.xml found but problem adding ".$username." to it.");
				}
			}
			else{
				writetologfile("Warning! File userlist.xml not found to add username to. Attempting to create now.");
				
				$doc = new DOMDocument();
				$doc->preserveWhiteSpace = false;
				$doc->formatOutput = true;
				$root = $doc->appendChild($doc->createElement('users'));							
				$newuser=$root->appendChild($doc->createElement('user'));
				$newuser->appendChild($doc->createElement('username'))->appendChild($doc->createTextNode($username));
				
					//Put len in there too :)
					$newuser=$root->appendChild($doc->createElement('user'));
					$newuser->appendChild($doc->createElement('username'))->appendChild($doc->createTextNode("len"));
					
				if($doc->save("users/userlist.xml")){
					writetologfile("File userlist.xml sucessfully created with username ".$username." as inaugural member!");
				}
				else{
					writetologfile("Unable to find userlist.xml and unable to create it.");
				}
		
			}
		
				writetologfile("Registration complete");
				$justRegistered = 1;
		}
		else {
			echo l('Error creating user account. Please email us at ','Error al crear la cuenta de usuario. Por favor envíenos un email a ').'<a href="mailto:fc-targeting-tool@rff.org">fc-targeting-tool@rff.org</a>';
			die;
		}		
					
	}

}

//LOGIN HANDLING SCRIPT
$error = 0;
if(isset($_POST['login'])){
	$username=preg_replace('/[^A-Za-z0-9]+/', '', $_POST['usernamelogin']);
	$password = $_POST['password'];
	if(file_exists('users/' . $username .'.xml')){
		$xml = new SimpleXMLElement('users/' . $username .'.xml', 0, true);
		if(sha1(sha1($password.$xml->layerPIN)) == $xml->password){
			$logfilenew = !file_exists('users/'.$username.'_logfile.txt');	
			if ($logfilenew) {
				//$xml = new SimpleXMLElement('<user></user>');
				//$xml->asXML("users/".$username."_logfile.txt");
				file_put_contents("users/".$username."_logfile.txt", date('Y-m-d H:i:s',time())." --> Logfile created \r\n", FILE_APPEND);
				//chmod("users/".$username."_logfile.txt", 0777);
			};
			file_put_contents("users/".$username."_logfile.txt", date('Y-m-d H:i:s',time())." --> Logged in as ".$username. " from IP: ".$_SERVER['REMOTE_ADDR']."\r\n", FILE_APPEND);
	
			//Create user directory if it doesn't already exist
			if (!(file_exists("uploads/".$username."/"))) {
				mkdir("uploads/".$username."/", 0777);
				file_put_contents("users/".$username."_logfile.txt", date('Y-m-d H:i:s',time())."User directory uploads/".$username."/ didn't exist, creating now.\r\n", FILE_APPEND);
			}
					
			session_start();			

			$_SESSION['application'] = "fctt519";
			$_SESSION['username'] = $username;
			$_SESSION['language'] = $_GET["lang"];
			$_SESSION['encryptedpass'] = sha1($_POST['password'].$xml->layerPIN);
						
			echo("<script type='text/javascript'>window.top.location.href = '../index_user.html'</script>;");
			die;
		}
	}
	$error = 2;
	if(!file_exists('users/' . $username .'.xml')){
		$error = 1;
	}
}
?>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
	"http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/xhtml">
<head>
	<title>FCTT Registration</title>
	<style type="text/css">
		/* CSS code to remove extra line skipped after h1, h2, h3 tags */
		h1, h2, h3 {
		display: inline;
		}
		
		/*Make big pretty submit buttons for splashscreen */
		.bigSubmitButton {
			width:150px;
			height:40px;
			background-color:teal;
			border-color:black;
			color:white;
			font-face:arial;
			font-size:20px;
			font-weight:bold;
		}
	</style>
</head>
<body link="orange" vlink="orange">
	
   <div style="background-color:rgba(0, 0, 100, 0.5);">
		<center>
		<font color="white" face="arial"><b><br>
		<h2><? echo l("You can use your own spatial data along with our onboard data", "Puede subir sus propios datos al FCTT mediante la creación de una cuenta gratuita"); ?><br>
		<h3><? echo l('To do that, please log in','Si ya tiene una cuenta, por favor entre a la derecha'); ?><br><br>
		</center>
		<table border=0 cellpadding=10>
			<tr>
				<td width=58%>
					<form method="post" action="" id="registerForm">		
							<?php					
							if($justRegistered==1){
								echo "<h2><center><font color='yellow'>";
								echo l('Success!','Éxito!');
								echo "</center><h3><br><font color='orange'>".l("Your username is ","Su nombre de usuario es ").$username.l(" and your password is: "," y su contraseña es: ")."<font color='yellow'>$password<font color='orange'>.";	
								$headers = 'From: fc-targeting-tool@rff.org' . "\r\n" .
									'Reply-To: fc-targeting-tool@rff.org' . "\r\n" .
									'Content-Type:text/plain;charset=utf-8' . "\r\n" .
									'X-Mailer: PHP/' . phpversion();
								if(filter_var($email, FILTER_VALIDATE_EMAIL) && mail($email, l("Your FCTT user account has been created","Su cuenta de usuario ha sido creada FCTT"), l("Thanks for signing up! Your username is ", "Gracias por registrarse! Su nombre de usuario es ").$username.l(" and your password is: "," y su contraseña es: ").$password.".", $headers)){
									echo "<br>".l("Your password has also been emailed to you at ","Su contraseña ha sido enviado por correo electrónico a usted en ") . $email . "<br>";
								} else {
									echo "<br>".l("Please write your password down somewhere safe.","Por favor, escriba su contraseña en un lugar seguro.")."<br>";
								}
								echo "<br>".l("You may now log in to the FCTT to the right.","Ahora puede iniciar sesión en el FCTT hacia la derecha");
								writetologfile("Email to fc-targeting-tool@rff.org status: ".mail("fc-targeting-tool@rff.org", "New user on FCTT:" .$username, $xml->asXML(), $headers));
							}
							else{
								echo '<font color="white"><b><center><h2>'.l("New User","Nuevo Usuario").'</h2></b><br><br></center>';
									if(count($errors) > 0){
										echo '<ul>';
										foreach($errors as $e){
											echo '<li>' . $e.'</li>';
										}
										echo '</ul>';
									}
								echo '  <font color="white">';
								echo '  <table width = 100%>';
								echo '  <tr><td><font color="yellow">*<font color="white"> '.l("Username (letters and numbers only): ","Nombre de usuario (sólo letras y números): ").'</td><td><input type="text" name="username" size="20" /></td></tr>';
								echo '	<tr><td>'.l("Email address (used to recover password): ","Correo-e (por recuperar contraseña): ").'</td><td><input type="text" name="email" size="20" /></td></tr>';
								echo '	<tr><td>'.l("Institution/Position:  ","Institución/Cargo: ").'</td><td><input type="text" name="institution" size="20" /><br>';
								echo '	<tr><td>'.l("City/Country: ","Ciudad/País: ").'</td><td><input type="text" name="location" size="20" />';
								echo '  </tr></table><br>';
								echo '	<div align = "center"><textarea name="use" rows="3" cols="50">'.l("Your intended use for the FCTT","Su uso previsto para el FCTT").'</textarea></div><br>';
								echo '  <div align = "left"><font color="yellow">* '.l("Required", "Requerido").'</div><font color="white">';
							}
							?>				
					</form>
				</td>
				<td width=2% height=100% rowspan=2>
					<center><div style="border-left:3px solid #FaF;height:280px"></div></center>
				</td>
				<td width=40% height=100% valign = "top">
					<form method="post" action="" id="loginForm">
							<font color="white"><center><b><h2><? echo l('Existing user login','Iniciar sesión de usuario existente'); ?></h2></b><br><br></center>			
							<font color = "red">
							<?php
							if($error==1){
								echo(l('Username ','Usuario ') . $username . l(' does not exist!',' no existe!'));
							}
							if($error==2){
								echo('<p>'.l("Incorrect password for user ","Contraseña incorrecta para el usuario ").$username.l(".  Remember that your password was assigned to you at registration, and delivered by email if you provided an email address.",". Recuerde que su contraseña ha sido asignada a usted en el registro, y entregado por correo electrónico si ha proporcionado una dirección de correo electrónico.").'</p>');
							}
							?>
							<font color="white">
							<table width=100%>
								<tr><td><font color="white"><? echo l("Username: ","Nombre de usuario: "); ?></td><td><input type="text" name="usernamelogin" size="20" /></td></tr>
								<tr><td><font color="white"><? echo l("Password: ","Contraseña: "); ?></td><td><input type="password" name="password" size="20" /></td></tr>
							</table>
							<br><a href = 'passwordreminder.php?lang=<? echo $_GET["lang"]."'>".l("Forgot username or password?","¿Olvidó su nombre de usuario o contraseña?"); ?></a>
					</form>
				</td>
			</tr>
			<tr>
				<td>
					<?php
						if(!($justRegistered==1)){
							echo "  <center><p><input type='submit' form='registerForm' value='".l("Register","Registrarse")."' name='register' class = 'bigSubmitButton'/></p><center>";
						}
					?>
				</td>
				<td>
					<center><p><input type="submit" form="loginForm" value="<? echo l('Login','Iniciar sesión'); ?>" name="login" class = "bigSubmitButton"/></p></center>
				</td>
			</tr>
		</table>
   </div>
</div>

</body>
</html>
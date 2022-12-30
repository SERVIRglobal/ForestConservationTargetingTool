<?php

//Define function to choose between English and Spanish versions of a piece of text:
	function l($englishText, $spanishText) {
		$textInCurrentLanguage=$spanishText;
		if($_GET["lang"]==1){
			$textInCurrentLanguage=$englishText;
		}
		return $textInCurrentLanguage;
	}
	
//REGISTRATION HANDLING SCRIPT

//Note: the "errors" array will be used both to display errors and informational messages to the user.
$errors = array();

if(isset($_POST['usernameselected'])){
	if(filter_var($_POST['emailrecover'], FILTER_VALIDATE_EMAIL)){
		$emailtolookfor = $_POST['emailrecover'];
		$usernametolookfor=preg_replace('/[^A-Za-z0-9]/', '', $_POST['usernamerecover']);
		
		$numMatchingUsers=0;
		
		if($usernametolookfor==""&&!($_POST['usernameselected']=="")){
			$usernametolookfor=$_POST['usernameselected'];
		}
		
		$lastuserfound = "";
		$matchingUsersList = "";

		//Get list of registered users
			$doc = new DOMDocument();
			$doc->load("users/userlist.xml");
			$users = $doc->getElementsByTagName("user");
			$xp = new DOMXPath($doc);
			
		foreach ($xp->query('//users/user') as $thisusername) {
			$filename = "users/".$thisusername->getElementsByTagName('username')->item(0)->nodeValue.".xml";
			$doc = new DOMDocument();
			$doc->load($filename);
			
			$emailsofthisuser = $doc->getElementsByTagName("email");
			$thisuser = basename($filename,".xml");
			//If somehow the user XML file has more than one email address tag, take the "first" one:
			$emailofthisuser=$emailsofthisuser->item(0)->nodeValue;
			
			if((strtolower($emailofthisuser)==strtolower($emailtolookfor))&&($usernametolookfor==""||$usernametolookfor==$thisuser)){
				$numMatchingUsers = $numMatchingUsers + 1;
				$lastuserfound=$thisuser;
				$matchingUsersList = $matchingUsersList . "<br>Username: <a href='javascript:void' onClick=submitUserNameJS('".$thisuser."')>".$thisuser."</a>";
			}
		
		}
				
		if($numMatchingUsers==0){
			$errors[] = l('No account matching your criteria was found. Please email us at ','No se encontraron cuenta que coinciden con sus criterios. Por favor envíenos un email a: '.$email.'. Por favor envíenos un email a ').'<a href="mailto:fc-targeting-tool@rff.org">fc-targeting-tool@rff.org</a>'.l(' for further assistance.',' para obtener más ayuda.');
		}	
		elseif (($numMatchingUsers>1) || ($usernametolookfor=="" && $numMatchingUsers>0)){
			$errors[] = l("The following users matched your query. Click the one whose password you would like to reset. <br>","Los siguientes usuarios que coincidan con tu consulta. Haga clic en el uno cuya contraseña desea restablecer. <br>").$matchingUsersList;
		}
		else {
			$username = $usernametolookfor;
			$email = $emailtolookfor;
			file_put_contents('users/'.$username.'_logfile.txt', date("Y-m-d H:i:s",time())." --> "."Password reset request received"."\r\n", FILE_APPEND);
			
			$doc = new DOMDocument();
			$doc->load('users/'.$username.'.xml');						
			
				$newPassword = substr(md5(microtime()),rand(0,26),5);
			
			$headers = 'From: fc-targeting-tool@rff.org' . "\r\n" .
				'Reply-To: fc-targeting-tool@rff.org' . "\r\n" .
				'Content-Type:text/plain;charset=utf-8' . "\r\n" .
				'X-Mailer: PHP/' . phpversion();
						
			$emailSent = filter_var($email, FILTER_VALIDATE_EMAIL) && mail($email, l("Your FCTT user password has been reset","Su FCTT contraseña se ha restablecido"), l("The password for user ".$username." has been reset to ".$newPassword.".","La contraseña para el usuario ".$usernametolookfor." se ha restablecido a ".$newPassword."."), $headers);

			if($emailSent){
				$errors[] = l("The password for user ".$username." has been reset and sent to ".$emailtolookfor.".","La contraseña para el usuario ".$usernametolookfor." se ha restablecido y enviado a ".$emailtolookfor.".")." <a href = 'splashscreen.php?lang=".$_GET["lang"]."'>"."<br><br>".l("Back to login screen","Volver a iniciar sesión")."</a>";
				file_put_contents('users/'.$username.'_logfile.txt', date("Y-m-d H:i:s",time())." --> "."Password reset email sending unsuccessful"."\r\n", FILE_APPEND);
			}else {
				$errors[] = l("We were unable to send an email to ".$emailtolookfor.". Your password has not been changed. For assistance, please send us a message at <a href='mailto:fc-targeting-tool@rff.org'>fc-targeting-tool@rff.org</a>.","No hemos podido enviar un correo a ".$emailtolookfor.". Su contraseña no se ha cambiado. Para obtener ayuda, por favor envíenos un mensaje a <a href='mailto:fc-targeting-tool@rff.org'> fc-targeting-tool@rff.org</a>")." <a href = 'splashscreen.php?lang=".$_GET["lang"]."'>"."<br><br>".l("Back to login screen","Volver a iniciar sesión")."</a>";
				file_put_contents('users/'.$username.'_logfile.txt', date("Y-m-d H:i:s",time())." --> "."Password reset email sending successful"."\r\n", FILE_APPEND);
			}
			
			//Recall, we're salting with layerPIN
			$doc->getElementsByTagName('password')->item(0)->nodeValue = sha1(sha1($newPassword.$doc->getElementsByTagName('layerPIN')->item(0)->nodeValue));
			
			if($emailSent){
				if($doc->save('users/'.$username.'.xml')){
					file_put_contents('users/'.$username.'_logfile.txt', date("Y-m-d H:i:s",time())." --> "."Password reset successful"."\r\n", FILE_APPEND);
				}
				else{
					$errors[] = l("We encountered an error in resetting your password. For assistance, please send us a message at <a href='mailto:fc-targeting-tool@rff.org'>fc-targeting-tool@rff.org</a>.","Hemos detectado un error en el restablecimiento de su contraseña. Para obtener ayuda, por favor envíenos un mensaje a <a href='mailto:fc-targeting-tool@rff.org'> fc-targeting-tool@rff.org</a>.");;
					file_put_contents('users/'.$username.'_logfile.txt', date("Y-m-d H:i:s",time())." --> "."Password reset unuccessful"."\r\n", FILE_APPEND);
					if($emailSent){mail($email, l("Correction: your FCTT user password has NOT been reset","Corrección: tu contraseña de usuario FCTT NO se ha restablecido"), l("Please ignore the previous email. Your FCTT password has not been changed.","Por favor ignora el email anterior. Su contraseña FCTT no se ha cambiado."), $headers);}
				}
			}
			
		}
	}
	else{
		$errors[] = l("The email address entered is not a valid email address. Please enter the email address again.","La dirección de correo electrónico que introdujo no es un email válido. Por favor, introduzca la dirección de correo electrónico de nuevo.");
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
			width:250px;
			height:40px;
			background-color:teal;
			border-color:black;
			color:white;
			font-face:arial;
			font-size:20px;
			font-weight:bold;
		}
	</style>
	
	<script language="JavaScript">
		function submitUserNameJS(userNameJS) {
			document.forms["recoverForm"].usernameselected.value = userNameJS;
			//alert(document.forms[""])
			//document.getElementById("recover").click();
			document.recoverForm.submit();
			return true;
		}
	</script>
</head>
<body link="orange" vlink="orange">
	
   <div style="background-color:rgba(0, 0, 100, 0.5); padding-left:50px;">
		<center>
		<font color="white" face="arial"><b><br>
		<h1><? echo l("Password reset form", "Formulario restablecer contraseña"); ?></h1><br><br>
		<form method="post" action="" name="recoverForm" id="recoverForm">
		<input type='hidden' id='usernameselected' name='usernameselected' value='' />
			<table width = 55%><tr><td>
			<font style="weight:bold" color="white">
			<?
				if(count($errors) > 0){
					echo '<ul>';
					foreach($errors as $e){
						echo '<li>' . $e.'</li>';
					}
					echo '</ul>';
				
				echo "<center><hr></center>";
				}
				
			?>
			</td></tr></table>
			<font color="white">
			<h3><? echo l("Please enter the username and email that you used to register for an account with the FCTT.","Por favor, introduzca la nombre de usuario y dirección de correo electrónico que utilizó para registrarse en una cuenta con el FCTT."); ?>
			<h4>
			<table border = 0>
				<tr>
					<td><? echo l("Email address: ","Correo-e: "); ?></td>
					<td><input type="text" name="emailrecover" size="30" value="<? echo $_POST['emailrecover']; ?>" /><br></td>
				</tr>
				<tr>
					<td><? echo l("Username: ","Nombre de usuario: "); ?></td>
					<td><input type="text" name="usernamerecover" size="30" /></td>
				</tr>
			</table>
			</center>
			<? echo l("If you have forgotten your username, leave it blank. If you are unable to find your account by email address, please send us a message at <a href='mailto:fc-targeting-tool@rff.org'>fc-targeting-tool@rff.org</a> for assistance.","Si has olvidado tu nombre de usuario, dejalo en blanco. Si usted no puede encontrar su cuenta por dirección de correo electrónico, por favor envíenos un mensaje en <a href='mailto:fc-targeting-tool@rff.org'> fc-targeting-tool@rff.org </a> por ayuda"); ?>
			<br><br><center><input type="submit" value="<? echo l('Reset password','Restablecer contraseña'); ?>" name="recover" class = "bigSubmitButton"/><br><br>
			</center>
			<a href = 'splashscreen.php?lang=<? echo $_GET["lang"]."'>".l("Back to login screen","Volver a iniciar sesión"); ?></a><br><br>
		</form>
	</div>
</body>
</html>
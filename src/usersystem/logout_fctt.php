<?php
	session_start();
		
	file_put_contents("users/".$_SESSION['username']."_logfile.txt", date('Y-m-d H:i:s',time())." --> Logging out as ".$_SESSION['username']. " from IP: ".$_SERVER['REMOTE_ADDR']."\r\n", FILE_APPEND);
		
	session_destroy();
	//if(file_exists('islocalhost.txt')) {
	//	header('Location: ../geoserver/www/index_user.html');
	//}
	//else {
		header('Location: ../index_user.html');
	//}
?>
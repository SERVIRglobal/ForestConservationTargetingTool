<?
session_start();

//Determine whether this instance is on localhost or online, by seeing if the blank text file islocalhost.txt exists
$isLocalHost = 0;
if(file_exists('islocalhost.txt')) {$isLocalHost = 1;}
echo "var phpVarIsLocalHost = ".$isLocalHost.";";

echo "var phpVarIsLoggedIn = 0;";

//Get password for GeoServer umbrella guest account
echo "var phpVarGeoServerLogin = 'registeredandloggedin';";

//Set default language to Spanish:
echo "var phpVarLanguageToLoadIn = 1;";
//But replace with the session variable for language if it is defined:
if(isset($_SESSION['language'])){echo "phpVarLanguageToLoadIn = ".$_SESSION['language'].";";}

if(($_SESSION['application'] == "fctt519") && (file_exists('users/' . $_SESSION['username'] .'.xml'))) {
	
	$username = $_SESSION['username'];
			
	if(file_exists('users/' . $username .'.xml')){
		$xml = new SimpleXMLElement('users/' . $username .'.xml', 0, true);
		
		//Check password again, to limit against someone trying to use fctt_load directly
		if(sha1($_SESSION['encryptedpass'])!=$xml->password)
			{
			echo "alert('Security violation detected');";
			echo "phpVarIsLoggedIn = 0;";
		}
		else {
		
			echo "phpVarIsLoggedIn = 1;";
			echo "phpVarUserName = '".$_SESSION['username']."';";

			echo "var phpVarDataSetList = [];";
			echo "var phpVarDataSetUOA = [];";
			echo "var phpVarNumDataSets = 0;";
										
			//Get user layer PIN
			echo "var phpVarlayerPIN = '".$xml->layerPIN."';";
			
			if (file_exists('uploads/'.$username.'/'.$username.'_files.xml')) {				
				$doc = new DOMDocument();
				$doc->load('uploads/'.$username.'/'.$username.'_files.xml');
				
				//get active dataset name					
				$activedatasetname = $doc->getElementsByTagName("activedatasetname")->item(0)->nodeValue;
				//echo "Active dataset: ".$activedatasetname."<br>";
				
				$datasets = $doc->getElementsByTagName("dataset");
				$thisDataSetNum = 0;
				foreach( $datasets as $dataset ) {
					$thisDataSetNum++;
					echo "phpVarDataSetList[".$thisDataSetNum."]='".$dataset->getElementsByTagName('datasetname')->item(0)->nodeValue."';";
					echo "phpVarDataSetUOA[".$thisDataSetNum."]='".$dataset->getElementsByTagName('unitofanalysis')->item(0)->nodeValue."';";
				}
				echo "var phpVarNumDataSets = ".$thisDataSetNum.";";
			}
			else {
				echo "var phpVarNumDataSets = 0;";
			}
		}
	}
	
	
}
	
?>

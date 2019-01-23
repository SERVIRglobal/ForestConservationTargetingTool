<?php

$string = $_GET["url"];
$string = str_replace("000/","",$string);
$string = str_replace("/00","/",$string);
$string = str_replace("/0","/",$string);

$string = "http://earthengine.google.org/static/hansen_2013/loss_forest_gain".str_replace("000/","",$string);

$pieces = explode("/", $string);
$z=$pieces[count($pieces)-3];
$x=$pieces[count($pieces)-2];
$y=$pieces[count($pieces)-1];

//Transform the y variable. Earth Engine indexes tiles according to Google standard but MapFish is expecting open TMS indexing
//Tranformation given here: https://gist.github.com/tmcw/4954720. Visualization here: http://www.maptiler.org/google-maps-coordinates-tile-bounds-projection/
$y = pow(2, $z) - $y - 1;

$string =  "http://earthengine.google.org/static/hansen_2013/loss_forest_gain/".$z."/".$x."/".$y.".png";

//Now return the image from the corrected URL
$im = imagecreatefrompng($string);
header('Content-Type: image/png');
imagepng($im);
imagedestroy($im);

?>
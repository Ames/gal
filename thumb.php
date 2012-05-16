<?php
// define widescreen dimensions
$width = 200;

$width  = $_GET['w'];
$height = $_GET['h'];
$path   = stripslashes($_GET['f']);

if(!$height)
  $height=$width;

//if($_GET['d']){
//print_r(stripslashes($_GET['f']));
//exit(); 
//}

//$path=($_SERVER['QUERY_STRING']);

// load an image
$i = new Imagick($path);

//$i->cropThumbnailImage( $width, $width );
$i->thumbnailImage( $width, $height, true);


$i->setImageFormat("jpg");
header("Content-Type: image/jpeg");
exit($i);

?>

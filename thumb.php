<?php
// define widescreen dimensions
$width = 200;

$width = $_GET['w'];
$path  = $_GET['f'];

//$path=($_SERVER['QUERY_STRING']);

// load an image
$i = new Imagick($path);

//$i->cropThumbnailImage( $width, $width );
$i->thumbnailImage( $width, $width, true);


$i->setImageFormat("jpg");
header("Content-Type: image/jpeg");
exit($i);

?>

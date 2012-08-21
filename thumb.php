<?php
// define widescreen dimensions
$default = 100;

$width  = $_GET['w'];
$height = $_GET['h'];
$perim = $_GET['perim'];
$info = $_GET['info'];
$path   = stripslashes($_GET['f']);


if(!$height)
  $height=$width;

if(!$width)
  $width=$height;

if(!$width && !$height)
    $height=$width=$default;


//if($_GET['d']){
//print_r(stripslashes($_GET['f']));
//exit(); 
//}

//$path=($_SERVER['QUERY_STRING']);

// load an image
$i = new Imagick($path);



switch($i->getImageOrientation()) {

    case 6: // rotate 90 degrees CW
        $i->rotateimage("#FFF", 90);
    break;

    case 8: // rotate 90 degrees CCW
        $i->rotateimage("#FFF", -90);
    break;

}

if($perim){
    $ratio=($i->getImageHeight())/($i->getImageWidth());
    
    $width=ceil($perim/($ratio+1));
    $height=$perim-$width;
}

if($info){
    header("Content-Type: application/json");
    exit("{\"width\":{$i->getImageWidth()},\"height\":{$i->getImageHeight()}}");    
}

//$i->cropThumbnailImage( $width, $width );
$i->thumbnailImage( $width, $height, true);


$i->setImageFormat("jpg");
header("Content-Type: image/jpeg");

header("Cache-Control: public");
header("Expires: " . date(DATE_RFC822,strtotime("30 day")));
header("Etag: please_cache");

exit($i);

?>

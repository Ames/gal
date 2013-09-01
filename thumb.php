<?php


// info takes a list of images and reutrns info for each
if(isset($_REQUEST['info'])){

    $info = $_REQUEST['info'];

    set_time_limit(60);


    $files=explode(',',$info);
    $infos=array();

    foreach($files as $file){
        $exif = exif_read_data($file);

        $w=$exif['COMPUTED']['Width'];
        $h=$exif['COMPUTED']['Height'];

        $or = $exif['Orientation'];

        if(!$exif){
            $siz=getimagesize($file);
            $w=$siz[0];
            $h=$siz[1];
        }

        // if rotated, swap width and height
        if($or==6 || $or==8){ $t=$w; $w=$h; $h=$t; }


        $infos[$file]=array("w"=>$w,"h"=>$h,"exif"=>$exif);
    }

    header("Content-Type: application/json");
    exit(json_encode($infos));


// otherwise, we create a thumbnail of the image with specified dimensions
}else{


    $width  = $_GET['w'];
    $height = $_GET['h'];
    $file   = $_GET['f'];

    $i=loadImage($file);

    $i->thumbnailImage( $width, $height, true);

    $i->setImageFormat("jpg");
    header("Content-Type: image/jpeg");

    header("Cache-Control: public");
    header("Expires: " . date(DATE_RFC822,strtotime("30 day")));
    header("Etag: please_cache");

    exit($i);
}

function loadImage($url){

    $i = new Imagick($url);

    switch($i->getImageOrientation()){
        case 6: // rotate 90 degrees CW
            $i->rotateimage("#FFF", 90);
            break;

        case 8: // rotate 90 degrees CCW
            $i->rotateimage("#FFF", -90);
            break;

        case 3: // upside-down
            $i->rotateimage("#FFF", 180);
            break;
    }
    return $i;
}

?>

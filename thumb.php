<?php

$info = $_REQUEST['info'];

// info takes a list of images and reutrns info for each
if($info){
    
    $files=explode(',',$info);
    $infos=array();
    
    foreach($files as $file){
        $info = getImgInfo($file);
        $infos[$file]=array("w"=>$info[0],"h"=>$info[1]/*,"exif"=>$exif*/);
    }
    
    header("Content-Type: application/json");
    exit(json_encode($infos));


// otherwise, we create a thumbnail of the image with specified dimensions    
}else{
    
    $width  = $_GET['w'];
    $height = $_GET['h'];
    $file   = $_GET['f'];
    
//    print_r(getImgInfo($file));
//    exit(200);
//    

    
    list($w, $h, $or, $type) = getImgInfo($file);
    
    
    switch($type){
        case IMAGETYPE_GIF:  $img=imagecreatefromgif( $file); break;
        case IMAGETYPE_JPEG: $img=imagecreatefromjpeg($file); break;
        case IMAGETYPE_PNG:  $img=imagecreatefrompng( $file); break;
        case IMAGETYPE_BMP:  $img=imagecreatefromwbmp($file); break;
        case IMAGETYPE_XBM:  $img=imagecreatefromxbm( $file); break;
        default: exit(415); break;
    }
    
    
    
    // rotate if needed
    if($or==6) $img = imagerotate($img, 90,0);
    if($or==8) $img = imagerotate($img,-90,0);
    
    // we want to be within the given dimensions while preserving aspect ratio
    $imgRatio = $h/$w;
    $reqRatio = $height/$width;
    
    if($imgRatio<$reqRatio){ //wider than req, use H
        $thumbH=$height;
        $thumbW=round($height/$imgRatio);
    }else{ //taller than req, use W
        $thumbW=$width;
        $thumbH=round($width*$imgRatio);
    }
    // a little worried about the rounding...
    

    
    $thumb = imagecreatetruecolor($thumbW, $thumbH);
    imagecopyresampled($thumb, $img, 0, 0, 0, 0, $thumbW, $thumbH, $w, $h);
    //imagecopyresized($thumb, $img, 0, 0, 0, 0, $thumbW, $thumbH, $w, $h);

    header("Content-Type: image/jpeg");
    
    header("Cache-Control: public");
    header("Expires: " . date(DATE_RFC822,strtotime("30 day")));
    header("Etag: please_cache");
    
    imagejpeg($thumb);
    
}


// returns [w,h,orientation] of an image adjusted for orientation
function getImgInfo($url){
    $exif = exif_read_data($url);
    $siz  = getimagesize($url);

    if($exif){ 
        $w=$exif['COMPUTED']['Width'];
        $h=$exif['COMPUTED']['Height'];
        $or = $exif['Orientation'];
    }else{
        $w=$siz[0];
        $h=$siz[1];
        $or=0;
    }
    
    $type=$siz[2];
    
    // if rotated, swap width and height
    if($or==6 || $or==8){ $t=$w; $w=$h; $h=$t; }
    
    return array($w,$h,$or,$type); 
    //return array($w};
}

?>
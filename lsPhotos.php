<?php

// must be valid dir
$default_path = '/Users/ames/Desktop/photoGPS/images';

date_default_timezone_set('America/New_York');


function main(){
    global $default_path;

    $q=$_REQUEST['d'];
    $photo_path = is_dir($q) ? $q : $default_path;

    header("Content-Type: application/json");
    exit(json_encode(get_photo_infos($photo_path)));
}


function get_photo_infos($photo_path){

    $infos = array();

    foreach(scandir($photo_path) as $file_name){

        $file_path=$photo_path.'/'.$file_name;

        // simple way of filtering for images
        $siz=getimagesize($file_path);
        if(!$siz)
            continue;

        $exif = @exif_read_data($file_path, 'ANY_TAG', false) or false;

        // if rotated, swap width and height
        $or = $exif['Orientation'];
        $w=$siz[0];
        $h=$siz[1];
        if($or==6 || $or==8){ $t=$w; $w=$h; $h=$t; }

        $latlon = read_gps($exif);

        $taken = strtotime($exif['DateTime']);

        $info = array(
            'name' => $file_name,
            //'path' => $file_path,
            'taken' => $taken ? $taken : null, // "false" looks dumb
            'modified' => filemtime($file_path),
            'width' => $w,
            'height' => $h,
            'lat' => $latlon[0],
            'lon' => $latlon[1],
        );

        $infos[] = $info;
        //$infos[$file_name] = $info;

    }

    return array(
        'dir' => $photo_path,
        'photos' => $infos,
    );

}

function parseFrac($frac){
    $f_a = explode('/', $frac);
    //echo($f_a[1].' ');
    if(sizeof($f_a)==2){
        return $f_a[0]/$f_a[1];
    }else{
        return floatval($frac);
    }
}

function read_gps($exif){

    if(!isset($exif['GPSLatitude'])){
        return null;
    }

    $lat = parseFrac($exif['GPSLatitude'][0])+
           parseFrac($exif['GPSLatitude'][1])/60+
           parseFrac($exif['GPSLatitude'][2])/3600;
    $lon = parseFrac($exif['GPSLongitude'][0])+
           parseFrac($exif['GPSLongitude'][1])/60+
           parseFrac($exif['GPSLongitude'][2])/3600;

    if($exif['GPSLatitudeRef'] != 'N'){ $lat = 0-$lat; }
    if($exif['GPSLongitudeRef'] != 'E'){ $lon = 0-$lon; }

    return array($lat, $lon);
}

main();
?>

<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title><{$pageTitle}></title>

    <script src="//maps.googleapis.com/maps/api/js?key=<{$googleMapApiKey}>"></script>
    <script src="./node_modules/jquery/dist/jquery.min.js"></script>
</head>
<body>
    <input name="distanceToRun" id="distanceToRun" value="5000">
    <button onclick="rebuilding()">Rebuilding</button>
    <div id="mapCanvas"></div>

</body>
</html>

<script type="text/javascript">
var map;
var marker;
var circle;
var radius;
var Polyline;
var positionCenterLat = 35.6809591;
var positionCenterLng = 139.7673068;
var myLatLng = new google.maps.LatLng(positionCenterLat, positionCenterLng);
var mapDiv = document.getElementById("mapCanvas");

$(function(){
    setTimeout( function(){
        $('#mapCanvas').css(
            {'width':'100%','height':$(window).height() - 50}
        );
    },1000);

    map = new google.maps.Map(mapDiv, {
        center: myLatLng,
        zoom: 14,
    });

    marker = new google.maps.Marker({
        map: map,
        position: myLatLng,
        draggable: true,
        zIndex: 10
    });

    radius = Number($('#distanceToRun').val())/2;
    circle = new google.maps.Circle({
        center: myLatLng,
        fillColor: '#ff0000',
        fillOpacity: .2,
        map: map,
        radius: radius,//半径(m)
        strokeColor: '#ff0000',
        strokeOpacity: 0,
        strokeWeight: 1
    });


    var oneSide = Number($('#distanceToRun').val())/4;
    var angle = 30;
    var point1 = vincenty(positionCenterLat, positionCenterLng,90-angle,oneSide);
    var point2 = vincenty(point1[0],point1[1],-(90-angle),oneSide);
    var point3 = vincenty(point2[0],point2[1],-(180-(90-angle)),oneSide);

    var positions = [
        new google.maps.LatLng(positionCenterLat, positionCenterLng),
        new google.maps.LatLng(point1[0], point1[1]),
        new google.maps.LatLng(point2[0], point2[1]),
        new google.maps.LatLng(point3[0], point3[1]),
        new google.maps.LatLng(positionCenterLat, positionCenterLng),
    ];
    Polyline = new google.maps.Polyline({
        path: positions,
        strokeColor: '#00FF00',
        strokeOpacity: 1.0,
        strokeWeight: 2
    });
    Polyline.setMap(map);
});

function rebuilding(){
    //現在のマーカー位置をセットする
    positionCenterLat = marker.getPosition().lat();
    positionCenterLng = marker.getPosition().lng();

    //circleを再セット
    circle.setCenter(new google.maps.LatLng(positionCenterLat,positionCenterLng));
    radius = Number($('#distanceToRun').val())/2;
    circle.setRadius(radius);
}

function doRad(x){
  return x / 180 * Math.PI;
}

function radDo(x){
  return x * 180 / Math.PI;
}

function vincenty(lat1,lng1,alpha12,length){
    var check;
    var Radius_long = 6378137.0;
    var Henpei = 1/298.257222101;
    var Radius_short = Radius_long * (1 - Henpei); // 6356752.314

    lat1 = doRad(lat1);
    lng1 = doRad(lng1);
    alpha12 = doRad(alpha12);
    length = length;

    var U1 = Math.atan((1 - Henpei) * Math.tan(lat1));
    var sigma1 = Math.atan( Math.tan(U1) / Math.cos(alpha12));
    var alpha = Math.asin( Math.cos(U1) * Math.sin(alpha12));
    var u2 =  Math.pow( Math.cos(alpha),2) * (Math.pow(Radius_long,2) -Math.pow(Radius_short,2)) / Math.pow(Radius_short,2);
    var A = 1 + (u2/16384)*(4096 + u2 * (-768 + u2 * (320 - 175 * u2)));
    var B = (u2 / 1024) * (256 + u2 * (-128 + u2 * (74 - 47 * u2)));
    var sigma = length / Radius_short / A;
    do {
        var sigma0 = sigma;
        var dm2 = 2 * sigma1 + sigma;
        var x = Math.cos(sigma) * ( -1 + 2 * Math.pow(Math.cos(dm2),2) ) - B / 6 * Math.cos(dm2) * ( -3 + 4 * Math.pow(Math.sin(dm2),2)) * ( -3 + 4 * Math.pow(Math.cos(dm2),2));
        var dSigma = B * Math.sin(sigma) * ( Math.cos(dm2) + B / 4 * x);
        sigma = length / Radius_short / A + dSigma;
    } while ( Math.abs(sigma0 - sigma)>1e-9 );
 
    var x = Math.sin(U1) * Math.cos(sigma) + Math.cos(U1) * Math.sin(sigma) * Math.cos(alpha12)
    var y = (1 - Henpei) * Math.pow ( Math.pow( Math.sin(alpha),2) + Math.pow( Math.sin(U1) * Math.sin(sigma) - Math.cos(U1) * Math.cos(sigma) * Math.cos(alpha12) ,2) , 1 / 2);
    var lamda = Math.sin(sigma) * Math.sin(alpha12) / (Math.cos(U1) * Math.cos(sigma) - Math.sin(U1) * Math.sin(sigma) * Math.cos(alpha12));
    lamda = Math.atan(lamda);
    var C = (Henpei / 16) * Math.pow(Math.cos(alpha),2) * (4 + Henpei * (4 - 3 * Math.pow(Math.cos(alpha),2)));
    var z = Math.cos(dm2) + C * Math.cos(sigma) * (-1 + 2 * Math.pow(Math.cos(dm2),2) );
    var omega = lamda - (1 - C) * Henpei * Math.sin(alpha) * (sigma + C * Math.sin(sigma) * z);
    return [radDo(Math.atan(x / y)),radDo(lng1 + omega)];
}


</script>
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
	<button onclick="rebuilding()">Rebuilding</button>
	<div id="mapCanvas"></div>
</body>
</html>

<script type="text/javascript">
var map;
var marker;
var circle;
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

    circle = new google.maps.Circle({
		center: myLatLng,
		fillColor: '#ff0000',
		fillOpacity: .2,
		map: map,
		radius: 2500,
		strokeColor: '#ff0000',
		strokeOpacity: 0,
		strokeWeight: 1
	});
});

function rebuilding(){
	//現在のマーカー位置をセットする
	positionCenterLat = marker.getPosition().lat();
	positionCenterLng = marker.getPosition().lng();

	//circleを再セット
	circle.setCenter(new google.maps.LatLng(positionCenterLat,positionCenterLng));
}
</script>
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title><{$pageTitle}></title>

    <script src="//maps.googleapis.com/maps/api/js?key=<{$googleMapApiKey}>"></script>
    <script src="./node_modules/jquery/dist/jquery.min.js"></script>
    <script src="./js/customize.js"></script>
    <{if $googleAnalyticsTrackingId}>
    <!-- Global site tag (gtag.js) - Google Analytics -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=<{$googleAnalyticsTrackingId}>"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '<{$googleAnalyticsTrackingId}>');
    </script>
    <{/if}>
</head>
<body>
    <input name="distanceToRun" id="distanceToRun" type="number" value="">
    <button onclick="routeEdit()">ルートの作成</button>
    <button onclick="displaySwitching()">ガイド表示の切り替え</button>
    <div id="mapCanvas"></div>

</body>
</html>

<script type="text/javascript">
var circle;
var circleUpperLimit;
var radius;
var Polyline;
var positionCenterLat = 35.6809591;
var positionCenterLng = 139.7673068;
var distanceToPoint2 = 1500;
var LatLng = new google.maps.LatLng(positionCenterLat, positionCenterLng);
var mapDiv = document.getElementById("mapCanvas");
var map = new google.maps.Map(mapDiv, {
    center: LatLng,
    zoom: 14,
});
var marker = new google.maps.Marker({
    map: map,
    icon: {
        url: "http://maps.google.com/mapfiles/ms/icons/red-dot.png"
    },
    position: LatLng,
    draggable: true,
    zIndex: 10
});
var marker2;
var angleRhombus;//ひし形の角度
var angleWithPoint2 = 0;//中間地点までの角度
var point1;
var point2;
var point3;
var directionsService = new google.maps.DirectionsService;
var directionsRenderer = new google.maps.DirectionsRenderer({
    map: map,
    preserveViewport: true,
    suppressMarkers: true
});
var visible = true;
var getParams;
var centerLatLng;
var distanceToRun = 5000;
var temporaryGuide = false;

$(function(){

    getParams = getparam();
    if (getParams.get("centerLatLng") !== null) {
        if (decodeURIComponent(getParams.get("centerLatLng")).match(/\d+\.\d+,\d+\.\d+/g)) {
            centerLatLng = getParams.get("centerLatLng").split(",").map(Number);
            positionCenterLat = centerLatLng[0];
            positionCenterLng = centerLatLng[1];
            LatLng = new google.maps.LatLng(positionCenterLat, positionCenterLng);
            marker.setOptions({
                position: LatLng
            });
            map.setCenter(LatLng);
        }
    }
    setparam("centerLatLng",positionCenterLat+","+positionCenterLng);


    if (getParams.get("distanceToRun") !== null) {
        if (getParams.get("distanceToRun").match(/\d+/g)) {
            distanceToRun = Number(getParams.get("distanceToRun"));
        }
    }
    $('#distanceToRun').val(distanceToRun);
    setparam("distanceToRun",distanceToRun);


    if (getParams.get("angle") !== null) {
        if (getParams.get("angle").match(/\d+/g)) {
            angleWithPoint2 = Number(getParams.get("angle"));
        }
    }
    setparam("angle",angleWithPoint2);

    if (getParams.get("distanceToPoint2") !== null) {
        if (getParams.get("distanceToPoint2").match(/\d+/g)) {
            distanceToPoint2 = Number(getParams.get("distanceToPoint2"));
        }
    }
    if (distanceToRun < distanceToPoint2 * 2) {
        distanceToPoint2 = distanceToRun / 2;
    }
    setparam("distanceToPoint2",distanceToPoint2);


    setTimeout( function(){
        $('#mapCanvas').css(
            {'width':'100%','height':$(window).height() - 50}
        );
    },1000);

    // markerドラッグ後のイベント
    marker.addListener("dragend", function () {
        if (distanceToRun < distanceToPoint2 * 2) {
            distanceToPoint2 = distanceToRun / 2;
        }
        setparam("distanceToPoint2",distanceToPoint2);
        rebuilding();
    });

    var oneSide = distanceToRun / 4;
    radius = distanceToRun / 2;

    angleRhombus = cosineTheorem();
    point1 = vincenty(positionCenterLat, positionCenterLng,90-angleRhombus+angleWithPoint2,oneSide);
    point2 = vincenty(point1[0],point1[1],-(90-angleRhombus)+angleWithPoint2,oneSide);
    point3 = vincenty(point2[0],point2[1],-(180-(90-angleRhombus))+angleWithPoint2,oneSide);

    marker2 = new google.maps.Marker({
        map: map,
        position: new google.maps.LatLng(point2[0], point2[1]),
        icon: {
            url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png"
        },
        draggable: true,
        zIndex: 10
    });


    marker2.addListener("dragstart", function(){
        if (!visible && !temporaryGuide) {
            temporaryGuide = true;
            displaySwitching();
        }
    });
    marker2.addListener("dragend", function(){
        if (temporaryGuide) {
            temporaryGuide = false;
            displaySwitching();
        }
    });

    // marker2ドラッグ後のイベント
    marker2.addListener("dragend", function () {
        var _radius = distance(positionCenterLat, positionCenterLng,marker2.getPosition().lat(), marker2.getPosition().lng());
        if (_radius <= radius) {
            distanceToPoint2 = _radius;
            var latDiff = distance(positionCenterLat, positionCenterLng,positionCenterLat, marker2.getPosition().lng());
            var lngDiff = distance(positionCenterLat, positionCenterLng,marker2.getPosition().lat(), positionCenterLng);
            angleWithPoint2 = angleBetweenPoints(latDiff,lngDiff,_radius);
            setparam("angle",angleWithPoint2);
            setparam("distanceToPoint2",distanceToPoint2);
            rebuilding();
        } else {
            marker2.setOptions({
                position: new google.maps.LatLng(point2[0], point2[1])
            });
        }
    });
    var positions = [
        new google.maps.LatLng(positionCenterLat, positionCenterLng),
        new google.maps.LatLng(point1[0], point1[1]),
        new google.maps.LatLng(point2[0], point2[1]),
        new google.maps.LatLng(point3[0], point3[1]),
        new google.maps.LatLng(positionCenterLat, positionCenterLng)
    ];


    circle = new google.maps.Circle({
        visible: visible,
        center: LatLng,
        fillColor: '#ff0000',
        fillOpacity: .2,
        map: map,
        radius: distance(positionCenterLat, positionCenterLng,point2[0], point2[1]),//半径(m)
        strokeColor: '#ff0000',
        strokeOpacity: 0,
        strokeWeight: 1
    });

    circleUpperLimit = new google.maps.Circle({
        visible: visible,
        center: LatLng,
        fillColor: '#0000ff',
        fillOpacity: .2,
        map: map,
        radius: radius,//半径(m)
        strokeColor: '#0000ff',
        strokeOpacity: 0,
        strokeWeight: 1
    });

    Polyline = new google.maps.Polyline({
        visible: visible,
        path: positions,
        strokeColor: '#00FF00',
        strokeOpacity: 1.0,
        strokeWeight: 2
    });

    Polyline.setMap(map);

    var input = document.getElementById('distanceToRun');
    input.addEventListener('input', function(){
        distanceToRun = Number($('#distanceToRun').val());
        setparam("distanceToRun",distanceToRun);
    });
});


</script>
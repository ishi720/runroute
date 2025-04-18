/**
 * 余弦定理を用いて角度のラジアンを求める
 * @param {number} a - 一辺の長さ
 * @param {number} b - 一辺の長さ（対辺）
 * @param {number} c - 一辺の長さ
 * @returns {number} ラジアン値
 */
function calculateAngleUsingCosineLaw(a, b, c) {
    const cosValue = (Math.pow(a, 2) + Math.pow(c, 2) - Math.pow(b, 2)) / (2 * a * c);
    return Math.round(Math.acos(cosValue) * (180 / Math.PI));
}

function routeEdit(waypoints){
    directionsService.route({
        origin: new google.maps.LatLng(positionCenterLat, positionCenterLng),
        destination: new google.maps.LatLng(positionCenterLat, positionCenterLng),
        waypoints: [
            { location: new google.maps.LatLng(point1[0], point1[1])},
            { location: new google.maps.LatLng(point2[0], point2[1])},
            { location: new google.maps.LatLng(point3[0], point3[1])}
        ],
        travelMode: google.maps.TravelMode.WALKING
    }, function(response, status) {
        if (status == google.maps.DirectionsStatus.OK) {
            directionsRenderer.setMap(map);
            directionsRenderer.setDirections(response);

            //生成されたルートの距離を計算
            var m = 0;
            for(var i=0; i<response.routes[0].legs.length; i++){
                m += response.routes[0].legs[i].distance.value; // 距離(m)
            }
            calcRouteDistance = m;
        }
    });
}

function rebuilding(){
    //現在のマーカー位置をセットする
    positionCenterLat = marker.getPosition().lat();
    positionCenterLng = marker.getPosition().lng();

    setparam("centerLatLng",positionCenterLat+","+positionCenterLng);

    //circleUpperLimitを再セット
    var oneSide = Number($('#distanceToRun').val())/4;
    angleRhombus = cosineTheorem();
    point1 = vincenty(positionCenterLat, positionCenterLng,90-angleRhombus+angleWithPoint2,oneSide);
    point2 = vincenty(point1[0],point1[1],-(90-angleRhombus)+angleWithPoint2,oneSide);
    point3 = vincenty(point2[0],point2[1],-(180-(90-angleRhombus))+angleWithPoint2,oneSide);
    circle.setCenter(new google.maps.LatLng(positionCenterLat,positionCenterLng));
    circle.setRadius(distance(positionCenterLat, positionCenterLng,point2[0], point2[1]));

    //circleUpperLimitを再セット
    circleUpperLimit.setCenter(new google.maps.LatLng(positionCenterLat,positionCenterLng));
    radius = Number($('#distanceToRun').val())/2;
    circleUpperLimit.setRadius(radius);

    Polyline.setMap(null);

    marker2.setOptions({
        position: new google.maps.LatLng(point2[0], point2[1])
    });
    
    var positions = [
        new google.maps.LatLng(positionCenterLat, positionCenterLng),
        new google.maps.LatLng(point1[0], point1[1]),
        new google.maps.LatLng(point2[0], point2[1]),
        new google.maps.LatLng(point3[0], point3[1]),
        new google.maps.LatLng(positionCenterLat, positionCenterLng)
    ];
    Polyline = new google.maps.Polyline({
        visible: visible,
        path: positions,
        strokeColor: '#00FF00',
        strokeOpacity: 1.0,
        strokeWeight: 2
    });
    Polyline.setMap(map);
}

function doRad(x){
  return x / 180 * Math.PI;
}

function radDo(x){
  return x * 180 / Math.PI;
}

function vincenty(lat1,lng1,alpha12,length){
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


function distance($lat1, $lon1, $lat2, $lon2, $mode=true)
{
    // 緯度経度をラジアンに変換
    $radLat1 = doRad($lat1); // 緯度１
    $radLon1 = doRad($lon1); // 経度１
    $radLat2 = doRad($lat2); // 緯度２
    $radLon2 = doRad($lon2); // 経度２

    // 緯度差
    $radLatDiff = $radLat1 - $radLat2;

    // 経度差算
    $radLonDiff = $radLon1 - $radLon2;

    // 平均緯度
    $radLatAve = ($radLat1 + $radLat2) / 2.0;

    // 測地系による値の違い
    $a = $mode ? 6378137.0 : 6377397.155; // 赤道半径
    $b = $mode ? 6356752.314140356 : 6356078.963; // 極半径
    //$e2 = ($a*$a - $b*$b) / ($a*$a);
    $e2 = $mode ? 0.00669438002301188 : 0.00667436061028297; // 第一離心率^2
    //$a1e2 = $a * (1 - $e2);
    $a1e2 = $mode ? 6335439.32708317 : 6334832.10663254; // 赤道上の子午線曲率半径

    $sinLat = Math.sin($radLatAve);
    $W2 = 1.0 - $e2 * ($sinLat*$sinLat);
    $M = $a1e2 / (Math.sqrt($W2)*$W2); // 子午線曲率半径M
    $N = $a / Math.sqrt($W2); // 卯酉線曲率半径

    $t1 = $M * $radLatDiff;
    $t2 = $N * Math.cos($radLatAve) * $radLonDiff;
    $dist = Math.sqrt(($t1*$t1) + ($t2*$t2));

    return $dist;
}

function cosineTheorem(){
    //3辺の長さ
    var a = Number($('#distanceToRun').val())/4;
    var b = Number($('#distanceToRun').val())/4;
    var c = distanceToPoint2;

    // 余弦定理を用いて角度のラジアンを求める
    var angle = calculateAngleUsingCosineLaw(a, b, c);

    return 90-angle;
}

function angleBetweenPoints(a,b,c){

    // 余弦定理を用いて角度のラジアンを求める
    var angle = calculateAngleUsingCosineLaw(a, b, c);

    if ( positionCenterLat < marker2.getPosition().lat() ) {
        if (positionCenterLng < marker2.getPosition().lng()) {
            angle = 90-angle;//北東
        } else {
            angle = 270+angle;//北西
        }
    } else {
        if (positionCenterLng > marker2.getPosition().lng()) {
            angle = 270-angle;//南西
        } else {
            angle = 90+angle;//南東
        }
    }
    return angle;
}

function displaySwitching() {
    visible = !visible;

    circle.setOptions({visible:visible});
    circleUpperLimit.setOptions({visible:visible});
    Polyline.setOptions({visible:visible});
}

function getparam(){
    var url = new URL(window.location.href);
    var params = url.searchParams;

    return params;
}

function setparam(paramName,setData){
    setData = encodeURIComponent(setData);
    var url = new URL(window.location.href);
    if (url.searchParams.get(paramName) !== null) {
        var data = encodeURIComponent(url.searchParams.get(paramName));
        var regexp = new RegExp(paramName+"="+data,"g");
        url = url.href.replace(regexp, paramName+'='+setData);
    } else {
        url.searchParams.set(paramName,setData);
        url = url.href;
    }
    history.replaceState('','',url);
}
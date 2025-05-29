'use strict';

var circle;
var circleUpperLimit;
var radius;
var Polyline;
var positionCenterLat = 35.6809591;
var positionCenterLng = 139.7673068;
var distanceToPoint2 = 1500;
var LatLng = new google.maps.LatLng(positionCenterLat, positionCenterLng);
var mapDiv;
var map;
var marker;
var marker2;
var angleRhombus;//ひし形の角度
var angleWithPoint2 = 0;//中間地点までの角度
var point1;
var point2;
var point3;
var directionsService = new google.maps.DirectionsService();
var directionsRenderer = new google.maps.DirectionsRenderer({
    map: map,
    preserveViewport: true,
    suppressMarkers: true
});
var visible = true;
var getParams;
var centerLatLng;
var distanceToRun = 5000;
var calcRouteDistance = 0;//ルートの距離
var temporaryGuide = false;

$(function(){
    mapDiv = document.getElementById("mapCanvas");
    getParams = getparam();
    map = new google.maps.Map(mapDiv, {
        center: LatLng,
        zoom: 14
    });
    marker = new google.maps.Marker({
        map: map,
        icon: {
            url: "http://maps.google.com/mapfiles/ms/icons/red-dot.png"
        },
        position: LatLng,
        draggable: true,
        zIndex: 10
    });


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
    setparam("centerLatLng", positionCenterLat+","+positionCenterLng);


    if (getParams.get("distanceToRun") !== null) {
        if (getParams.get("distanceToRun").match(/\d+/g)) {
            distanceToRun = Number(getParams.get("distanceToRun"));
        }
    }
    $('#distanceToRun').val(distanceToRun);
    setparam("distanceToRun", distanceToRun);


    if (getParams.get("angle") !== null) {
        if (getParams.get("angle").match(/\d+/g)) {
            angleWithPoint2 = Number(getParams.get("angle"));
        }
    }
    setparam("angle", angleWithPoint2);

    if (getParams.get("distanceToPoint2") !== null) {
        if (getParams.get("distanceToPoint2").match(/\d+/g)) {
            distanceToPoint2 = Number(getParams.get("distanceToPoint2"));
        }
    }
    if (distanceToRun < distanceToPoint2 * 2) {
        distanceToPoint2 = distanceToRun / 2;
    }
    setparam("distanceToPoint2", distanceToPoint2);


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
        setparam("distanceToPoint2", distanceToPoint2);
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
        fillOpacity: 0.2,
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
        fillOpacity: 0.2,
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
/**
 * Google Maps Directions API を使用して、指定された地点を通る徒歩ルートを作成する。
 */
function routeEdit(){
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

/**
 * 地図上のマーカー位置を中心に、補助線を再描画する。
 */
function rebuilding(){
    //現在のマーカー位置をセットする
    positionCenterLat = marker.getPosition().lat();
    positionCenterLng = marker.getPosition().lng();

    setparam("centerLatLng", positionCenterLat+","+positionCenterLng);

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

/**
 * 度をラジアンに変換する
 *
 * @param {number} x - 変換したい角度（度）
 * @returns {number} ラジアンに変換された角度
 */
function degToRad(x) {
    return x / 180 * Math.PI;
}

/**
 * ラジアンを度に変換する
 *
 * @param {number} x - 変換したい角度（ラジアン）
 * @returns {number} 度に変換された角度
 */
function radToDeg(x) {
    return x * 180 / Math.PI;
}


/**
 * Vincentyの順解法（Direct Method）を使用して、始点から距離と方位角をもとに終点の緯度経度を求める
 *
 * @param {number} lat1 - 始点の緯度（度）
 * @param {number} lng1 - 始点の経度（度）
 * @param {number} azimuthDeg - 始点での方位角（度、北から時計回り）
 * @param {number} distance - 始点からの距離（メートル）
 * @returns {[number, number]} - 終点の [緯度（度）, 経度（度）]
 *
 * @example
 * const [lat2, lng2] = vincenty(35.0, 135.0, 90.0, 10000);
 * console.log(lat2, lng2); // 東方向に10km進んだ地点の緯度経度
 */
function vincenty(lat1, lng1, azimuthDeg, distance) {
    const a = 6378137.0; // 長半径 (WGS84)
    const f = 1 / 298.257222101; // 扁平率
    const b = a * (1 - f); // 短半径

    lat1 = degToRad(lat1);
    lng1 = degToRad(lng1);
    const alpha1 = degToRad(azimuthDeg);

    const U1 = Math.atan((1 - f) * Math.tan(lat1));
    const sigma1 = Math.atan2(Math.tan(U1), Math.cos(alpha1));
    const sinAlpha = Math.cos(U1) * Math.sin(alpha1);
    const cosSqAlpha = 1 - sinAlpha * sinAlpha;

    const uSq = cosSqAlpha * (a * a - b * b) / (b * b);
    const A = 1 + (uSq / 16384) * (4096 + uSq * (-768 + uSq * (320 - 175 * uSq)));
    const B = (uSq / 1024) * (256 + uSq * (-128 + uSq * (74 - 47 * uSq)));

    let sigma = distance / (b * A);
    let sigmaPrev;
    let iterations = 0;

    do {
        sigmaPrev = sigma;
        const twoSigmaM = 2 * sigma1 + sigma;
        const deltaSigma = B * Math.sin(sigma) * (
            Math.cos(twoSigmaM) +
            (B / 4) * (
                Math.cos(sigma) * (-1 + 2 * Math.pow(Math.cos(twoSigmaM), 2)) -
                (B / 6) * Math.cos(twoSigmaM) * (-3 + 4 * Math.pow(Math.sin(twoSigmaM), 2)) * (-3 + 4 * Math.pow(Math.cos(twoSigmaM), 2))
            )
        );
        sigma = distance / (b * A) + deltaSigma;
        iterations++;
    } while (Math.abs(sigma - sigmaPrev) > 1e-12 && iterations < 100);

    const sinSigma = Math.sin(sigma);
    const cosSigma = Math.cos(sigma);
    const sinU1 = Math.sin(U1);
    const cosU1 = Math.cos(U1);

    const lat2 = Math.atan2(
        sinU1 * cosSigma + cosU1 * sinSigma * Math.cos(alpha1),
        (1 - f) * Math.sqrt(
            Math.pow(sinAlpha, 2) +
            Math.pow(sinU1 * sinSigma - cosU1 * cosSigma * Math.cos(alpha1), 2)
        )
    );

    const lambda = Math.atan2(
        sinSigma * Math.sin(alpha1),
        cosU1 * cosSigma - sinU1 * sinSigma * Math.cos(alpha1)
    );

    const C = (f / 16) * cosSqAlpha * (4 + f * (4 - 3 * cosSqAlpha));
    const L = lambda - (1 - C) * f * sinAlpha * (
        sigma + C * sinSigma * (
            Math.cos(2 * sigma1 + sigma) + C * cosSigma * (-1 + 2 * Math.pow(Math.cos(2 * sigma1 + sigma), 2))
        )
    );

    const lng2 = lng1 + L;

    return [radToDeg(lat2), radToDeg(lng2)];
}

/**
 * 指定された2地点（緯度・経度）の距離を計算する。
 * 測地系にはWGS84（世界測地系）またはBessel（日本測地系）を選択可能。
 *
 * @param {number} lat1 - 地点1の緯度（度単位）
 * @param {number} lon1 - 地点1の経度（度単位）
 * @param {number} lat2 - 地点2の緯度（度単位）
 * @param {number} lon2 - 地点2の経度（度単位）
 * @param {boolean} [mode=true] - 測地系を指定（true: WGS84（世界測地系）, false: Bessel（日本測地系））
 * @returns {number} 2地点間の距離（メートル単位）
 */
function distance(lat1, lon1, lat2, lon2, mode=true) {
    // 緯度経度をラジアンに変換
    const radLat1 = degToRad(lat1); // 緯度１
    const radLon1 = degToRad(lon1); // 経度１
    const radLat2 = degToRad(lat2); // 緯度２
    const radLon2 = degToRad(lon2); // 経度２

    // 緯度差
    const radLatDiff = radLat1 - radLat2;

    // 経度差算
    const radLonDiff = radLon1 - radLon2;

    // 平均緯度
    const radLatAve = (radLat1 + radLat2) / 2.0;

    // 測地系による値の違い
    const a = mode ? 6378137.0 : 6377397.155; // 赤道半径
    //const b = mode ? 6356752.314140356 : 6356078.963; // 極半径
    const e2 = mode ? 0.00669438002301188 : 0.00667436061028297; // 第一離心率^2
    const a1e2 = mode ? 6335439.32708317 : 6334832.10663254; // 赤道上の子午線曲率半径

    const sinLat = Math.sin(radLatAve);
    const W2 = 1.0 - e2 * (sinLat*sinLat);
    const M = a1e2 / (Math.sqrt(W2)*W2); // 子午線曲率半径M
    const N = a / Math.sqrt(W2); // 卯酉線曲率半径

    const t1 = M * radLatDiff;
    const t2 = N * Math.cos(radLatAve) * radLonDiff;
    const dist = Math.sqrt((t1*t1) + (t2*t2));

    return dist;
}

/**
 * 3辺の長さから余弦定理を用いて角度を計算し、90度からその角度を引いた値を返す
 * @returns {number} 90度から余弦定理で算出した角度を引いた値（ラジアン）
 */
function cosineTheorem(){
    //3辺の長さ
    const a = Number($('#distanceToRun').val())/4;
    const b = Number($('#distanceToRun').val())/4;
    const c = distanceToPoint2;

    // 余弦定理を用いて角度のラジアンを求める
    const angle = calculateAngleUsingCosineLaw(a, b, c);

    return 90 - angle;
}
/**
 * 3点間の角度を余弦定理で求め、地理的な方角に基づいて補正した角度を返す。
 * @param {Object} a
 * @param {Object} b
 * @param {Object} c
 * @returns {number} 角度（度単位）
 */
function angleBetweenPoints(a, b, c){

    // 余弦定理を用いて角度のラジアンを求める
    var angle = calculateAngleUsingCosineLaw(a, b, c);

    if (positionCenterLat < marker2.getPosition().lat()) {
        if (positionCenterLng < marker2.getPosition().lng()) {
            angle = 90 - angle;//北東
        } else {
            angle = 270 + angle;//北西
        }
    } else {
        if (positionCenterLng > marker2.getPosition().lng()) {
            angle = 270 - angle;//南西
        } else {
            angle = 90 + angle;//南東
        }
    }
    return angle;
}

/**
 * 地図上のガイドの表示・非表示を切り替える
 * @global {boolean} visible - 表示状態のフラグ（true: 表示、false: 非表示）
 * @global {object} circle - 地図上の円オブジェクト
 * @global {object} circleUpperLimit - 地図上の上限円オブジェクト
 * @global {object} Polyline - 地図上のポリラインオブジェクト
 */
function displaySwitching() {
    visible = !visible;
    circle.setOptions({visible:visible});
    circleUpperLimit.setOptions({visible:visible});
    Polyline.setOptions({visible:visible});
}

/**
 * 現在のURLからクエリパラメータを取得する
 * @returns {URLSearchParams} クエリパラメータのオブジェクト
 */
function getparam(){
    const url = new URL(window.location.href);
    return url.searchParams;
}
/**
 * 指定された名前と値でURLのクエリパラメータを追加または更新する。
 * @param {string} paramName - 変更または追加するクエリパラメータ名
 * @param {string} setData - 設定するパラメータの値（自動でエンコード）
 */
function setparam(paramName, setData){
    const url = new URL(window.location.href);
    url.searchParams.set(paramName, setData);
    history.replaceState(null, '', url.toString());
}
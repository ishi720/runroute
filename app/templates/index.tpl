<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title><{$pageTitle}></title>
    <link rel="shortcut icon" type="image/x-icon" href="./images/favicon.ico">

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

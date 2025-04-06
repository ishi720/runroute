### 概要

ランニングルートを自動生成する

距離を指定して、スタート地点からゴール地点まで輪になるようにする

### Badge

[![Codacy Badge](https://app.codacy.com/project/badge/Grade/01605fba6bd240f4bc304a9f26a027fd)](https://www.codacy.com/gh/ishi720/runroute/dashboard?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=ishi720/runroute&amp;utm_campaign=Badge_Grade)

### セットアップ

- パッケージのインストール

```bash
$ yarn install
$ comoser install
$ cd app & yarn install
```

- GoogleアナリティクスとGoogleマップのAPIキーを設定

```php
# /app/index.php
$smarty->assign('googleMapApiKey', '');
$smarty->assign('googleAnalyticsTrackingId', 'G-');
```
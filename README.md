### 概要

ランニングルートを自動生成する

距離を指定して、スタート地点からゴール地点まで輪になるようにする

### Badge

[![Codacy Badge](https://app.codacy.com/project/badge/Grade/01605fba6bd240f4bc304a9f26a027fd)](https://www.codacy.com/gh/ishi720/runroute/dashboard?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=ishi720/runroute&amp;utm_campaign=Badge_Grade)

### セットアップ

- パッケージのインストール

```bash
$ yarn install
$ composer install
$ cd app & yarn install
```

- 設定ファイルの作成

```yaml
# /configs/config.yaml
googleMapApiKey: "XXXXXXXXXXXXXXXXXXX"
googleAnalyticsTrackingId: "G-XXXXXXXXX"
```

- 起動

```bash
$ yarn gulp
```

### 画面イメージ

ルートを設定

![image](https://github.com/user-attachments/assets/059a395b-af67-4b8d-988f-2040856c2d4d)

ルートを作成

![image](https://github.com/user-attachments/assets/5993e6cb-579e-46a9-a6d1-ceae8688d50b)



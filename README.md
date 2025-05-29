### 概要

ランニングルートを自動生成する

距離を指定して、スタート地点からゴール地点まで輪になるようにする

### Badge

[![Codacy Badge](https://app.codacy.com/project/badge/Grade/01605fba6bd240f4bc304a9f26a027fd)](https://app.codacy.com/gh/ishi720/runroute/dashboard?utm_source=gh&utm_medium=referral&utm_content=&utm_campaign=Badge_grade)

### セットアップ

- パッケージのインストール

```bash
$ yarn install
$ composer install
$ cd app & yarn install
```

- 設定ファイルの作成(/configs/config.yaml)

```yaml
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



# フロントエンド

## 1. 状態管理・全体設定

### `src/controller.ts`

フィールドやロボットの物理的なサイズ設定、UI描画時の計算を行う設定ファイル

* **重要な設定・計算:**
* `Setting.fieldSize`: 実際の競技フィールドのサイズを  幅 `5700`、高さ `10500` (mm) と定義
* `Setting.robotSize`: ロボットの実寸サイズを (mm) 定義
* `Setting.fieldSizeScale`: UIへの描画サイズを決定する計算式。画面の高さ (`window.innerHeight`) の90%を基準とし、実寸サイズのアスペクト比を保ったまま幅を動的に算出
* `ModeTheme`: 青モードと赤モードにおけるUIカラーパレットと、背景に使用するフィールド画像のパスを定義

### `src/websocket.ts`

`Zustand` と `ReconnectingWebSocket` を利用した通信の状態管理ファイルである。

* **重要な設定・計算:**
* 接続先URLはハードコード

* **座標系の変換:** サーバーから `current_location` コマンドを受信した際、X座標に `-receivedData.y` を、Y座標に `receivedData.x` を代入し、ロボット側のセンサー座標系をUIの描画座標系に合わせるための軸の入れ替え処理を行う

### `src/hooks/useController.ts`

操作指示に関する状態を管理する。

* **重要な設定:**
* 射出機構の出力パラメータの初期値として、PWM値（`shootPwm`）、駆動時間（`shootTime`）を設定

* テーマ（`blue` / `red`）を切り替える `useModeStore` を定義

### `src/commandsType.ts`

WebSocket通信で送受信されるJSONデータフォーマットのTypeScript型定義（`Commands`, `CurrentLocation`, `SetLocation` 等）をまとめたファイル

## 2. アプリケーション基盤

### `src/main.tsx`

Reactアプリケーションのエントリーポイントであり、`App` コンポーネントをレンダリングする。

### `src/App.tsx`

メイン画面のレイアウト構成と、初期位置などのグローバルな状態を統合するファイルである。

* **重要な設定・計算:**
* **ロボット初期位置:** 赤モード時は `x: 1800, y: 500`、青モード時は `x: 3900, y: 500` を初期姿勢として返す `getInitialPose` が定義されている。

* **絶対座標の復元:** `ORIGIN_X` (3700) と `ORIGIN_Y` (550) を定数として持ち、WebSocketで受信した相対的な `realtimeStatus` に加算することで、マップ上の絶対座標 (`absolutePose`) を算出

* 画面のリサイズイベントを監視 (`ResizeObserver`) し、動的にフィールドの描画領域サイズを更新する処理を含む

### `src/index.css` & `src/App.css`

グローバルなスタイル定義、およびメインレイアウト用のCSSファイルである。

## 3. UIコンポーネント (`src/components/`)

画面描画とユーザー操作の受け付けと、ロボット制御に関わる座標計算

### `src/components/konva/konva.tsx`

フィールドを描画し、ドラッグ操作からロボットへの移動指示（目標座標と角度）を算出

* **重要な計算 (画面座標から物理座標への変換):**
* X座標: `realX = startPos.x * toRealScaleX`

* Y座標: コンピュータ画面のY軸（下方向が正）と物理フィールドのY軸（上方向が正）の違いを吸収するため、`realY = REAL_FIELD_H - startPos.y * toRealScaleY` と減算を行う

* **赤モード時の補正:**
* `realX = REAL_FIELD_W - realX` および `dx = -dx` の処理により、赤モードの場合はX軸を反転させて点対称の動作を行う

* **角度計算:**
* ドラッグの始点と終点の差分（`dx`, `dy`）から、`Math.atan2(dy, dx) * (180 / Math.PI)` によってロボットが最終的に向くべき目標角度（度数法）を算出

### `src/components/robot/Robot.tsx`

算出した絶対座標をもとに、画面上の適切な位置と角度にロボットアイコンを描画

* **重要な計算:**
* 物理フィールドの座標（0〜最大値）をUI描画用ピクセル座標にマッピング
ここでもY軸の反転（`py = displayHeight - (fieldY / FIELD_HEIGHT_MM) * displayHeight`）を行う

* 赤陣地時は、ロボットの向きを描画上反転させるため `displayTheta = 180 - theta`と補正

### その他のコンポーネント群

* **`preset/Preset.tsx`:** 十字キー状のボタンから、指定した距離（mm）や角度ステップに応じた相対的な移動指示（`set_location`）を送信

* **`send-button/SendButton.tsx`:** UI上で設定した比率座標（`targetPositionScale`）に実寸サイズ（`setting.fieldSize`）を掛け合わせ、物理座標として送信
* **その他UI部品:** `Belt-output-slider`, `Launch-button`, `change-theme-button`, `Reset-button`, `stop-button` などは、特定のコマンド生成や状態表示の役割を担う。

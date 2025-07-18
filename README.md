# Tetris Game Extension for VS Code

VSCode内でテトリスゲームをプレイできる拡張機能です！

## 機能

- **完全なテトリスゲーム**: 7種類のテトリミノ（I、O、T、S、Z、J、L）
- **ゲーム機能**: 
  - ピースの回転、移動、ドロップ
  - ライン消去とスコア計算
  - レベルアップシステム
  - 次のピースのプレビュー
- **VSCode統合**: コマンドパレットからゲームを起動
- **美しいUI**: VSCodeのテーマに合わせたデザイン

## 使い方

1. **ゲームの開始**:
   - `Ctrl+Shift+P` (または `Cmd+Shift+P`) でコマンドパレットを開く
   - `Tetris: Start Tetris Game` を検索して実行
   - または `F1` を押して `Start Tetris Game` を検索

2. **操作方法**:
   - `←` `→` : ピースを左右に移動
   - `↓` : ソフトドロップ（少し速く落とす）
   - `↑` : ピースを回転
   - `スペース` : ハードドロップ（一気に落とす）
   - `P` : ゲームを一時停止

3. **ゲームルール**:
   - ピースを操作して横のラインを完成させる
   - ラインが完成すると消去されてスコアが加算
   - 10ライン消去するごとにレベルアップ
   - レベルが上がるとピースの落下速度が増加

## インストール

1. このプロジェクトをクローンまたはダウンロード
2. VS Codeでプロジェクトフォルダを開く
3. `F5` を押してデバッグモードで実行
4. 新しいVS Codeウィンドウが開いたら、コマンドパレットから `Start Tetris Game` を実行

## 開発

### 要件

- VS Code 1.102.0以上
- Node.js
- npm

### セットアップ

```bash
npm install
npm run compile
```

### テスト

```bash
npm run test
```

### パッケージング

```bash
npm run package
```

## 技術的詳細

- **TypeScript**: 型安全な開発
- **Webview API**: ゲームインターフェースの表示
- **Canvas API**: ゲームグラフィックスの描画
- **Webpack**: バンドリングとビルド

## 貢献

バグ報告や機能要求はIssueでお知らせください。プルリクエストも歓迎します！

## ライセンス

MIT License

---

**楽しいテトリスライフを！** 🎮✨

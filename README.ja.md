# video-sharing-app

[English](./README.md) | 日本語

<!-- 内容を更新した際は README.md(英語版)も忘れずに同期すること -->

## プロジェクト概要

ブラウザで動作する動画共有アプリケーション。ユーザーが動画をアップロードし、一覧から選んで再生できることを目指す。

### 主要機能(予定)

- 動画アップロード
- 動画一覧・再生
- ユーザー認証(Supabase Auth)

## 技術スタック

| 分類 | 技術 | バージョン |
| --- | --- | --- |
| 言語 | TypeScript | 5.x |
| フレームワーク | Next.js(App Router) | 16.x |
| API層 | tRPC(+ TanStack Query) | 11.x |
| 認証・データベース | Supabase(Auth / PostgreSQL) | - |
| ORM | Drizzle ORM | - |
| 動画基盤 | Mux(アップロード・エンコード・再生) | - |
| スタイリング | Tailwind CSS | 4.x |
| UIコンポーネント | shadcn/ui | - |
| 単体・結合テスト | Vitest | - |
| E2Eテスト | Playwright | - |
| パッケージ管理 | pnpm | 11.x |
| CI/CD | GitHub Actions | - |
| デプロイ | Vercel | - |

<!-- バージョンはスキャフォールド後に実際の値へ同期すること -->

## アーキテクチャ(動画のアップロード・再生)

動画ファイルはブラウザから Mux へ直接アップロードし(Direct Upload)、エンコード後は Mux から HLS でストリーミング再生する。動画のメタデータ(タイトル、Mux の Playback ID 等)は Supabase の PostgreSQL に保存する。Next.js は UI と Route Handler(アップロードURLの発行、Mux Webhook の受信等)を担う。クライアント⇔サーバー間のAPIは tRPC で定義し、型安全に呼び出す。DBアクセスは Drizzle ORM で行い、認可チェックは tRPC のプロシージャで実施する。

```
[ブラウザ] ──動画アップロード (Direct Upload)──→ [Mux]
    │ ←──ストリーミング再生 (HLS)──────────────────┘
    │                                              │
    ├─ 認証 ──────────→ [Supabase Auth]            │ Webhook(エンコード完了等)
    └─ ページ表示・API → [Next.js] ←───────────────┘
                            └─ メタデータ保存/取得 → [Supabase PostgreSQL]
```

## ディレクトリ構成

```
.
├── .github/             # PRテンプレート・CIワークフロー
├── e2e/                 # Playwright E2Eテスト
├── public/              # 静的ファイル
├── src/
│   ├── app/
│   │   ├── page.tsx             # / → /videos へリダイレクト
│   │   ├── (main)/              # メインレイアウト(サイドバー + ヘッダー)
│   │   │   ├── videos/          # 公開動画一覧
│   │   │   └── my-videos/       # 動画管理(認証必須)
│   │   ├── (player)/            # プレイヤーレイアウト
│   │   │   └── videos/[videoId]/  # 動画再生ページ
│   │   └── api/
│   │       ├── trpc/[trpc]/     # tRPC エンドポイント(fetch adapter)
│   │       └── webhooks/mux/    # Mux Webhook ハンドラ
│   ├── components/      # 共通コンポーネント
│   │   └── ui/          # shadcn/ui 生成コンポーネント
│   ├── constants/       # 定数
│   ├── db/              # Drizzle スキーマ・DB接続
│   ├── lib/             # Supabase / Mux クライアント等
│   ├── proxy.ts         # セッション更新・認証リダイレクト(Supabase Auth)
│   ├── trpc/            # tRPC 初期化・ルーター定義・クライアント/サーバー用プロキシ
│   └── types/           # tRPC を経由しない共有型
├── drizzle.config.ts    # Drizzle Kit 設定
├── next.config.ts       # Next.js設定
├── package.json
└── tsconfig.json
```

## セットアップ

必要環境: Node.js 24以上 / pnpm 11以上

```bash
pnpm install   # 依存関係のインストール
pnpm dev       # 開発サーバーの起動
```

環境変数は `.env.local` に設定する。

| 変数名 | 説明 |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase プロジェクトのURL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase の Publishable key |
| `DATABASE_URL` | Supabase PostgreSQL の接続文字列(Transaction pooler) |

Mux の環境変数は連携実装時に追記する。

## 開発コマンド

すべてリポジトリルートで実行する。

| コマンド | 説明 |
| --- | --- |
| `pnpm dev` | 開発サーバーの起動 |
| `pnpm build` | 本番用ビルド |
| `pnpm test` | 単体・結合テストの実行(Vitest) |
| `pnpm test:e2e` | E2Eテストの実行(Playwright) |
| `pnpm lint` | Lintの実行 |
| `pnpm format` | コードフォーマット |

## 開発サーバーのURL

http://localhost:3000

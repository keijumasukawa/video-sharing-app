import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// 確認メールのリンク(Supabase 側で検証後にリダイレクトされる)を受け、
// 付与された code をセッションに交換してログイン状態にする(PKCE フロー)
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  // オープンリダイレクト防止のため、next は相対パスのみ許可する
  let next = searchParams.get("next") ?? "/";
  if (!next.startsWith("/")) {
    next = "/";
  }

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const forwardedHost = request.headers.get("x-forwarded-host");
      const isLocalEnv = process.env.NODE_ENV === "development";
      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`);
      }
      if (forwardedHost) {
        // 本番はロードバランサー経由のため、元のホスト名でリダイレクトする
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      }
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/auth/error`);
}

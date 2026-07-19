import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // createServerClient と getClaims の間に処理を挟まないこと(公式の注意事項)。
  // getClaims がトークンの検証と期限切れトークンのリフレッシュを行う
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  // 未認証で認証必須ページへアクセスした場合は動画一覧へリダイレクトする
  // (ログインはヘッダーのダイアログから行うため、専用のログインページは持たない)
  if (!user && request.nextUrl.pathname.startsWith("/my-videos")) {
    const url = request.nextUrl.clone();
    url.pathname = "/videos";
    return NextResponse.redirect(url);
  }

  // supabaseResponse は必ずそのまま返すこと(公式の注意事項)。
  // 新しいレスポンスに差し替える場合は request と cookie を引き継がないと、
  // ブラウザとサーバーのセッションが不整合になり突然ログアウトされる恐れがある
  return supabaseResponse;
}

import { NextRequest, NextResponse } from "next/server";

/** Реферальная ссылка: /r/SELLIX-AB12 → регистрация с подставленным кодом. */
export function GET(
  req: NextRequest,
  { params }: { params: { code: string } }
) {
  const url = req.nextUrl.clone();
  url.pathname = "/register";
  url.searchParams.set("ref", params.code);
  const res = NextResponse.redirect(url);
  res.cookies.set("sellix_ref", params.code, {
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });
  return res;
}

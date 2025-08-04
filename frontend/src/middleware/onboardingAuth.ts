import { NextRequest, NextFetchEvent, NextResponse } from 'next/server';

// Middleware kiểm tra xác thực cho trang onboarding
export async function onboardingAuthMiddleware(req: NextRequest, ev: NextFetchEvent) {
  // Kiểm tra token trong cookie
  const token = req.cookies.get('accessToken');
  
  // Nếu không có token, chuyển hướng đến trang đăng nhập
  if (!token) {
    const url = new URL('/login', req.url);
    return NextResponse.redirect(url);
  }
  
  // Nếu có token, tiếp tục xử lý
  return NextResponse.next();
}
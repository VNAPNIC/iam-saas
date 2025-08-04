import { NextRequest, NextFetchEvent, NextResponse } from 'next/server';
import { useAuthStore } from '@/stores/authStore';

// Middleware kiểm tra xác thực cho các trang yêu cầu đăng nhập
export async function authMiddleware(req: NextRequest, ev: NextFetchEvent) {
  // Lấy token từ cookie
  const token = req.cookies.get('accessToken');
  
  // Nếu không có token, chuyển hướng đến trang đăng nhập
  if (!token) {
    const url = new URL('/login', req.url);
    return NextResponse.redirect(url);
  }
  
  // Nếu có token, tiếp tục xử lý
  return NextResponse.next();
}

// Middleware kiểm tra nếu người dùng đã đăng nhập thì chuyển hướng đến dashboard
export async function guestMiddleware(req: NextRequest, ev: NextFetchEvent) {
  // Lấy token từ cookie
  const token = req.cookies.get('accessToken');
  
  // Nếu có token, chuyển hướng đến dashboard
  if (token) {
    const url = new URL('/dashboard', req.url);
    return NextResponse.redirect(url);
  }
  
  // Nếu không có token, tiếp tục xử lý
  return NextResponse.next();
}
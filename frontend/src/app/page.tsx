'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import { useUIStore } from '@/stores/uiStore';

export default function LandingPage() {
  const { theme, setTheme } = useTheme();
  const { language, setLanguage } = useUIStore();

  return (
    <div className="bg-white dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <i className="fas fa-lock text-blue-500 text-2xl"></i>
            <h1 className="text-xl font-bold ml-2 text-gray-900 dark:text-white">IAM SaaS</h1>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <a href="#features" className="text-gray-600 dark:text-gray-300 hover:text-blue-500">Tính năng</a>
            <a href="#pricing" className="text-gray-600 dark:text-gray-300 hover:text-blue-500">Bảng giá</a>
            <a href="#testimonials" className="text-gray-600 dark:text-gray-300 hover:text-blue-500">Đánh giá</a>
            <Link href="/login" className="text-gray-600 dark:text-gray-300 hover:text-blue-500">Đăng nhập</Link>
          </nav>
          <div className="flex items-center space-x-4">
            <Link href="/signup" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
              Bắt đầu miễn phí
            </Link>
            <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="text-gray-500 dark:text-gray-400 hover:text-blue-500">
              <i className={`fas ${theme === 'dark' ? 'fa-sun' : 'fa-moon'}`}></i>
            </button>
             <select 
                value={language}
                onChange={(e) => setLanguage(e.target.value as 'en' | 'vi')}
                className="text-sm border border-gray-300 rounded-md px-2 py-1 bg-white dark:bg-gray-700 dark:border-gray-600"
              >
                <option value="en">English</option>
                <option value="vi">Tiếng Việt</option>
            </select>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main>
        <section className="bg-blue-50 dark:bg-gray-800 py-20">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Giải pháp Quản lý Định danh và Truy cập Toàn diện</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-8">Bảo mật, đơn giản hóa và tự động hóa việc quản lý truy cập cho doanh nghiệp của bạn.</p>
            <Link href="/signup" className="bg-blue-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-blue-700 text-lg">
              Dùng thử miễn phí 14 ngày
            </Link>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20">
          <div className="container mx-auto px-6">
            <h3 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">Tại sao chọn IAM SaaS?</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="card bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md border dark:border-gray-700">
                <div className="text-blue-500 mb-4"><i className="fas fa-shield-alt fa-3x"></i></div>
                <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Bảo mật Đa lớp</h4>
                <p className="text-gray-600 dark:text-gray-400">Tích hợp xác thực đa yếu tố (MFA), Single Sign-On (SSO), và các chính sách truy cập linh hoạt.</p>
              </div>
              <div className="card bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md border dark:border-gray-700">
                <div className="text-blue-500 mb-4"><i className="fas fa-cogs fa-3x"></i></div>
                <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Tự động hóa Luồng làm việc</h4>
                <p className="text-gray-600 dark:text-gray-400">Tự động cấp và thu hồi quyền truy cập, giảm thiểu công việc thủ công và sai sót.</p>
              </div>
              <div className="card bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md border dark:border-gray-700">
                <div className="text-blue-500 mb-4"><i className="fas fa-chart-line fa-3x"></i></div>
                <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Giám sát và Báo cáo</h4>
                <p className="text-gray-600 dark:text-gray-400">Theo dõi mọi hoạt động truy cập với audit log chi tiết và dashboard trực quan.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="bg-gray-50 dark:bg-gray-800 py-20">
          <div className="container mx-auto px-6">
            <h3 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">Bảng giá linh hoạt</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Free Plan */}
              <div className="card bg-white dark:bg-gray-700 p-8 rounded-lg shadow-md border dark:border-gray-600 text-center">
                <h4 className="text-xl font-bold text-gray-900 dark:text-white">Miễn phí</h4>
                <p className="text-4xl font-bold text-gray-900 dark:text-white my-4">$0<span className="text-lg text-gray-500 dark:text-gray-400">/tháng</span></p>
                <ul className="text-gray-600 dark:text-gray-300 space-y-2">
                  <li>10 người dùng</li>
                  <li>Xác thực cơ bản</li>
                  <li>Hỗ trợ cộng đồng</li>
                </ul>
                <button className="mt-8 border border-blue-500 text-blue-500 px-6 py-2 rounded-md w-full hover:bg-blue-500 hover:text-white">Bắt đầu</button>
              </div>
              {/* Pro Plan */}
              <div className="card bg-white dark:bg-gray-700 p-8 rounded-lg shadow-lg border-2 border-blue-500 text-center">
                <p className="bg-blue-500 text-white text-sm font-bold py-1 px-4 rounded-full inline-block mb-4">Phổ biến</p>
                <h4 className="text-xl font-bold text-gray-900 dark:text-white">Chuyên nghiệp</h4>
                <p className="text-4xl font-bold text-gray-900 dark:text-white my-4">$49<span className="text-lg text-gray-500 dark:text-gray-400">/tháng</span></p>
                <ul className="text-gray-600 dark:text-gray-300 space-y-2">
                  <li>100 người dùng</li>
                  <li>Tích hợp SSO & MFA</li>
                  <li>Hỗ trợ qua email</li>
                </ul>
                <button className="mt-8 bg-blue-600 text-white px-6 py-2 rounded-md w-full hover:bg-blue-700">Chọn gói Pro</button>
              </div>
              {/* Enterprise Plan */}
              <div className="card bg-white dark:bg-gray-700 p-8 rounded-lg shadow-md border dark:border-gray-600 text-center">
                <h4 className="text-xl font-bold text-gray-900 dark:text-white">Doanh nghiệp</h4>
                <p className="text-4xl font-bold text-gray-900 dark:text-white my-4">Liên hệ</p>
                <ul className="text-gray-600 dark:text-gray-300 space-y-2">
                  <li>Không giới hạn người dùng</li>
                  <li>Hỗ trợ chuyên biệt</li>
                  <li>SLA & Tùy chỉnh</li>
                </ul>
                <button className="mt-8 border border-blue-500 text-blue-500 px-6 py-2 rounded-md w-full hover:bg-blue-500 hover:text-white">Liên hệ</button>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="py-20">
            <div className="container mx-auto px-6">
                <h3 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">Khách hàng nói gì về chúng tôi</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="card bg-gray-50 dark:bg-gray-800 p-8 rounded-lg">
                        <p className="text-gray-600 dark:text-gray-300 mb-4">&ldquo;IAM SaaS đã thay đổi hoàn toàn cách chúng tôi quản lý truy cập. Nhanh chóng, an toàn và cực kỳ dễ sử dụng.&rdquo;</p>
                        <div className="flex items-center">
                            <Image className="w-12 h-12 rounded-full" src="https://randomuser.me/api/portraits/men/32.jpg" alt="User testimonial" width={48} height={48}/>
                            <div className="ml-4">
                                <p className="font-semibold text-gray-900 dark:text-white">John Doe</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">CTO, Acme Inc.</p>
                            </div>
                        </div>
                    </div>
                    <div className="card bg-gray-50 dark:bg-gray-800 p-8 rounded-lg">
                        <p className="text-gray-600 dark:text-gray-300 mb-4">&ldquo;Một giải pháp mạnh mẽ với mức giá không thể tin được. Đội ngũ hỗ trợ cũng rất tuyệt vời.&rdquo;</p>
                        <div className="flex items-center">
                            <Image className="w-12 h-12 rounded-full" src="https://randomuser.me/api/portraits/women/44.jpg" alt="User testimonial" width={48} height={48}/>
                            <div className="ml-4">
                                <p className="font-semibold text-gray-900 dark:text-white">Jane Smith</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Head of IT, Beta Corp.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        {/* Call to Action Section */}
        <section className="bg-blue-600 text-white py-20">
            <div className="container mx-auto px-6 text-center">
                <h3 className="text-3xl font-bold mb-4">Sẵn sàng để Tăng cường Bảo mật?</h3>
                <p className="mb-8">Tham gia cùng hàng ngàn doanh nghiệp đang tin tưởng IAM SaaS.</p>
                <Link href="/signup" className="bg-white text-blue-600 px-8 py-3 rounded-full font-semibold hover:bg-gray-200 text-lg">
                    Bắt đầu ngay
                </Link>
            </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 dark:bg-black text-white py-8">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h5 className="font-bold mb-4">Sản phẩm</h5>
              <ul>
                <li><a href="#" className="hover:underline">Tính năng</a></li>
                <li><a href="#" className="hover:underline">Bảng giá</a></li>
                <li><a href="#" className="hover:underline">Bảo mật</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-bold mb-4">Công ty</h5>
              <ul>
                <li><a href="#" className="hover:underline">Về chúng tôi</a></li>
                <li><a href="#" className="hover:underline">Liên hệ</a></li>
                <li><a href="#" className="hover:underline">Sự nghiệp</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-bold mb-4">Tài nguyên</h5>
              <ul>
                <li><a href="#" className="hover:underline">Tài liệu</a></li>
                <li><a href="#" className="hover:underline">API Reference</a></li>
                <li><a href="#" className="hover:underline">Blog</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-bold mb-4">Pháp lý</h5>
              <ul>
                <li><a href="#" className="hover:underline">Điều khoản</a></li>
                <li><a href="#" className="hover:underline">Chính sách</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-700 text-center text-sm">
            <p>&copy; 2024 IAM SaaS. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

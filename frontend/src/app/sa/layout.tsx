import Link from 'next/link';

export default function SaLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-64 bg-white shadow-md p-4">
        <h2 className="text-xl font-bold mb-4">Super Admin</h2>
        <nav>
          <ul>
            <li className="mb-2">
              <Link href="/sa/tenants" className="text-blue-600 hover:text-blue-800">
                Tenants
              </Link>
            </li>
            <li className="mb-2">
              <Link href="/sa/plans" className="text-blue-600 hover:text-blue-800">
                Plans
              </Link>
            </li>
            <li className="mb-2">
              <Link href="/sa/requests" className="text-blue-600 hover:text-blue-800">
                Requests
              </Link>
            </li>
            <li className="mb-2">
              <Link href="/sa/support-tickets" className="text-blue-600 hover:text-blue-800">
                Support Tickets
              </Link>
            </li>
            <li className="mb-2">
              <Link href="/sa/subscriptions" className="text-blue-600 hover:text-blue-800">
                Subscriptions
              </Link>
            </li>
            <li className="mb-2">
              <Link href="/sa/security" className="text-blue-600 hover:text-blue-800">
                Security Dashboard
              </Link>
            </li>
          </ul>
        </nav>
      </aside>
      <main className="flex-1 p-6 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
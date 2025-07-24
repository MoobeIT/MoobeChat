import { DashboardHeader } from '@/components/dashboard/header'
import { DashboardSidebar } from '@/components/dashboard/sidebar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <DashboardHeader />
      <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
        <DashboardSidebar />
        <main className="flex-1 overflow-auto p-4 md:p-6 dark:bg-gray-900">
          <div className="max-w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
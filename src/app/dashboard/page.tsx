'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import DashboardNav from '@/components/DashboardNav'

export default function DashboardPage() {
  const { data: session } = useSession()
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gray-100">
      <DashboardNav />

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Quick Actions */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Quick Actions</h3>
                <div className="mt-5">
                  <button
                    onClick={() => router.push('/dashboard/reports/new')}
                    className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 mb-3"
                  >
                    New Report
                  </button>
                  <button
                    onClick={() => router.push('/dashboard/patients/new')}
                    className="w-full bg-white text-indigo-600 border border-indigo-600 px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-50"
                  >
                    New Patient
                  </button>
                </div>
              </div>
            </div>

            {/* Profile Card */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Profile</h3>
                <div className="mt-5">
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Name</p>
                      <p className="text-sm text-gray-900">{session?.user?.name}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Role</p>
                      <p className="text-sm text-gray-900">{session?.user?.role}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Email</p>
                      <p className="text-sm text-gray-900">{session?.user?.email}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">License Number</p>
                      <p className="text-sm text-gray-900">{session?.user?.licenseNumber || 'Not set'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Institution</p>
                      <p className="text-sm text-gray-900">{session?.user?.institutionName || 'Not set'}</p>
                    </div>
                  </div>
                  <div className="mt-5">
                    <Link
                      href="/dashboard/profile"
                      className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 inline-block text-center"
                    >
                      Edit Profile
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Reports */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Reports</h3>
                <div className="mt-5">
                  <p className="text-gray-500">No recent reports</p>
                </div>
              </div>
            </div>

            {/* Statistics */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Statistics</h3>
                <div className="mt-5">
                  <p className="text-gray-500">No statistics available</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 
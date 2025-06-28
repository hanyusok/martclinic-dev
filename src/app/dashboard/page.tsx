'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import DashboardNav from '@/components/DashboardNav'
import { fetchUserDataWithCache } from '@/lib/userCache'
import { dateUtils } from '@/lib/date-utils'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

interface Patient {
  id: string
  fullName: string
  dateOfBirth: string
  gender: string
}

interface Report {
  id: string
  examinationDate: string
  examinationType: string
  patient: Patient
  createdAt: string
}

interface Stats {
  totalReports: number
  totalPatients: number
  reportsThisMonth: number
  reportsLastMonth: number
  monthlyGrowth: number
  reportsThisYear: number
  examinationTypeStats: Array<{
    type: string
    count: number
    label: string
  }>
  reportTypeStats: Array<{
    type: string
    count: number
    label: string
  }>
  monthlyTrend: Array<{
    month: string
    count: number
  }>
  genderStats: Array<{
    gender: string
    count: number
    label: string
  }>
  recentActivity: number
}

export default function DashboardPage() {
  const { data: session, update } = useSession()
  const router = useRouter()
  const [recentReports, setRecentReports] = useState<Report[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [userData, setUserData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [statsLoading, setStatsLoading] = useState(true)
  const [userLoading, setUserLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch recent reports
        const reportsResponse = await fetch('/api/reports/recent')
        if (reportsResponse.ok) {
          const reportsData = await reportsResponse.json()
          setRecentReports(reportsData)
        }

        // Fetch statistics
        const statsResponse = await fetch('/api/dashboard/stats')
        if (statsResponse.ok) {
          const statsData = await statsResponse.json()
          setStats(statsData)
        }

        // Fetch fresh user data from database using cache
        if (session?.user?.id) {
          const userData = await fetchUserDataWithCache(session.user.id)
          if (userData) {
            setUserData(userData)
          }
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
        setStatsLoading(false)
        setUserLoading(false)
      }
    }

    if (session) {
      fetchData()
    }
  }, [session])

  // Refresh session data when user returns to dashboard
  useEffect(() => {
    const handleFocus = async () => {
      try {
        // Fetch fresh user data from database using cache
        if (session?.user?.id) {
          const userData = await fetchUserDataWithCache(session.user.id)
          if (userData) {
            setUserData(userData)
          }
        }
      } catch (error) {
        console.error('Error refreshing user data:', error)
      }
    }

    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [session])

  const formatDate = (dateString: string) => {
    return dateUtils.formatKoreanDate(dateString)
  }

  const getExaminationTypeLabel = (type: string) => {
    switch (type) {
      case 'GENERAL':
        return '일반'
      case 'DETAILED':
        return '정밀'
      case 'LIMITED':
        return '제한적'
      default:
        return type
    }
  }

  const formatNumber = (num: number) => {
    return num.toLocaleString('ko-KR')
  }

  const getGrowthColor = (growth: number) => {
    if (growth > 0) return 'text-green-600'
    if (growth < 0) return 'text-red-600'
    return 'text-gray-600'
  }

  const getGrowthIcon = (growth: number) => {
    if (growth > 0) return '↗'
    if (growth < 0) return '↘'
    return '→'
  }

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
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Profile</h3>
                  {userData && (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                      📊 Fresh DB Data
                    </span>
                  )}
                </div>
                <div className="mt-5">
                  {userLoading ? (
                    <div className="text-center py-4">
                      <LoadingSpinner size="md" />
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Name</p>
                        <p className="text-sm text-gray-900">{userData?.name || session?.user?.name}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Role</p>
                        <p className="text-sm text-gray-900">{userData?.role || session?.user?.role}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Email</p>
                        <p className="text-sm text-gray-900">{userData?.email || session?.user?.email}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">License Number</p>
                        <p className="text-sm text-gray-900">{userData?.licenseNumber || session?.user?.licenseNumber || 'Not set'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Institution</p>
                        <p className="text-sm text-gray-900">{userData?.institutionName || session?.user?.institutionName || 'Not set'}</p>
                      </div>
                    </div>
                  )}
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
                <div className="flex items-center justify-between">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Reports</h3>
                  <Link
                    href="/dashboard/reports"
                    className="text-sm text-indigo-600 hover:text-indigo-500"
                  >
                    View All
                  </Link>
                </div>
                <div className="mt-5">
                  {loading ? (
                    <div className="text-center py-4">
                      <LoadingSpinner size="md" />
                    </div>
                  ) : recentReports.length > 0 ? (
                    <div className="space-y-4">
                      {recentReports.map((report) => (
                        <div
                          key={report.id}
                          className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors"
                        >
                          <Link href={`/dashboard/reports/${report.id}`}>
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <h4 className="text-sm font-medium text-gray-900">
                                  {report.patient.fullName}
                                </h4>
                                <p className="text-xs text-gray-500 mt-1">
                                  {formatDate(report.examinationDate)} • {getExaminationTypeLabel(report.examinationType)}
                                </p>
                              </div>
                              <div className="text-xs text-gray-400">
                                {formatDate(report.createdAt)}
                              </div>
                            </div>
                          </Link>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No recent reports</p>
                  )}
                </div>
              </div>
            </div>

            {/* Statistics */}
            <div className="bg-white overflow-hidden shadow rounded-lg lg:col-span-2">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-6">Statistics Overview</h3>
                
                {statsLoading ? (
                  <div className="text-center py-8">
                    <LoadingSpinner size="lg" />
                  </div>
                ) : stats ? (
                  <div className="space-y-6">
                    {/* Key Metrics */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-blue-50 rounded-lg p-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                              <span className="text-white text-sm font-medium">📊</span>
                            </div>
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-blue-600">Total Reports</p>
                            <p className="text-2xl font-bold text-blue-900">{formatNumber(stats.totalReports)}</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-green-50 rounded-lg p-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                              <span className="text-white text-sm font-medium">👥</span>
                            </div>
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-green-600">Total Patients</p>
                            <p className="text-2xl font-bold text-green-900">{formatNumber(stats.totalPatients)}</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-purple-50 rounded-lg p-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                              <span className="text-white text-sm font-medium">📅</span>
                            </div>
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-purple-600">This Month</p>
                            <p className="text-2xl font-bold text-purple-900">{formatNumber(stats.reportsThisMonth)}</p>
                            <p className={`text-xs ${getGrowthColor(stats.monthlyGrowth)}`}>
                              {getGrowthIcon(stats.monthlyGrowth)} {stats.monthlyGrowth}%
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-orange-50 rounded-lg p-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-orange-500 rounded-md flex items-center justify-center">
                              <span className="text-white text-sm font-medium">⚡</span>
                            </div>
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-orange-600">Recent Activity</p>
                            <p className="text-2xl font-bold text-orange-900">{formatNumber(stats.recentActivity)}</p>
                            <p className="text-xs text-orange-600">Last 7 days</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Examination Type Breakdown */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-3">Examination Types (This Month)</h4>
                      <div className="space-y-2">
                        {stats.examinationTypeStats.map((typeStat) => (
                          <div key={typeStat.type} className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">{typeStat.label}</span>
                            <div className="flex items-center">
                              <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                                <div 
                                  className="bg-indigo-600 h-2 rounded-full" 
                                  style={{ 
                                    width: `${(typeStat.count / Math.max(...stats.examinationTypeStats.map(s => s.count), 1)) * 100}%` 
                                  }}
                                ></div>
                              </div>
                              <span className="text-sm font-medium text-gray-900">{typeStat.count}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Report Type Breakdown */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-3">Report Types (This Month)</h4>
                      <div className="space-y-2">
                        {stats.reportTypeStats.map((typeStat) => (
                          <div key={typeStat.type} className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">{typeStat.label}</span>
                            <div className="flex items-center">
                              <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                                <div 
                                  className="bg-green-600 h-2 rounded-full" 
                                  style={{ 
                                    width: `${(typeStat.count / Math.max(...stats.reportTypeStats.map(s => s.count), 1)) * 100}%` 
                                  }}
                                ></div>
                              </div>
                              <span className="text-sm font-medium text-gray-900">{typeStat.count}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Monthly Trend */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-3">Monthly Trend (Last 6 Months)</h4>
                      <div className="flex items-end justify-between h-20">
                        {stats.monthlyTrend.map((month, index) => (
                          <div key={index} className="flex flex-col items-center">
                            <div 
                              className="bg-indigo-600 rounded-t w-8 mb-1"
                              style={{ 
                                height: `${(month.count / Math.max(...stats.monthlyTrend.map(m => m.count), 1)) * 60}px` 
                              }}
                            ></div>
                            <span className="text-xs text-gray-600">{month.month}</span>
                            <span className="text-xs font-medium text-gray-900">{month.count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500">No statistics available</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 
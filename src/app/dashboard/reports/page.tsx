'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import DashboardNav from '@/components/DashboardNav'

interface Report {
  id: string
  patient: {
    fullName: string
  }
  reportType: string
  examinationDate: string
  findings: string
  impression: string
  doctor: {
    name: string
  }
}

export default function ReportsPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [reports, setReports] = useState<Report[]>([])

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    try {
      const response = await fetch('/api/reports')
      if (!response.ok) throw new Error('Failed to fetch reports')
      const data = await response.json()
      setReports(data)
    } catch (error) {
      console.error('Error fetching reports:', error)
    }
  }

  const handlePrint = async (reportId: string) => {
    window.open(`/dashboard/reports/${reportId}/print`, '_blank')
  }

  const getReportTypeLabel = (reportType: string) => {
    return reportType === 'ABDOMINAL' ? '상복부' : '경동맥'
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <DashboardNav />
      
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">Reports</h1>
            <Link
              href="/dashboard/reports/new"
              className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700"
            >
              New Report
            </Link>
          </div>

          {/* Reports List */}
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            {reports.length === 0 ? (
              <div className="px-6 py-4 text-center text-gray-500">
                No reports found. Create a new report to get started.
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {reports.map((report) => (
                  <li key={report.id}>
                    <div className="px-6 py-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-3">
                            <div className="text-sm font-medium text-gray-900">
                              {report.patient.fullName}
                            </div>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {getReportTypeLabel(report.reportType)}
                            </span>
                          </div>
                          <div className="mt-1 text-sm text-gray-500">
                            Examination Date: {new Date(report.examinationDate).toLocaleDateString()}
                          </div>
                          <div className="mt-1 text-sm text-gray-500">
                            Doctor: {report.doctor.name}
                          </div>
                          {report.impression && (
                            <div className="mt-2 text-sm text-gray-500">
                              Impression: {report.impression}
                            </div>
                          )}
                        </div>
                        <div className="ml-4 flex-shrink-0 flex space-x-4">
                          <Link
                            href={`/dashboard/reports/${report.id}`}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            View
                          </Link>
                          <button
                            onClick={() => handlePrint(report.id)}
                            className="text-green-600 hover:text-green-900"
                          >
                            Print
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 
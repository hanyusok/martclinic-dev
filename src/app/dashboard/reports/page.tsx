'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

interface Report {
  id: string
  patient: {
    firstName: string
    lastName: string
  }
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
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    patientId: '',
  })

  useEffect(() => {
    fetchReports()
  }, [filters])

  const fetchReports = async () => {
    try {
      setIsLoading(true)
      const queryParams = new URLSearchParams()
      if (filters.startDate) queryParams.append('startDate', filters.startDate)
      if (filters.endDate) queryParams.append('endDate', filters.endDate)
      if (filters.patientId) queryParams.append('patientId', filters.patientId)

      const response = await fetch(`/api/reports?${queryParams.toString()}`)
      if (!response.ok) throw new Error('Failed to fetch reports')
      const data = await response.json()
      setReports(data)
    } catch (error) {
      setError('Failed to load reports')
    } finally {
      setIsLoading(false)
    }
  }

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFilters((prev) => ({ ...prev, [name]: value }))
  }

  const handlePrint = (reportId: string) => {
    window.open(`/dashboard/reports/${reportId}/print`, '_blank')
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">Ultrasound Reports</h1>
            <button
              onClick={() => router.push('/dashboard/reports/new')}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700"
            >
              New Report
            </button>
          </div>

          {/* Filters */}
          <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6 mb-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                  Start Date
                </label>
                <input
                  type="date"
                  name="startDate"
                  id="startDate"
                  value={filters.startDate}
                  onChange={handleFilterChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                  End Date
                </label>
                <input
                  type="date"
                  name="endDate"
                  id="endDate"
                  value={filters.endDate}
                  onChange={handleFilterChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
            </div>
          </div>

          {/* Reports List */}
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            {isLoading ? (
              <div className="px-6 py-4 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
              </div>
            ) : error ? (
              <div className="px-6 py-4 text-center text-red-500">{error}</div>
            ) : reports.length === 0 ? (
              <div className="px-6 py-4 text-center text-gray-500">No reports found</div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {reports.map((report) => (
                  <li key={report.id}>
                    <div className="px-6 py-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-indigo-600 truncate">
                              {report.patient.firstName} {report.patient.lastName}
                            </p>
                            <div className="ml-2 flex-shrink-0 flex">
                              <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                {new Date(report.examinationDate).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="mt-2 flex justify-between">
                            <div className="sm:flex">
                              <p className="flex items-center text-sm text-gray-500">
                                Doctor: {report.doctor.name}
                              </p>
                            </div>
                            <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                              <p className="truncate">{report.impression}</p>
                            </div>
                          </div>
                        </div>
                        <div className="ml-4 flex-shrink-0 flex space-x-4">
                          <button
                            onClick={() => router.push(`/dashboard/reports/${report.id}`)}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            View
                          </button>
                          <button
                            onClick={() => handlePrint(report.id)}
                            className="text-indigo-600 hover:text-indigo-900"
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
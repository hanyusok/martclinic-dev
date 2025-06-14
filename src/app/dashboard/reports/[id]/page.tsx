'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

interface Report {
  id: string
  patient: {
    id: string
    firstName: string
    lastName: string
    dateOfBirth: string
    gender: string
  }
  doctor: {
    name: string
  }
  examinationDate: string
  findings: string
  impression: string
  recommendations: string
  images: string[]
}

export default function ReportDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [report, setReport] = useState<Report | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editedReport, setEditedReport] = useState<Partial<Report>>({})

  useEffect(() => {
    fetchReport()
  }, [params.id])

  const fetchReport = async () => {
    try {
      const response = await fetch(`/api/reports/${params.id}`)
      if (!response.ok) throw new Error('Failed to fetch report')
      const data = await response.json()
      setReport(data)
      setEditedReport(data)
    } catch (error) {
      setError('Failed to load report')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditedReport(report || {})
  }

  const handleSave = async () => {
    try {
      const response = await fetch(`/api/reports/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editedReport),
      })

      if (!response.ok) throw new Error('Failed to update report')
      const updatedReport = await response.json()
      setReport(updatedReport)
      setIsEditing(false)
    } catch (error) {
      setError('Failed to update report')
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this report?')) return

    try {
      const response = await fetch(`/api/reports/${params.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete report')
      router.push('/dashboard/reports')
    } catch (error) {
      setError('Failed to delete report')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-500">Loading report information...</div>
      </div>
    )
  }

  if (error || !report) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-red-500">{error || 'Report not found'}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">Ultrasound Report</h1>
            <div className="flex space-x-4">
              <button
                onClick={() => router.back()}
                className="bg-white text-gray-700 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50"
              >
                Back
              </button>
              <Link
                href={`/dashboard/reports/${report.id}/print`}
                className="bg-white text-gray-700 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50"
              >
                Print
              </Link>
              {isEditing ? (
                <>
                  <button
                    onClick={handleCancel}
                    className="bg-white text-gray-700 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700"
                  >
                    Save
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleEdit}
                    className="bg-white text-gray-700 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50"
                  >
                    Edit
                  </button>
                  <button
                    onClick={handleDelete}
                    className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700"
                  >
                    Delete
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Patient Information */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
            <div className="px-4 py-5 sm:px-6">
              <h2 className="text-lg font-medium text-gray-900">Patient Information</h2>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="text-sm font-medium text-gray-900">
                    {report.patient.firstName} {report.patient.lastName}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Date of Birth</p>
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(report.patient.dateOfBirth).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Gender</p>
                  <p className="text-sm font-medium text-gray-900">{report.patient.gender}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Examining Doctor</p>
                  <p className="text-sm font-medium text-gray-900">{report.doctor.name}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Report Content */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h2 className="text-lg font-medium text-gray-900">Report Details</h2>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Examination Date</label>
                  {isEditing ? (
                    <input
                      type="datetime-local"
                      value={editedReport.examinationDate?.slice(0, 16)}
                      onChange={(e) =>
                        setEditedReport({ ...editedReport, examinationDate: e.target.value })
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  ) : (
                    <p className="mt-1 text-sm text-gray-900">
                      {new Date(report.examinationDate).toLocaleString()}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Findings</label>
                  {isEditing ? (
                    <textarea
                      value={editedReport.findings}
                      onChange={(e) =>
                        setEditedReport({ ...editedReport, findings: e.target.value })
                      }
                      rows={4}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  ) : (
                    <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{report.findings}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Impression</label>
                  {isEditing ? (
                    <textarea
                      value={editedReport.impression}
                      onChange={(e) =>
                        setEditedReport({ ...editedReport, impression: e.target.value })
                      }
                      rows={4}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  ) : (
                    <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{report.impression}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Recommendations</label>
                  {isEditing ? (
                    <textarea
                      value={editedReport.recommendations}
                      onChange={(e) =>
                        setEditedReport({ ...editedReport, recommendations: e.target.value })
                      }
                      rows={3}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  ) : (
                    <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">
                      {report.recommendations || 'N/A'}
                    </p>
                  )}
                </div>

                {/* Images */}
                {report.images.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-4">
                      Ultrasound Images
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      {report.images.map((image, index) => (
                        <div key={index} className="relative">
                          <img
                            src={image}
                            alt={`Ultrasound image ${index + 1}`}
                            className="w-full h-auto rounded-lg shadow-lg"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 
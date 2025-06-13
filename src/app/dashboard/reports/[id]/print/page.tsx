'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'

interface Report {
  id: string
  patient: {
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

export default function PrintReportPage() {
  const params = useParams()
  const { data: session } = useSession()
  const [report, setReport] = useState<Report | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchReport()
  }, [])

  const fetchReport = async () => {
    try {
      const response = await fetch(`/api/reports/${params.id}`)
      if (!response.ok) throw new Error('Failed to fetch report')
      const data = await response.json()
      setReport(data)
    } catch (error) {
      setError('Failed to load report')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!isLoading && report) {
      window.print()
    }
  }, [isLoading, report])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    )
  }

  if (error || !report) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        {error || 'Report not found'}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Ultrasound Report</h1>
          <p className="text-gray-600 mt-2">
            Date: {new Date(report.examinationDate).toLocaleDateString()}
          </p>
        </div>

        {/* Patient Information */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Patient Information</h2>
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

        {/* Report Content */}
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Findings</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{report.findings}</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Impression</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{report.impression}</p>
          </div>

          {report.recommendations && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Recommendations</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{report.recommendations}</p>
            </div>
          )}

          {/* Images */}
          {report.images.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Ultrasound Images</h2>
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

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">Report ID: {report.id}</p>
              <p className="text-sm text-gray-500">
                Generated on: {new Date().toLocaleDateString()}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Examining Doctor</p>
              <p className="text-sm font-medium text-gray-900">{report.doctor.name}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 
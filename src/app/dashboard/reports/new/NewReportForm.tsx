'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'

interface Patient {
  id: string
  firstName: string
  lastName: string
  dateOfBirth: string
  gender: string
}

export default function NewReportForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session } = useSession()
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [patient, setPatient] = useState<Patient | null>(null)
  const [selectedImages, setSelectedImages] = useState<File[]>([])

  useEffect(() => {
    const patientId = searchParams.get('patientId')
    if (patientId) {
      fetchPatient(patientId)
    }
  }, [searchParams])

  const fetchPatient = async (patientId: string) => {
    try {
      const response = await fetch(`/api/patients/${patientId}`)
      if (!response.ok) throw new Error('Failed to fetch patient')
      const data = await response.json()
      setPatient(data)
    } catch (error) {
      setError('Failed to fetch patient information')
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedImages(Array.from(e.target.files))
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const reportData = {
      patientId: patient?.id,
      findings: formData.get('findings'),
      impression: formData.get('impression'),
      recommendations: formData.get('recommendations'),
      examinationDate: formData.get('examinationDate'),
    }

    try {
      // First, upload images if any
      const imageUrls = []
      if (selectedImages.length > 0) {
        for (const image of selectedImages) {
          const imageFormData = new FormData()
          imageFormData.append('file', image)
          const uploadResponse = await fetch('/api/upload', {
            method: 'POST',
            body: imageFormData,
          })
          if (!uploadResponse.ok) throw new Error('Failed to upload image')
          const { url } = await uploadResponse.json()
          imageUrls.push(url)
        }
      }

      // Then create the report
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...reportData,
          images: imageUrls,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create report')
      }

      router.push('/dashboard/reports')
    } catch (err) {
      setError('Failed to create report. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-2xl font-semibold text-gray-900 mb-6">New Ultrasound Report</h1>

            {patient && (
              <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6 mb-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Patient Information</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="text-sm font-medium text-gray-900">
                      {patient.firstName} {patient.lastName}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Date of Birth</p>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(patient.dateOfBirth).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Gender</p>
                    <p className="text-sm font-medium text-gray-900">{patient.gender}</p>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6 bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
              {error && (
                <div className="bg-red-50 border-l-4 border-red-400 p-4">
                  <div className="flex">
                    <div className="ml-3">
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="examinationDate" className="block text-sm font-medium text-gray-700">
                  Examination Date
                </label>
                <input
                  type="datetime-local"
                  name="examinationDate"
                  id="examinationDate"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="findings" className="block text-sm font-medium text-gray-700">
                  Findings
                </label>
                <textarea
                  name="findings"
                  id="findings"
                  rows={4}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="impression" className="block text-sm font-medium text-gray-700">
                  Impression
                </label>
                <textarea
                  name="impression"
                  id="impression"
                  rows={4}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="recommendations" className="block text-sm font-medium text-gray-700">
                  Recommendations
                </label>
                <textarea
                  name="recommendations"
                  id="recommendations"
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Ultrasound Images</label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                      aria-hidden="true"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                      >
                        <span>Upload files</span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          multiple
                          accept="image/*"
                          className="sr-only"
                          onChange={handleImageChange}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                  </div>
                </div>
                {selectedImages.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-500">Selected images:</p>
                    <ul className="mt-2 grid grid-cols-2 gap-4">
                      {selectedImages.map((file, index) => (
                        <li key={index} className="text-sm text-gray-500">
                          {file.name}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-indigo-600 text-white py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  {isSubmitting ? 'Creating...' : 'Create Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
} 
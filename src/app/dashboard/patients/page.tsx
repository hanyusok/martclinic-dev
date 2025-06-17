'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

interface Patient {
  id: string
  firstName: string
  lastName: string
  dateOfBirth: string
  gender: string
  phoneNumber?: string
}

export default function PatientsPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [searchTerm, setSearchTerm] = useState('')
  const [patients, setPatients] = useState<Patient[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchPatients()
  }, [])

  const fetchPatients = async (search?: string) => {
    try {
      setIsLoading(true)
      const url = search ? `/api/patients?search=${encodeURIComponent(search)}` : '/api/patients'
      const response = await fetch(url)
      if (!response.ok) throw new Error('Failed to fetch patients')
      const data = await response.json()
      setPatients(data)
    } catch (err) {
      setError('Failed to load patients')
      console.error('Error fetching patients:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    await fetchPatients(searchTerm)
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="bg-white text-gray-700 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50"
              >
                Back to Dashboard
              </button>
              <h1 className="text-2xl font-semibold text-gray-900">Patients</h1>
            </div>
            <Link
              href="/dashboard/patients/new"
              className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700"
            >
              Add New Patient
            </Link>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="mb-6">
            <div className="flex gap-4">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search patients..."
                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
              <button
                type="submit"
                className="bg-white text-indigo-600 border border-indigo-600 px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-50"
              >
                Search
              </button>
            </div>
          </form>

          {/* Patients Table */}
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            {isLoading ? (
              <div className="px-6 py-4 text-center text-gray-500">Loading patients...</div>
            ) : error ? (
              <div className="px-6 py-4 text-center text-red-500">{error}</div>
            ) : patients.length === 0 ? (
              <div className="px-6 py-4 text-center text-gray-500">
                No patients found. Add a new patient to get started.
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {patients.map((patient) => (
                  <li key={patient.id}>
                    <div className="px-6 py-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {patient.firstName} {patient.lastName}
                            </div>
                            <div className="text-sm text-gray-500">
                              DOB: {new Date(patient.dateOfBirth).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <Link
                            href={`/dashboard/patients/${patient.id}`}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            View
                          </Link>
                          <Link
                            href={`/dashboard/reports/new?patientId=${patient.id}`}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            New Report
                          </Link>
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
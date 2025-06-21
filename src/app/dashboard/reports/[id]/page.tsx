'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

interface Report {
  id: string
  patient: {
    id: string
    fullName: string
    dateOfBirth: string
    gender: string
    patientNumber?: string
  }
  doctor: {
    name: string
    licenseNumber?: string
  }
  examinationDate: string
  interpretationDate?: string
  findings: string
  impression: string
  recommendations: string
  images: string[]
  conclusion?: string
  additionalNotes?: string
  signature?: string
  signatureDate?: string
  liverEcho?: string
  liverMass?: string
  gallbladderAbnormal?: string
  bileDuctDilation?: string
  spleenEnlargement?: string
  pancreasAbnormal?: string
  institutionName?: string
  institutionAddress?: string
  institutionPhone?: string
  examinationType: string
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
            <h1 className="text-2xl font-semibold text-gray-900">상복부 초음파 검사 판독소견서</h1>
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

          {/* 의료기관 정보 */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
            <div className="px-4 py-5 sm:px-6">
              <h2 className="text-lg font-medium text-gray-900">의료기관 정보</h2>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:px-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-500">의료기관명칭</p>
                <p className="text-sm font-medium text-gray-900">{report.institutionName || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">의료기관 주소</p>
                <p className="text-sm font-medium text-gray-900">{report.institutionAddress || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">전화번호</p>
                <p className="text-sm font-medium text-gray-900">{report.institutionPhone || '-'}</p>
              </div>
            </div>
          </div>

          {/* 환자 정보 */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
            <div className="px-4 py-5 sm:px-6">
              <h2 className="text-lg font-medium text-gray-900">환자 정보</h2>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:px-6 grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">등록번호</p>
                <p className="text-sm font-medium text-gray-900">{report.patient.patientNumber || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">성명</p>
                <p className="text-sm font-medium text-gray-900">{report.patient.fullName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">생년월일</p>
                <p className="text-sm font-medium text-gray-900">{new Date(report.patient.dateOfBirth).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">성별</p>
                <p className="text-sm font-medium text-gray-900">{report.patient.gender === 'MALE' ? '남' : report.patient.gender === 'FEMALE' ? '여' : '기타'}</p>
              </div>
            </div>
          </div>

          {/* 검사 정보 */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
            <div className="px-4 py-5 sm:px-6">
              <h2 className="text-lg font-medium text-gray-900">검사 정보</h2>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:px-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-500">검사명</p>
                <p className="text-sm font-medium text-gray-900">{report.examinationType === 'GENERAL' ? '일반' : report.examinationType === 'DETAILED' ? '정밀' : '제한적'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">검사일시</p>
                <p className="text-sm font-medium text-gray-900">{new Date(report.examinationDate).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">판독일시</p>
                <p className="text-sm font-medium text-gray-900">{report.interpretationDate ? new Date(report.interpretationDate).toLocaleString() : '-'}</p>
              </div>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:px-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">검사 및 판독 의사</p>
                <p className="text-sm font-medium text-gray-900">{report.doctor.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">면허번호</p>
                <p className="text-sm font-medium text-gray-900">{report.doctor.licenseNumber || '-'}</p>
              </div>
            </div>
          </div>

          {/* 검사소견 */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
            <div className="px-4 py-5 sm:px-6">
              <h2 className="text-lg font-medium text-gray-900">검사소견</h2>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:px-6 space-y-4">
              <div>
                <p className="text-sm text-gray-500">간 실질의 에코</p>
                <p className="text-sm font-medium text-gray-900">{report.liverEcho || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">간종괴 유무</p>
                <p className="text-sm font-medium text-gray-900">{report.liverMass ? `있음 (${report.liverMass})` : '없음'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">담낭 이상 여부</p>
                <p className="text-sm font-medium text-gray-900">{report.gallbladderAbnormal ? `있음 (${report.gallbladderAbnormal})` : '없음'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">담관 확장 여부</p>
                <p className="text-sm font-medium text-gray-900">{report.bileDuctDilation ? `있음 (${report.bileDuctDilation})` : '없음'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">비장 종대 여부</p>
                <p className="text-sm font-medium text-gray-900">{report.spleenEnlargement ? `있음 (${report.spleenEnlargement})` : '없음'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">췌장 이상 여부</p>
                <p className="text-sm font-medium text-gray-900">{report.pancreasAbnormal ? `있음 (${report.pancreasAbnormal})` : '없음'}</p>
              </div>
            </div>
          </div>

          {/* 결론 및 추가 소견 */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
            <div className="px-4 py-5 sm:px-6">
              <h2 className="text-lg font-medium text-gray-900">결론 및 추가 소견</h2>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:px-6 space-y-4">
              <div>
                <p className="text-sm text-gray-500">결론</p>
                <p className="text-sm font-medium text-gray-900">{report.conclusion || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">추가 소견 또는 권고사항</p>
                <p className="text-sm font-medium text-gray-900">{report.additionalNotes || report.recommendations || '-'}</p>
              </div>
            </div>
          </div>

          {/* 서명 */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
            <div className="px-4 py-5 sm:px-6">
              <h2 className="text-lg font-medium text-gray-900">서명</h2>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:px-6 grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">판독 의사 서명</p>
                <p className="text-sm font-medium text-gray-900">{report.signature || report.doctor.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">작성일</p>
                <p className="text-sm font-medium text-gray-900">{report.signatureDate ? new Date(report.signatureDate).toLocaleDateString() : '-'}</p>
              </div>
            </div>
          </div>

          {/* 이미지 */}
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
  )
} 
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
    patientNumber?: string
  }
  doctor: {
    name: string
    licenseNumber?: string
  }
  examinationDate: string
  findings: string
  impression: string
  recommendations: string
  images: string[]
  institutionName?: string
  institutionAddress?: string
  institutionPhone?: string
  examinationType: string
  interpretationDate?: string
  liverEcho?: string
  liverMass?: string
  gallbladderAbnormal?: string
  bileDuctDilation?: string
  spleenEnlargement?: string
  pancreasAbnormal?: string
  conclusion?: string
  additionalNotes?: string
  signature?: string
  signatureDate?: string
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
          <h1 className="text-3xl font-bold text-gray-900">상복부 초음파 검사 판독소견서</h1>
          <p className="text-gray-600 mt-2">
            검사일시: {new Date(report.examinationDate).toLocaleDateString()}
          </p>
        </div>

        {/* 의료기관 정보 */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">의료기관 정보</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">환자 정보</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">등록번호</p>
              <p className="text-sm font-medium text-gray-900">{report.patient.patientNumber || report.patient.id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">성명</p>
              <p className="text-sm font-medium text-gray-900">{report.patient.firstName} {report.patient.lastName}</p>
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
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">검사 정보</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
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
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">검사소견</h2>
          <div className="space-y-2">
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
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">결론 및 추가 소견</h2>
          <div className="space-y-2">
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
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">서명</h2>
          <div className="grid grid-cols-2 gap-4">
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
    </div>
  )
} 
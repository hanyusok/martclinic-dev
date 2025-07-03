'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'

interface Report {
  id: string
  patient: {
    id: string
    fullName: string
    dateOfBirth: string
    gender: string
    recordNumber?: string
  }
  doctor: {
    name: string
    licenseNumber?: string
  }
  reportType: string
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
  // Abdominal ultrasound fields
  liverEcho?: string
  liverMass?: string
  gallbladderAbnormal?: string
  bileDuctDilation?: string
  spleenEnlargement?: string
  pancreasAbnormal?: string
  // Carotid ultrasound fields
  rightCarotidImt?: string
  leftCarotidImt?: string
  rightCarotidStenosis?: string
  leftCarotidStenosis?: string
  rightCarotidPlaque?: string
  leftCarotidPlaque?: string
  rightCarotidFlow?: string
  leftCarotidFlow?: string
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
  }, [params.id])

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading report...</p>
        </div>
      </div>
    )
  }

  if (error || !report) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">{error || 'Report not found'}</p>
        </div>
      </div>
    )
  }

  const getReportTitle = () => {
    return report.reportType === 'ABDOMINAL' ? '상복부 초음파 검사 판독소견서' : '경동맥 초음파 검사 판독소견서'
  }

  return (
    <div className="min-h-screen bg-white p-4 print:p-2">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-4 print:mb-2">
          <h1 className="text-2xl font-bold text-gray-900 print:text-xl">{getReportTitle()}</h1>
          <p className="text-gray-600 mt-1 print:text-sm">
            검사일시: {new Date(report.examinationDate).toLocaleDateString()}
          </p>
        </div>

        {/* Compact Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:gap-2 mb-4 print:mb-2">
          {/* 의료기관 정보 */}
          <div className="bg-gray-50 p-3 print:p-2 rounded">
            <h2 className="text-sm font-semibold text-gray-900 mb-2 print:text-xs">의료기관 정보</h2>
            <div className="space-y-1 print:space-y-0.5">
              <div className="flex">
                <span className="text-xs text-gray-500 w-20 print:w-16">의료기관명칭:</span>
                <span className="text-xs font-medium text-gray-900">{report.institutionName || '-'}</span>
              </div>
              <div className="flex">
                <span className="text-xs text-gray-500 w-20 print:w-16">의료기관 주소:</span>
                <span className="text-xs font-medium text-gray-900">{report.institutionAddress || '-'}</span>
              </div>
              <div className="flex">
                <span className="text-xs text-gray-500 w-20 print:w-16">전화번호:</span>
                <span className="text-xs font-medium text-gray-900">{report.institutionPhone || '-'}</span>
              </div>
            </div>
          </div>

          {/* 환자 정보 */}
          <div className="bg-gray-50 p-3 print:p-2 rounded">
            <h2 className="text-sm font-semibold text-gray-900 mb-2 print:text-xs">환자 정보</h2>
            <div className="space-y-1 print:space-y-0.5">
              <div className="flex">
                <span className="text-xs text-gray-500 w-16 print:w-12">등록번호:</span>
                <span className="text-xs font-medium text-gray-900">{report.patient.recordNumber || report.patient.id}</span>
              </div>
              <div className="flex">
                <span className="text-xs text-gray-500 w-16 print:w-12">성명:</span>
                <span className="text-xs font-medium text-gray-900">{report.patient.fullName}</span>
              </div>
              <div className="flex">
                <span className="text-xs text-gray-500 w-16 print:w-12">생년월일:</span>
                <span className="text-xs font-medium text-gray-900">{new Date(report.patient.dateOfBirth).toLocaleDateString()}</span>
              </div>
              <div className="flex">
                <span className="text-xs text-gray-500 w-16 print:w-12">성별:</span>
                <span className="text-xs font-medium text-gray-900">{report.patient.gender}</span>
              </div>
            </div>
          </div>

          {/* 검사 정보 */}
          <div className="bg-gray-50 p-3 print:p-2 rounded">
            <h2 className="text-sm font-semibold text-gray-900 mb-2 print:text-xs">검사 정보</h2>
            <div className="space-y-1 print:space-y-0.5">
              <div className="flex">
                <span className="text-xs text-gray-500 w-16 print:w-12">검사 유형:</span>
                <span className="text-xs font-medium text-gray-900">
                  {report.reportType === 'ABDOMINAL' ? '상복부 초음파' : '경동맥 초음파'}
                </span>
              </div>
              <div className="flex">
                <span className="text-xs text-gray-500 w-16 print:w-12">검사명:</span>
                <span className="text-xs font-medium text-gray-900">{report.examinationType}</span>
              </div>
              <div className="flex">
                <span className="text-xs text-gray-500 w-16 print:w-12">검사일시:</span>
                <span className="text-xs font-medium text-gray-900">{new Date(report.examinationDate).toLocaleString()}</span>
              </div>
              <div className="flex">
                <span className="text-xs text-gray-500 w-16 print:w-12">판독일시:</span>
                <span className="text-xs font-medium text-gray-900">
                  {report.interpretationDate ? new Date(report.interpretationDate).toLocaleString() : '-'}
                </span>
              </div>
            </div>
          </div>

          {/* 의사 정보 */}
          <div className="bg-gray-50 p-3 print:p-2 rounded">
            <h2 className="text-sm font-semibold text-gray-900 mb-2 print:text-xs">의사 정보</h2>
            <div className="space-y-1 print:space-y-0.5">
              <div className="flex">
                <span className="text-xs text-gray-500 w-16 print:w-12">의사명:</span>
                <span className="text-xs font-medium text-gray-900">{report.doctor.name}</span>
              </div>
              <div className="flex">
                <span className="text-xs text-gray-500 w-16 print:w-12">면허번호:</span>
                <span className="text-xs font-medium text-gray-900">{report.doctor.licenseNumber || '-'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 검사소견 */}
        <div className="mb-4 print:mb-2">
          <h2 className="text-lg font-semibold text-gray-900 mb-3 print:text-sm print:mb-2">
            {report.reportType === 'ABDOMINAL' ? '검사소견 (상복부)' : '검사소견 (경동맥)'}
          </h2>
          
          {report.reportType === 'ABDOMINAL' ? (
            <div className="bg-gray-50 p-3 print:p-2 rounded">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 print:gap-2">
                <div className="flex">
                  <span className="text-xs text-gray-500 w-24 print:w-20">간 실질의 에코:</span>
                  <span className="text-xs font-medium text-gray-900">{report.liverEcho || '-'}</span>
                </div>
                <div className="flex">
                  <span className="text-xs text-gray-500 w-24 print:w-20">간종괴 유무:</span>
                  <span className="text-xs font-medium text-gray-900">{report.liverMass ? `있음 (${report.liverMass})` : '없음'}</span>
                </div>
                <div className="flex">
                  <span className="text-xs text-gray-500 w-24 print:w-20">담낭 이상 여부:</span>
                  <span className="text-xs font-medium text-gray-900">{report.gallbladderAbnormal ? `있음 (${report.gallbladderAbnormal})` : '없음'}</span>
                </div>
                <div className="flex">
                  <span className="text-xs text-gray-500 w-24 print:w-20">담관 확장 여부:</span>
                  <span className="text-xs font-medium text-gray-900">{report.bileDuctDilation ? `있음 (${report.bileDuctDilation})` : '없음'}</span>
                </div>
                <div className="flex">
                  <span className="text-xs text-gray-500 w-24 print:w-20">비장 종대 여부:</span>
                  <span className="text-xs font-medium text-gray-900">{report.spleenEnlargement ? `있음 (${report.spleenEnlargement})` : '없음'}</span>
                </div>
                <div className="flex">
                  <span className="text-xs text-gray-500 w-24 print:w-20">췌장 이상 여부:</span>
                  <span className="text-xs font-medium text-gray-900">{report.pancreasAbnormal ? `있음 (${report.pancreasAbnormal})` : '없음'}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 p-3 print:p-2 rounded">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 print:gap-2">
                <div className="flex">
                  <span className="text-xs text-gray-500 w-24 print:w-20">우측 경동맥 IMT:</span>
                  <span className="text-xs font-medium text-gray-900">{report.rightCarotidImt || '-'}</span>
                </div>
                <div className="flex">
                  <span className="text-xs text-gray-500 w-24 print:w-20">좌측 경동맥 IMT:</span>
                  <span className="text-xs font-medium text-gray-900">{report.leftCarotidImt || '-'}</span>
                </div>
                <div className="flex">
                  <span className="text-xs text-gray-500 w-24 print:w-20">우측 경동맥 협착:</span>
                  <span className="text-xs font-medium text-gray-900">{report.rightCarotidStenosis || '-'}</span>
                </div>
                <div className="flex">
                  <span className="text-xs text-gray-500 w-24 print:w-20">좌측 경동맥 협착:</span>
                  <span className="text-xs font-medium text-gray-900">{report.leftCarotidStenosis || '-'}</span>
                </div>
                <div className="flex">
                  <span className="text-xs text-gray-500 w-24 print:w-20">우측 경동맥 플라크:</span>
                  <span className="text-xs font-medium text-gray-900">{report.rightCarotidPlaque || '-'}</span>
                </div>
                <div className="flex">
                  <span className="text-xs text-gray-500 w-24 print:w-20">좌측 경동맥 플라크:</span>
                  <span className="text-xs font-medium text-gray-900">{report.leftCarotidPlaque || '-'}</span>
                </div>
                <div className="flex">
                  <span className="text-xs text-gray-500 w-24 print:w-20">우측 경동맥 혈류:</span>
                  <span className="text-xs font-medium text-gray-900">{report.rightCarotidFlow || '-'}</span>
                </div>
                <div className="flex">
                  <span className="text-xs text-gray-500 w-24 print:w-20">좌측 경동맥 혈류:</span>
                  <span className="text-xs font-medium text-gray-900">{report.leftCarotidFlow || '-'}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 결론 및 추가 소견 */}
        <div className="mb-4 print:mb-2">
          <h2 className="text-lg font-semibold text-gray-900 mb-3 print:text-sm print:mb-2">결론 및 추가 소견</h2>
          <div className="bg-gray-50 p-3 print:p-2 rounded">
            <div className="space-y-2 print:space-y-1">
              <div>
                <span className="text-xs text-gray-500">결론:</span>
                <p className="text-xs font-medium text-gray-900 mt-1">{report.conclusion || '-'}</p>
              </div>
              <div>
                <span className="text-xs text-gray-500">추가 소견 또는 권고사항:</span>
                <p className="text-xs font-medium text-gray-900 mt-1">{report.additionalNotes || '-'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* 서명 */}
        <div className="mb-4 print:mb-2">
          <h2 className="text-lg font-semibold text-gray-900 mb-3 print:text-sm print:mb-2">서명</h2>
          <div className="bg-gray-50 p-3 print:p-2 rounded">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:gap-2">
              <div className="flex">
                <span className="text-xs text-gray-500 w-20 print:w-16">판독 의사 서명:</span>
                <span className="text-xs font-medium text-gray-900">{report.signature || report.doctor.name}</span>
              </div>
              <div className="flex">
                <span className="text-xs text-gray-500 w-20 print:w-16">작성일:</span>
                <span className="text-xs font-medium text-gray-900">{report.signatureDate ? new Date(report.signatureDate).toLocaleDateString() : '-'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 이미지 - Only show if there are images and space allows */}
        {report.images.length > 0 && (
          <div className="mb-4 print:mb-2">
            <h2 className="text-lg font-semibold text-gray-900 mb-3 print:text-sm print:mb-2">Ultrasound Images</h2>
            <div className="grid grid-cols-2 gap-4 print:gap-2">
              {report.images.slice(0, 4).map((image, index) => (
                <div key={index} className="relative">
                  <img
                    src={image}
                    alt={`Ultrasound image ${index + 1}`}
                    className="w-full h-auto rounded-lg shadow-lg print:max-h-32"
                  />
                </div>
              ))}
            </div>
            {report.images.length > 4 && (
              <p className="text-xs text-gray-500 mt-2 print:mt-1">
                + {report.images.length - 4} more images
              </p>
            )}
          </div>
        )}
      </div>

      {/* Print-specific styles */}
      <style jsx>{`
        @media print {
          @page {
            margin: 0.5in;
            size: A4;
          }
          body {
            font-size: 10pt;
            line-height: 1.2;
          }
          .print\\:text-xs {
            font-size: 8pt !important;
          }
          .print\\:text-sm {
            font-size: 9pt !important;
          }
          .print\\:text-xl {
            font-size: 14pt !important;
          }
          .print\\:p-2 {
            padding: 0.25rem !important;
          }
          .print\\:mb-2 {
            margin-bottom: 0.25rem !important;
          }
          .print\\:gap-2 {
            gap: 0.25rem !important;
          }
          .print\\:space-y-0\\.5 > * + * {
            margin-top: 0.125rem !important;
          }
          .print\\:space-y-1 > * + * {
            margin-top: 0.25rem !important;
          }
          .print\\:w-12 {
            width: 3rem !important;
          }
          .print\\:w-16 {
            width: 4rem !important;
          }
          .print\\:w-20 {
            width: 5rem !important;
          }
          .print\\:max-h-32 {
            max-height: 8rem !important;
          }
        }
      `}</style>
    </div>
  )
} 
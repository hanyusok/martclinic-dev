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
  const [institutionName, setInstitutionName] = useState('');
  const [institutionAddress, setInstitutionAddress] = useState('');
  const [institutionPhone, setInstitutionPhone] = useState('');
  const [examinationType, setExaminationType] = useState('GENERAL');
  const [interpretationDate, setInterpretationDate] = useState('');
  const [liverEcho, setLiverEcho] = useState('');
  const [liverMass, setLiverMass] = useState('');
  const [liverMassPresent, setLiverMassPresent] = useState('없음');
  const [gallbladderAbnormal, setGallbladderAbnormal] = useState('');
  const [gallbladderAbnormalPresent, setGallbladderAbnormalPresent] = useState('없음');
  const [bileDuctDilation, setBileDuctDilation] = useState('');
  const [bileDuctDilationPresent, setBileDuctDilationPresent] = useState('없음');
  const [spleenEnlargement, setSpleenEnlargement] = useState('');
  const [spleenEnlargementPresent, setSpleenEnlargementPresent] = useState('없음');
  const [pancreasAbnormal, setPancreasAbnormal] = useState('');
  const [pancreasAbnormalPresent, setPancreasAbnormalPresent] = useState('없음');
  const [conclusion, setConclusion] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [signature, setSignature] = useState('');
  const [signatureDate, setSignatureDate] = useState('');

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
      institutionName,
      institutionAddress,
      institutionPhone,
      examinationType,
      examinationDate: formData.get('examinationDate'),
      interpretationDate,
      liverEcho,
      liverMass: liverMassPresent === '있음' ? liverMass : '',
      gallbladderAbnormal: gallbladderAbnormalPresent === '있음' ? gallbladderAbnormal : '',
      bileDuctDilation: bileDuctDilationPresent === '있음' ? bileDuctDilation : '',
      spleenEnlargement: spleenEnlargementPresent === '있음' ? spleenEnlargement : '',
      pancreasAbnormal: pancreasAbnormalPresent === '있음' ? pancreasAbnormal : '',
      findings: '', // legacy
      impression: '', // legacy
      recommendations: '', // legacy
      conclusion,
      additionalNotes,
      signature,
      signatureDate,
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
            <h1 className="text-2xl font-semibold text-gray-900 mb-6">상복부 초음파 검사 판독소견서</h1>

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

              {/* 의료기관 정보 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">의료기관명칭</label>
                  <input type="text" value={institutionName} onChange={e => setInstitutionName(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">의료기관 주소</label>
                  <input type="text" value={institutionAddress} onChange={e => setInstitutionAddress(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">전화번호</label>
                  <input type="text" value={institutionPhone} onChange={e => setInstitutionPhone(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                </div>
              </div>
              <hr className="my-4" />
              {/* 환자 정보 */}
              {patient && (
                <div className="bg-gray-50 p-4 rounded mb-4">
                  <h2 className="text-lg font-medium text-gray-900 mb-2">환자 정보</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-500">등록번호</label>
                      <input type="text" value={patient.id} readOnly className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-100" />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-500">성명</label>
                      <input type="text" value={patient.firstName + ' ' + patient.lastName} readOnly className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-100" />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-500">생년월일/나이</label>
                      <input type="text" value={new Date(patient.dateOfBirth).toLocaleDateString()} readOnly className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-100" />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-500">성별</label>
                      <input type="text" value={patient.gender === 'MALE' ? '남' : patient.gender === 'FEMALE' ? '여' : '기타'} readOnly className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-100" />
                    </div>
                  </div>
                </div>
              )}
              {/* 검사 정보 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">검사명</label>
                  <select value={examinationType} onChange={e => setExaminationType(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                    <option value="GENERAL">일반</option>
                    <option value="DETAILED">정밀</option>
                    <option value="LIMITED">제한적</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">검사일시</label>
                  <input type="datetime-local" name="examinationDate" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">판독일시</label>
                  <input type="datetime-local" value={interpretationDate} onChange={e => setInterpretationDate(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                </div>
              </div>
              {/* 검사 및 판독 의사 정보 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">검사 및 판독 의사</label>
                  <input type="text" value={session?.user?.name || ''} readOnly className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-100" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">면허번호</label>
                  <input type="text" value={session?.user?.licenseNumber || ''} readOnly className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-100" />
                </div>
              </div>
              <hr className="my-4" />
              {/* 검사소견 */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">간 실질의 에코</label>
                  <input type="text" value={liverEcho} onChange={e => setLiverEcho(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">간종괴 유무</label>
                    <select value={liverMassPresent} onChange={e => setLiverMassPresent(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                      <option value="없음">없음</option>
                      <option value="있음">있음</option>
                    </select>
                  </div>
                  {liverMassPresent === '있음' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">세부내용</label>
                      <input type="text" value={liverMass} onChange={e => setLiverMass(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">담낭 이상 여부</label>
                    <select value={gallbladderAbnormalPresent} onChange={e => setGallbladderAbnormalPresent(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                      <option value="없음">없음</option>
                      <option value="있음">있음</option>
                    </select>
                  </div>
                  {gallbladderAbnormalPresent === '있음' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">세부내용</label>
                      <input type="text" value={gallbladderAbnormal} onChange={e => setGallbladderAbnormal(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">담관 확장 여부</label>
                    <select value={bileDuctDilationPresent} onChange={e => setBileDuctDilationPresent(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                      <option value="없음">없음</option>
                      <option value="있음">있음</option>
                    </select>
                  </div>
                  {bileDuctDilationPresent === '있음' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">세부내용</label>
                      <input type="text" value={bileDuctDilation} onChange={e => setBileDuctDilation(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">비장 종대 여부</label>
                    <select value={spleenEnlargementPresent} onChange={e => setSpleenEnlargementPresent(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                      <option value="없음">없음</option>
                      <option value="있음">있음</option>
                    </select>
                  </div>
                  {spleenEnlargementPresent === '있음' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">세부내용</label>
                      <input type="text" value={spleenEnlargement} onChange={e => setSpleenEnlargement(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">췌장 이상 여부</label>
                    <select value={pancreasAbnormalPresent} onChange={e => setPancreasAbnormalPresent(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                      <option value="없음">없음</option>
                      <option value="있음">있음</option>
                    </select>
                  </div>
                  {pancreasAbnormalPresent === '있음' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">세부내용</label>
                      <input type="text" value={pancreasAbnormal} onChange={e => setPancreasAbnormal(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                    </div>
                  )}
                </div>
              </div>
              <hr className="my-4" />
              {/* 결론 및 추가 소견 */}
              <div>
                <label className="block text-sm font-medium text-gray-700">결론</label>
                <textarea value={conclusion} onChange={e => setConclusion(e.target.value)} rows={2} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">추가 소견 또는 권고사항</label>
                <textarea value={additionalNotes} onChange={e => setAdditionalNotes(e.target.value)} rows={2} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
              </div>
              <hr className="my-4" />
              {/* 서명 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">판독 의사 서명</label>
                  <input type="text" value={signature} onChange={e => setSignature(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">작성일</label>
                  <input type="date" value={signatureDate} onChange={e => setSignatureDate(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">초음파 이미지 업로드</label>
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
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-indigo-600 text-white py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  {isSubmitting ? '생성 중...' : '보고서 생성'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
} 
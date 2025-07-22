'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { getCurrentProfile, updateProfile } from '@/lib/database'

export default function Profile() {
  const { user, loading } = useAuth()
  const router = useRouter()
  
  const [profile, setProfile] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  // 폼 데이터
  const [formData, setFormData] = useState({
    full_name: '',
    bio: '',
    phone: '',
    website: '',
    location: ''
  })

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
    } else if (user) {
      loadProfile()
    }
  }, [user, loading, router])

  const loadProfile = async () => {
    setIsLoading(true)
    const { data, error } = await getCurrentProfile()
    
    if (error) {
      setError(error)
    } else if (data) {
      setProfile(data)
      setFormData({
        full_name: data.full_name || '',
        bio: data.bio || '',
        phone: data.phone || '',
        website: data.website || '',
        location: data.location || ''
      })
    }
    setIsLoading(false)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSaving(true)
    setError('')
    setMessage('')

    const { data, error } = await updateProfile(user.id, formData)
    
    if (error) {
      setError(error)
    } else {
      setProfile(data)
      setMessage('프로필이 성공적으로 업데이트되었습니다!')
      setTimeout(() => setMessage(''), 3000)
    }
    
    setIsSaving(false)
  }

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">로딩 중...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 네비게이션 */}
      <div className="bg-white shadow">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                프로필 설정
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="text-gray-500 hover:text-gray-700"
              >
                대시보드로 돌아가기
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 프로필 폼 */}
      <div className="py-10">
        <div className="max-w-3xl mx-auto sm:px-6 lg:px-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* 기본 정보 */}
                <div>
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    기본 정보
                  </h3>
                  
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        이메일
                      </label>
                      <input
                        type="email"
                        value={user.email}
                        disabled
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        이름
                      </label>
                      <input
                        type="text"
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="전체 이름을 입력하세요"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        전화번호
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="전화번호를 입력하세요"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        웹사이트
                      </label>
                      <input
                        type="url"
                        name="website"
                        value={formData.website}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="https://example.com"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700">
                        위치
                      </label>
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="도시, 국가"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700">
                        자기소개
                      </label>
                      <textarea
                        name="bio"
                        value={formData.bio}
                        onChange={handleInputChange}
                        rows={4}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="자신에 대해 간단히 소개해주세요"
                      />
                    </div>
                  </div>
                </div>

                {/* 메시지 */}
                {error && (
                  <div className="text-red-600 text-sm">
                    {error}
                  </div>
                )}

                {message && (
                  <div className="text-green-600 text-sm">
                    {message}
                  </div>
                )}

                {/* 저장 버튼 */}
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving ? '저장 중...' : '프로필 저장'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 
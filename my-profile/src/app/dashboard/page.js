'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

export default function Dashboard() {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
    }
  }, [user, loading, router])

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  if (loading) {
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
      <div className="bg-white shadow">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                대시보드
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">
                {user.email}
              </span>
              <button
                onClick={() => router.push('/profile')}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                프로필 설정
              </button>
              <button
                onClick={handleSignOut}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                로그아웃
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="py-10">
        <main>
          <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div className="px-4 py-6 sm:px-0">
              <div className="border-4 border-dashed border-gray-200 rounded-lg p-8">
                <div className="text-center">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                    <svg
                      className="h-6 w-6 text-green-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    로그인 성공!
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Supabase 인증이 성공적으로 작동하고 있습니다. 이제 데이터베이스와 연동할 수 있어요!
                  </p>
                  <div className="mt-4 space-x-4">
                    <button
                      onClick={() => router.push('/profile')}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-600 bg-indigo-100 hover:bg-indigo-200"
                    >
                      프로필 관리하기
                    </button>
                    <button
                      onClick={() => router.push('/posts')}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-pink-600 bg-pink-100 hover:bg-pink-200"
                    >
                      📔 일기장 가기
                    </button>
                  </div>
                  <div className="mt-6">
                    <div className="bg-gray-100 px-4 py-3 rounded-md">
                      <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                        <div>
                          <dt className="text-sm font-medium text-gray-500">
                            사용자 ID
                          </dt>
                          <dd className="mt-1 text-sm text-gray-900 break-all">
                            {user.id}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">
                            이메일
                          </dt>
                          <dd className="mt-1 text-sm text-gray-900">
                            {user.email}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">
                            생성일
                          </dt>
                          <dd className="mt-1 text-sm text-gray-900">
                            {new Date(user.created_at).toLocaleDateString('ko-KR')}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">
                            마지막 로그인
                          </dt>
                          <dd className="mt-1 text-sm text-gray-900">
                            {new Date(user.last_sign_in_at).toLocaleDateString('ko-KR')}
                          </dd>
                        </div>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
} 
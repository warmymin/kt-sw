'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { createPost } from '@/lib/posts'

export default function NewPost() {
  const { user, loading } = useAuth()
  const router = useRouter()
  
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [mood, setMood] = useState('')
  const [weather, setWeather] = useState('')
  const [isPrivate, setIsPrivate] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
    }
  }, [user, loading, router])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!content.trim()) {
      setError('오늘 하루에 대한 내용을 작성해주세요.')
      return
    }

    setIsSubmitting(true)
    setError('')

    const { data, error } = await createPost({
      title: title.trim() || null,
      content: content.trim(),
      mood: mood || null,
      weather: weather || null,
      diary_date: new Date().toISOString().split('T')[0],
      is_private: isPrivate
    })
    
    if (error) {
      setError(error)
    } else {
      router.push(`/posts/${data.id}`)
    }
    
    setIsSubmitting(false)
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
      {/* 네비게이션 */}
      <div className="bg-white shadow">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                📝 오늘의 하루 기록하기
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/posts')}
                className="text-gray-500 hover:text-gray-700"
              >
                일기장으로 돌아가기
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 폼 */}
      <div className="py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-6 py-4">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* 오늘의 기분과 날씨 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-pink-700 mb-3">
                      오늘의 기분 😊
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { value: 'happy', emoji: '😊', label: '행복' },
                        { value: 'sad', emoji: '😢', label: '슬픔' },
                        { value: 'excited', emoji: '🤗', label: '신남' },
                        { value: 'tired', emoji: '😴', label: '피곤' },
                        { value: 'angry', emoji: '😠', label: '화남' },
                        { value: 'calm', emoji: '😌', label: '평온' },
                        { value: 'anxious', emoji: '😰', label: '불안' },
                        { value: 'grateful', emoji: '🙏', label: '감사' }
                      ].map((moodOption) => (
                        <button
                          key={moodOption.value}
                          type="button"
                          onClick={() => setMood(mood === moodOption.value ? '' : moodOption.value)}
                          className={`p-3 rounded-lg border text-center transition-colors ${
                            mood === moodOption.value
                              ? 'bg-pink-100 border-pink-500 text-pink-700'
                              : 'bg-white border-gray-300 hover:border-pink-300'
                          }`}
                        >
                          <div className="text-2xl mb-1">{moodOption.emoji}</div>
                          <div className="text-xs">{moodOption.label}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-pink-700 mb-3">
                      오늘의 날씨 🌤️
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { value: 'sunny', emoji: '☀️', label: '맑음' },
                        { value: 'cloudy', emoji: '☁️', label: '흐림' },
                        { value: 'rainy', emoji: '🌧️', label: '비' },
                        { value: 'snowy', emoji: '❄️', label: '눈' },
                        { value: 'windy', emoji: '💨', label: '바람' }
                      ].map((weatherOption) => (
                        <button
                          key={weatherOption.value}
                          type="button"
                          onClick={() => setWeather(weather === weatherOption.value ? '' : weatherOption.value)}
                          className={`p-3 rounded-lg border text-center transition-colors ${
                            weather === weatherOption.value
                              ? 'bg-blue-100 border-blue-500 text-blue-700'
                              : 'bg-white border-gray-300 hover:border-blue-300'
                          }`}
                        >
                          <div className="text-2xl mb-1">{weatherOption.emoji}</div>
                          <div className="text-xs">{weatherOption.label}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 제목 (선택사항) */}
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-pink-700">
                    제목 (선택사항)
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="mt-1 block w-full border-pink-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500"
                    placeholder="특별한 제목이 있다면 적어보세요..."
                  />
                </div>

                {/* 일기 내용 */}
                <div>
                  <label htmlFor="content" className="block text-sm font-medium text-pink-700">
                    오늘 하루는 어떠셨나요? ✍️
                  </label>
                  <textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={12}
                    className="mt-1 block w-full border-pink-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500"
                    placeholder="오늘 있었던 일들, 느낀 점들을 자유롭게 적어보세요...&#10;&#10;예를 들어:&#10;- 오늘 점심에 맛있는 파스타를 먹었다&#10;- 친구와 즐거운 대화를 나누었다&#10;- 새로운 것을 배웠다&#10;- 힘들었지만 보람된 하루였다"
                    required
                  />
                </div>

                {/* 공개/비공개 설정 */}
                <div className="flex items-center">
                  <input
                    id="is-private"
                    type="checkbox"
                    checked={isPrivate}
                    onChange={(e) => setIsPrivate(e.target.checked)}
                    className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
                  />
                  <label htmlFor="is-private" className="ml-2 block text-sm text-gray-700">
                    🔒 나만 볼 수 있는 비공개 일기로 설정
                  </label>
                </div>

                {/* 에러 메시지 */}
                {error && (
                  <div className="text-red-600 text-sm">
                    {error}
                  </div>
                )}

                {/* 버튼들 */}
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => router.push('/posts')}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-pink-600 hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? '저장 중...' : '📝 일기 저장하기'}
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
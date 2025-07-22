'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { getAllPosts } from '@/lib/posts'

export default function Posts() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [posts, setPosts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
    } else if (user) {
      loadPosts()
    }
  }, [user, loading, router])

  const loadPosts = async () => {
    setIsLoading(true)
    const { data, error } = await getAllPosts()
    
    if (error) {
      console.error('일기 로딩 에러:', error)
      alert(`일기 로딩 실패: ${error}`)
    } else {
      setPosts(data || [])
    }
    setIsLoading(false)
  }

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.content.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
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
                📔 오늘의 하루
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard"
                className="text-gray-500 hover:text-gray-700"
              >
                대시보드
              </Link>
              <Link
                href="/posts/new"
                className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                📝 일기 쓰기
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* 검색 바 */}
          <div className="mb-8">
            <div className="max-w-md">
              <input
                type="text"
                placeholder="일기 검색... 🔍"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-pink-300 rounded-md focus:ring-pink-500 focus:border-pink-500"
              />
            </div>
          </div>

          {/* 일기 목록 */}
          <div className="space-y-6">
            {filteredPosts.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📖</div>
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  아직 작성된 일기가 없어요
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  오늘 하루는 어떠셨나요? 첫 번째 일기를 작성해보세요! ✨
                </p>
                <div className="mt-6">
                  <Link
                    href="/posts/new"
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-pink-600 hover:bg-pink-700"
                  >
                    📝 일기 쓰기
                  </Link>
                </div>
              </div>
            ) : (
              filteredPosts.map((post) => {
                const getMoodEmoji = (mood) => {
                  const moodEmojis = {
                    'happy': '😊',
                    'sad': '😢',
                    'excited': '🤗',
                    'tired': '😴',
                    'angry': '😠',
                    'calm': '😌',
                    'anxious': '😰',
                    'grateful': '🙏'
                  }
                  return moodEmojis[mood] || '😐'
                }

                const getWeatherEmoji = (weather) => {
                  const weatherEmojis = {
                    'sunny': '☀️',
                    'cloudy': '☁️',
                    'rainy': '🌧️',
                    'snowy': '❄️',
                    'windy': '💨'
                  }
                  return weatherEmojis[weather] || '🌤️'
                }

                return (
                  <div key={post.id} className="bg-white overflow-hidden shadow-lg rounded-xl border border-pink-100">
                    <div className="px-6 py-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <span className="text-2xl">{getMoodEmoji(post.mood)}</span>
                            <span className="text-2xl">{getWeatherEmoji(post.weather)}</span>
                            <span className="text-sm font-medium text-pink-600">
                              {formatDate(post.diary_date || post.created_at)}
                            </span>
                          </div>
                          {post.title && (
                            <h2 className="text-lg font-medium text-gray-900 mb-2">
                              <Link
                                href={`/posts/${post.id}`}
                                className="hover:text-pink-600"
                              >
                                {post.title}
                              </Link>
                            </h2>
                          )}
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>💬 {post.comments_count}</span>
                        </div>
                      </div>
                      
                      <div className="prose prose-sm max-w-none">
                        <p className="text-gray-700 line-clamp-3 leading-relaxed">
                          {post.content}
                        </p>
                      </div>
                      
                      <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center space-x-2">
                          <span>✍️ {post.author_name || post.author_email}</span>
                        </div>
                        <Link
                          href={`/posts/${post.id}`}
                          className="text-pink-600 hover:text-pink-500 font-medium"
                        >
                          자세히 보기 →
                        </Link>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 
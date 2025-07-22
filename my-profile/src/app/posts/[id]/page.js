'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { getPost, deletePost } from '@/lib/posts'
import { getCommentsByPost, createComment, deleteComment } from '@/lib/comments'

export default function PostDetail() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const postId = params.id

  const [post, setPost] = useState(null)
  const [comments, setComments] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [newComment, setNewComment] = useState('')
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
    } else if (user && postId) {
      loadPostAndComments()
    }
  }, [user, loading, router, postId])

  const loadPostAndComments = async () => {
    setIsLoading(true)
    setError('')
    
    try {
      console.log('📖 일기와 응원 메시지 로딩 중...')
      
      // 게시물과 댓글을 병렬로 로드
      const [postResult, commentsResult] = await Promise.all([
        getPost(postId),
        getCommentsByPost(postId)
      ])
      
      if (postResult.error) {
        console.error('❌ 일기 로딩 실패:', postResult.error)
        setError(`일기를 불러올 수 없습니다: ${postResult.error}`)
        setPost(null)
      } else {
        console.log('✅ 일기 로딩 성공')
        setPost(postResult.data)
      }
      
      if (commentsResult.error) {
        console.error('❌ 응원 메시지 로딩 실패:', commentsResult.error)
        setComments([])
      } else {
        console.log('✅ 응원 메시지 로딩 성공:', commentsResult.data?.length || 0, '개')
        setComments(commentsResult.data || [])
      }
    } catch (error) {
      console.error('❌ 전체 로딩 에러:', error)
      setError('페이지를 불러오는 중 에러가 발생했습니다')
    }
    
    setIsLoading(false)
  }

  const handleSubmitComment = async (e) => {
    e.preventDefault()
    
    if (!newComment.trim()) {
      setError('응원 메시지를 입력해주세요')
      return
    }

    setIsSubmittingComment(true)
    setError('')
    
    try {
      console.log('💬 응원 메시지 전송 중...')
      const { data, error } = await createComment(postId, newComment.trim())
      
      if (error) {
        console.error('❌ 응원 메시지 전송 실패:', error)
        setError(`응원 메시지 전송 실패: ${error}`)
      } else {
        console.log('✅ 응원 메시지 전송 성공')
        setNewComment('')
        setError('')
        
        // 댓글 목록을 다시 로드
        const { data: updatedComments } = await getCommentsByPost(postId)
        setComments(updatedComments || [])
        
        // 성공 메시지 (선택적)
        console.log('💬 응원 메시지가 전송되었습니다!')
      }
    } catch (error) {
      console.error('❌ 응원 메시지 전송 에러:', error)
      setError('응원 메시지 전송 중 에러가 발생했습니다')
    }
    
    setIsSubmittingComment(false)
  }

  const handleDeleteComment = async (commentId) => {
    if (!confirm('댓글을 삭제하시겠습니까?')) {
      return
    }

    const { error } = await deleteComment(commentId)
    
    if (error) {
      setError(error)
    } else {
      // 댓글 목록을 다시 로드
      const { data: updatedComments } = await getCommentsByPost(postId)
      setComments(updatedComments || [])
      // 게시물 정보도 업데이트 (댓글 수 반영)
      const { data: updatedPost } = await getPost(postId)
      setPost(updatedPost)
    }
  }

  const handleDeletePost = async () => {
    if (!confirm('게시물을 삭제하시겠습니까?')) {
      return
    }

    const { error } = await deletePost(postId)
    
    if (error) {
      setError(error)
    } else {
      router.push('/posts')
    }
  }

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

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📖</div>
          <h3 className="text-lg font-medium text-gray-900">일기를 찾을 수 없습니다</h3>
          <Link href="/posts" className="mt-2 text-pink-600 hover:text-pink-500">
            일기장으로 돌아가기
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 네비게이션 */}
      <div className="bg-white shadow">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/posts" className="text-gray-500 hover:text-gray-700 mr-4">
                ← 일기장으로
              </Link>
              <h1 className="text-xl font-semibold text-gray-900">
                📖 일기 읽기
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              {user.id === post.author_id && (
                <>
                  <Link
                    href={`/posts/${postId}/edit`}
                    className="text-indigo-600 hover:text-indigo-500"
                  >
                    수정
                  </Link>
                  <button
                    onClick={handleDeletePost}
                    className="text-red-600 hover:text-red-500"
                  >
                    삭제
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* 일기 */}
          <div className="bg-white overflow-hidden shadow-lg rounded-xl border border-pink-100 mb-8">
            <div className="px-6 py-6">
              {/* 일기 헤더 */}
              <div className="border-b border-pink-100 pb-4 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    {post.mood && (
                      <span className="text-3xl">
                        {post.mood === 'happy' && '😊'}
                        {post.mood === 'sad' && '😢'}
                        {post.mood === 'excited' && '🤗'}
                        {post.mood === 'tired' && '😴'}
                        {post.mood === 'angry' && '😠'}
                        {post.mood === 'calm' && '😌'}
                        {post.mood === 'anxious' && '😰'}
                        {post.mood === 'grateful' && '🙏'}
                      </span>
                    )}
                    {post.weather && (
                      <span className="text-3xl">
                        {post.weather === 'sunny' && '☀️'}
                        {post.weather === 'cloudy' && '☁️'}
                        {post.weather === 'rainy' && '🌧️'}
                        {post.weather === 'snowy' && '❄️'}
                        {post.weather === 'windy' && '💨'}
                      </span>
                    )}
                    <div className="text-lg font-medium text-pink-600">
                      {formatDate(post.diary_date || post.created_at)}
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    💬 {post.comments_count}개의 응원
                  </div>
                </div>

                {post.title && (
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    {post.title}
                  </h1>
                )}

                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>✍️ {post.author_name || post.author_email}</span>
                  {post.is_private && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600">
                      🔒 비공개
                    </span>
                  )}
                </div>
              </div>
              
              {/* 일기 내용 */}
              <div className="prose prose-lg max-w-none">
                <div className="bg-gradient-to-br from-pink-50 to-purple-50 p-6 rounded-lg">
                  <p className="whitespace-pre-wrap text-gray-800 leading-relaxed text-lg">
                    {post.content}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 응원 메시지 섹션 */}
          <div className="bg-white overflow-hidden shadow-lg rounded-xl border border-pink-100">
            <div className="px-6 py-6">
              <h2 className="text-lg font-medium text-gray-900 mb-6">
                💌 응원 메시지 ({comments.length})
              </h2>

              {/* 응원 메시지 작성 폼 */}
              <form onSubmit={handleSubmitComment} className="mb-8">
                <div className="bg-pink-50 p-4 rounded-lg">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="따뜻한 응원 메시지를 남겨주세요... 💕"
                    rows={3}
                    className="w-full px-3 py-2 border border-pink-300 rounded-md focus:ring-pink-500 focus:border-pink-500 bg-white"
                  />
                  <div className="mt-3 flex justify-end">
                    <button
                      type="submit"
                      disabled={isSubmittingComment || !newComment.trim()}
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-pink-600 hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmittingComment ? '전송 중...' : '💌 응원 보내기'}
                    </button>
                  </div>
                </div>
              </form>

              {/* 에러 메시지 */}
              {error && (
                <div className="mb-4 text-red-600 text-sm">
                  {error}
                </div>
              )}

              {/* 응원 메시지 목록 */}
              <div className="space-y-4">
                {comments.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-4xl mb-2">💌</div>
                    아직 응원 메시지가 없어요. 첫 번째 응원을 보내주세요!
                  </div>
                ) : (
                  comments.map((comment) => (
                    <div key={comment.id} className="bg-gradient-to-r from-pink-50 to-purple-50 p-4 rounded-lg border-l-4 border-pink-300">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <span className="font-medium text-pink-700">
                            💕 {comment.author_name || comment.author_email}
                          </span>
                          <span>•</span>
                          <span>{formatDate(comment.created_at)}</span>
                        </div>
                        {user.id === comment.author_id && (
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            className="text-red-600 hover:text-red-500 text-sm"
                          >
                            삭제
                          </button>
                        )}
                      </div>
                      <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                        {comment.content}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 
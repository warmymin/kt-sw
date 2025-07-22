import { supabase } from './supabase'

// 게시물의 모든 댓글 조회 (간소화된 버전)
export const getCommentsByPost = async (postId) => {
  try {
    console.log('💬 응원 메시지 조회 중:', postId)
    
    // comments 테이블 존재 확인
    const { data: testData, error: testError } = await supabase
      .from('comments')
      .select('id')
      .limit(1)
    
    if (testError) {
      console.log('ℹ️ comments 테이블이 없습니다. 빈 배열을 반환합니다.')
      return { data: [], error: null }
    }
    
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('❌ 응원 메시지 조회 실패:', error?.message)
      return { data: [], error: null } // 에러가 있어도 빈 배열 반환 (댓글은 필수가 아님)
    }

    // 작성자 정보를 Unknown으로 임시 설정
    const transformedData = (data || []).map(comment => ({
      ...comment,
      author_name: null,
      author_email: 'Unknown'
    }))

    console.log('✅ 응원 메시지 조회 성공:', transformedData.length, '개')
    return { data: transformedData, error: null }
  } catch (error) {
    console.error('❌ 응원 메시지 조회 에러:', error?.message || error)
    return { data: [], error: null } // 에러가 있어도 빈 배열 반환
  }
}

// 댓글 생성 (간소화된 버전)
export const createComment = async (postId, content) => {
  try {
    console.log('💬 응원 메시지 작성 중...')
    
    // 사용자 인증 확인
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError) {
      console.error('❌ 인증 에러:', userError?.message)
      return { data: null, error: '로그인 상태를 확인할 수 없습니다' }
    }
    
    if (!user) {
      console.error('❌ 로그인되지 않음')
      return { data: null, error: '로그인이 필요합니다' }
    }

    // comments 테이블 존재 확인
    const { data: testData, error: testError } = await supabase
      .from('comments')
      .select('id')
      .limit(1)
    
    if (testError) {
      console.error('❌ comments 테이블이 없습니다:', testError?.message)
      return { 
        data: null, 
        error: 'comments 테이블을 먼저 생성해주세요. Supabase에서 SQL을 실행하세요.'
      }
    }

    console.log('✅ comments 테이블 확인됨')
    
    // 댓글 생성
    const { data, error } = await supabase
      .from('comments')
      .insert([
        {
          content: content.trim(),
          post_id: postId,
          author_id: user.id
        }
      ])
      .select()
      .single()

    if (error) {
      console.error('❌ 응원 메시지 작성 실패:', error?.message)
      return { data: null, error: error?.message || '응원 메시지 작성에 실패했습니다' }
    }

    console.log('✅ 응원 메시지 작성 성공')
    return { data, error: null }
  } catch (error) {
    console.error('❌ 응원 메시지 작성 에러:', error?.message || error)
    return { data: null, error: error?.message || '응원 메시지 작성 중 에러가 발생했습니다' }
  }
}

// 댓글 수정
export const updateComment = async (commentId, content) => {
  try {
    const { data, error } = await supabase
      .from('comments')
      .update({ content })
      .eq('id', commentId)
      .select()
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('댓글 수정 에러:', error)
    return { data: null, error: error.message }
  }
}

// 댓글 삭제
export const deleteComment = async (commentId) => {
  try {
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId)

    if (error) throw error
    return { error: null }
  } catch (error) {
    console.error('댓글 삭제 에러:', error)
    return { error: error.message }
  }
}

// 사용자별 댓글 조회
export const getUserComments = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('comments_with_author')
      .select('*')
      .eq('author_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('사용자 댓글 조회 에러:', error)
    return { data: null, error: error.message }
  }
} 
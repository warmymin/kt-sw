import { supabase } from './supabase'

// 모든 게시물 조회 (작성자 정보 포함)
export const getAllPosts = async () => {
  try {
    console.log('📔 일기 목록 조회 중...')
    
    // Supabase 연결 확인
    if (!supabase) {
      console.error('❌ Supabase 연결 실패')
      return {
        data: [],
        error: 'Supabase 연결 문제 - .env.local 파일을 확인하세요'
      }
    }
    
    // posts 테이블 확인
    const { data: testData, error: testError } = await supabase
      .from('posts')
      .select('id')
      .limit(1)
    
    if (testError) {
      console.error('❌ posts 테이블이 없습니다:', testError?.message)
      return { 
        data: [], 
        error: '📝 posts 테이블을 먼저 생성해주세요!'
      }
    }
    
    console.log('✅ posts 테이블 확인됨')

        // 간단한 posts 조회 (단계별 복잡성 제거)
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('diary_date', { ascending: false })
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('❌ 일기 조회 실패:', error?.message)
      throw new Error(`일기 조회 실패: ${error?.message || '알 수 없는 에러'}`)
    }

    // 작성자 정보를 Unknown으로 임시 설정
    const transformedData = data?.map(post => ({
      ...post,
      author_name: null,
      author_email: 'Unknown'
    })) || []

    console.log('✅ 일기 조회 성공:', transformedData.length, '개')
    return { data: transformedData, error: null }
    
  } catch (error) {
    console.error('❌ 최종 에러:', error?.message || error)
    return { 
      data: [], 
      error: error?.message || '일기 조회 중 에러가 발생했습니다'
    }
  }
}

// 특정 게시물 조회 (간소화된 버전)
export const getPost = async (postId) => {
  try {
    console.log('📖 일기 상세 조회 중:', postId)
    
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('id', postId)
      .single()

    if (error) {
      console.error('❌ 일기 조회 실패:', error?.message)
      return { data: null, error: error?.message || '일기를 찾을 수 없습니다' }
    }

    if (!data) {
      console.error('❌ 일기 데이터가 없습니다')
      return { data: null, error: '일기를 찾을 수 없습니다' }
    }

    // 작성자 정보를 Unknown으로 임시 설정
    const transformedData = {
      ...data,
      author_name: null,
      author_email: 'Unknown'
    }

    console.log('✅ 일기 상세 조회 성공')
    return { data: transformedData, error: null }
  } catch (error) {
    console.error('❌ 일기 상세 조회 에러:', error?.message || error)
    return { data: null, error: error?.message || '일기 조회 중 에러가 발생했습니다' }
  }
}

// 일기 생성
export const createPost = async (postData) => {
  try {
    console.log('일기 생성 시작:', postData)
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError) throw userError
    if (!user) throw new Error('로그인이 필요합니다')

    const { data, error } = await supabase
      .from('posts')
      .insert([
        {
          ...postData,
          author_id: user.id
        }
      ])
      .select()
      .single()

    if (error) {
      console.error('일기 생성 상세 에러:', error)
      throw error
    }
    
    console.log('일기 생성 성공:', data)
    return { data, error: null }
  } catch (error) {
    console.error('일기 생성 에러:', error)
    return { data: null, error: error.message }
  }
}

// 게시물 수정
export const updatePost = async (postId, postData) => {
  try {
    const { data, error } = await supabase
      .from('posts')
      .update(postData)
      .eq('id', postId)
      .select()
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('게시물 수정 에러:', error)
    return { data: null, error: error.message }
  }
}

// 게시물 삭제
export const deletePost = async (postId) => {
  try {
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId)

    if (error) throw error
    return { error: null }
  } catch (error) {
    console.error('게시물 삭제 에러:', error)
    return { error: error.message }
  }
}

// 사용자별 게시물 조회
export const getUserPosts = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('posts_with_author')
      .select('*')
      .eq('author_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('사용자 게시물 조회 에러:', error)
    return { data: null, error: error.message }
  }
}

// 게시물 검색
export const searchPosts = async (searchTerm) => {
  try {
    const { data, error } = await supabase
      .from('posts_with_author')
      .select('*')
      .or(`title.ilike.%${searchTerm}%, content.ilike.%${searchTerm}%`)
      .order('created_at', { ascending: false })

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('게시물 검색 에러:', error)
    return { data: null, error: error.message }
  }
} 
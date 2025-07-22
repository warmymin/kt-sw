import { supabase } from './supabase'

// 프로필 조회
export const getProfile = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('프로필 조회 에러:', error)
    return { data: null, error: error.message }
  }
}

// 현재 사용자 프로필 조회
export const getCurrentProfile = async () => {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError) throw userError
    if (!user) throw new Error('로그인이 필요합니다')

    return await getProfile(user.id)
  } catch (error) {
    console.error('현재 프로필 조회 에러:', error)
    return { data: null, error: error.message }
  }
}

// 프로필 업데이트
export const updateProfile = async (userId, updates) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('프로필 업데이트 에러:', error)
    return { data: null, error: error.message }
  }
}

// 프로필 생성 (회원가입 시 자동으로 생성되지만 수동 생성용)
export const createProfile = async (userId, profileData) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .insert([
        {
          id: userId,
          ...profileData
        }
      ])
      .select()
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('프로필 생성 에러:', error)
    return { data: null, error: error.message }
  }
}

// 모든 프로필 조회 (관리자용 또는 공개 프로필용)
export const getAllProfiles = async () => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('프로필 목록 조회 에러:', error)
    return { data: null, error: error.message }
  }
}

// 프로필 검색
export const searchProfiles = async (searchTerm) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .or(`full_name.ilike.%${searchTerm}%, bio.ilike.%${searchTerm}%`)
      .order('created_at', { ascending: false })

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('프로필 검색 에러:', error)
    return { data: null, error: error.message }
  }
} 
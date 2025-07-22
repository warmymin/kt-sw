'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 현재 세션 확인
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user || null)
      setLoading(false)
    }

    getSession()

    // 인증 상태 변경 리스너
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user || null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  // 회원가입
  const signUp = async (email, password) => {
    try {
      console.log('회원가입 시도:', email)
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: typeof window !== 'undefined' ? window.location.origin : undefined
        }
      })
      console.log('회원가입 응답:', { data, error })
      if (error) throw error
      
      // 이메일 확인이 필요한 경우 안내
      if (data.user && !data.session) {
        return { 
          data, 
          error: null, 
          needsEmailConfirmation: true,
          message: '이메일로 확인 링크가 발송되었습니다. 이메일을 확인하신 후 다시 로그인해주세요.' 
        }
      }
      
      return { data, error: null }
    } catch (error) {
      console.error('회원가입 에러:', error)
      return { data: null, error: error.message }
    }
  }

  // 로그인
  const signIn = async (email, password) => {
    try {
      console.log('로그인 시도:', email)
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      console.log('로그인 응답:', { data, error })
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('로그인 에러:', error)
      return { data: null, error: error.message }
    }
  }

  // 로그아웃
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (error) {
      console.error('로그아웃 오류:', error)
    }
  }

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
} 
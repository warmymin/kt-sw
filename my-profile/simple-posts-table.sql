-- 🚀 간단한 posts 테이블 먼저 생성 (테스트용)

-- 1. posts 테이블 생성 (최소한의 필드)
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT,
  content TEXT NOT NULL,
  author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  mood TEXT,
  weather TEXT,
  diary_date DATE DEFAULT CURRENT_DATE,
  is_private BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  comments_count INTEGER DEFAULT 0
);

-- 2. RLS 활성화
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- 3. 기본 정책 (모든 사람이 볼 수 있음)
DROP POLICY IF EXISTS "Anyone can view posts" ON public.posts;
CREATE POLICY "Anyone can view posts" ON public.posts
  FOR SELECT USING (true);

-- 4. 작성 정책 (로그인한 사용자만 작성 가능)
DROP POLICY IF EXISTS "Users can insert own posts" ON public.posts;
CREATE POLICY "Users can insert own posts" ON public.posts
  FOR INSERT WITH CHECK (auth.uid() = author_id);

-- 5. 수정/삭제 정책 (자신의 글만)
DROP POLICY IF EXISTS "Users can update own posts" ON public.posts;
CREATE POLICY "Users can update own posts" ON public.posts
  FOR UPDATE USING (auth.uid() = author_id);

DROP POLICY IF EXISTS "Users can delete own posts" ON public.posts;
CREATE POLICY "Users can delete own posts" ON public.posts
  FOR DELETE USING (auth.uid() = author_id);

-- 완료! 이제 테스트해보세요! 
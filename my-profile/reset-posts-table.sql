-- 🔄 posts 테이블 완전 리셋 (기존 데이터 모두 삭제)

-- 1. 기존 정책들 삭제
DROP POLICY IF EXISTS "Anyone can view posts" ON public.posts;
DROP POLICY IF EXISTS "Anyone can view public posts" ON public.posts;
DROP POLICY IF EXISTS "Users can insert own posts" ON public.posts;
DROP POLICY IF EXISTS "Users can update own posts" ON public.posts;
DROP POLICY IF EXISTS "Users can delete own posts" ON public.posts;

-- 2. 기존 테이블 완전 삭제
DROP TABLE IF EXISTS public.posts CASCADE;

-- 3. 새로운 posts 테이블 생성
CREATE TABLE public.posts (
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

-- 4. RLS 활성화
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- 5. 새로운 정책 설정
CREATE POLICY "Anyone can view public posts" ON public.posts
  FOR SELECT USING (is_private = false OR auth.uid() = author_id);

CREATE POLICY "Users can insert own posts" ON public.posts
  FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update own posts" ON public.posts
  FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Users can delete own posts" ON public.posts
  FOR DELETE USING (auth.uid() = author_id);

-- 완료! 이제 완전히 새로운 상태입니다! 
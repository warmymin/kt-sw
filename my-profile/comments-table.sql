-- 💬 응원 메시지 테이블 생성

-- 1. comments 테이블 생성
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. RLS 활성화
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- 3. 보안 정책 설정
-- 모든 사람이 댓글을 볼 수 있음
DROP POLICY IF EXISTS "Anyone can view comments" ON public.comments;
CREATE POLICY "Anyone can view comments" ON public.comments
  FOR SELECT USING (true);

-- 로그인한 사용자만 댓글 작성 가능
DROP POLICY IF EXISTS "Users can insert comments" ON public.comments;
CREATE POLICY "Users can insert comments" ON public.comments
  FOR INSERT WITH CHECK (auth.uid() = author_id);

-- 자신의 댓글만 수정/삭제 가능
DROP POLICY IF EXISTS "Users can update own comments" ON public.comments;
CREATE POLICY "Users can update own comments" ON public.comments
  FOR UPDATE USING (auth.uid() = author_id);

DROP POLICY IF EXISTS "Users can delete own comments" ON public.comments;
CREATE POLICY "Users can delete own comments" ON public.comments
  FOR DELETE USING (auth.uid() = author_id);

-- 4. 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON public.comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON public.comments(created_at);

-- 완료! 이제 응원 메시지를 작성할 수 있습니다 💬 
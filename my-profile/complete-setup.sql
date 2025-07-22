-- 🌟 오늘의 하루 일기장 - 완전한 데이터베이스 설정

-- STEP 1: profiles 테이블 생성 (만약 없다면)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  phone TEXT,
  website TEXT,
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- profiles 테이블 RLS 설정
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- STEP 2: posts 테이블 생성 (일기장 기능 포함)
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT,  -- 제목 (선택사항)
  content TEXT NOT NULL,  -- 일기 내용 (필수)
  author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- 일기장 전용 필드들
  mood TEXT,  -- 기분
  weather TEXT,  -- 날씨
  diary_date DATE DEFAULT CURRENT_DATE,  -- 일기 작성 날짜
  is_private BOOLEAN DEFAULT false,  -- 공개/비공개 설정
  
  -- 기본 필드들
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0
);

-- STEP 3: comments 테이블 생성
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- STEP 4: RLS 활성화
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- STEP 5: posts 정책들
DROP POLICY IF EXISTS "Anyone can view public posts" ON public.posts;
CREATE POLICY "Anyone can view public posts" ON public.posts
  FOR SELECT USING (is_private = false OR auth.uid() = author_id);

DROP POLICY IF EXISTS "Users can insert own posts" ON public.posts;
CREATE POLICY "Users can insert own posts" ON public.posts
  FOR INSERT WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "Users can update own posts" ON public.posts;
CREATE POLICY "Users can update own posts" ON public.posts
  FOR UPDATE USING (auth.uid() = author_id);

DROP POLICY IF EXISTS "Users can delete own posts" ON public.posts;
CREATE POLICY "Users can delete own posts" ON public.posts
  FOR DELETE USING (auth.uid() = author_id);

-- STEP 6: comments 정책들
DROP POLICY IF EXISTS "Anyone can view comments" ON public.comments;
CREATE POLICY "Anyone can view comments" ON public.comments
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert own comments" ON public.comments;
CREATE POLICY "Users can insert own comments" ON public.comments
  FOR INSERT WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "Users can update own comments" ON public.comments;
CREATE POLICY "Users can update own comments" ON public.comments
  FOR UPDATE USING (auth.uid() = author_id);

DROP POLICY IF EXISTS "Users can delete own comments" ON public.comments;
CREATE POLICY "Users can delete own comments" ON public.comments
  FOR DELETE USING (auth.uid() = author_id);

-- STEP 7: 함수들
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.update_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.posts 
    SET comments_count = comments_count + 1 
    WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.posts 
    SET comments_count = comments_count - 1 
    WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- STEP 8: 트리거들
DROP TRIGGER IF EXISTS on_posts_updated ON public.posts;
CREATE TRIGGER on_posts_updated
  BEFORE UPDATE ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS on_comments_updated ON public.comments;
CREATE TRIGGER on_comments_updated
  BEFORE UPDATE ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS on_comment_change ON public.comments;
CREATE TRIGGER on_comment_change
  AFTER INSERT OR DELETE ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.update_comments_count();

-- STEP 9: 뷰 생성
DROP VIEW IF EXISTS public.posts_with_author;
CREATE VIEW public.posts_with_author AS
SELECT 
  p.*,
  pr.full_name as author_name,
  pr.email as author_email
FROM public.posts p
LEFT JOIN public.profiles pr ON p.author_id = pr.id
ORDER BY p.diary_date DESC, p.created_at DESC;

DROP VIEW IF EXISTS public.comments_with_author;
CREATE VIEW public.comments_with_author AS
SELECT 
  c.*,
  pr.full_name as author_name,
  pr.email as author_email
FROM public.comments c
LEFT JOIN public.profiles pr ON c.author_id = pr.id
ORDER BY c.created_at ASC;

-- STEP 10: 인덱스
CREATE INDEX IF NOT EXISTS idx_posts_diary_date ON public.posts(diary_date);
CREATE INDEX IF NOT EXISTS idx_posts_author_date ON public.posts(author_id, diary_date);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON public.posts(created_at);
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON public.comments(post_id);

-- 🎉 완료! 이제 일기장을 사용할 수 있습니다! 
-- 📔 오늘의 하루 일기장을 위한 posts 테이블 생성

-- 1. posts 테이블 생성 (일기장 기능 포함)
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT,  -- 제목 (선택사항)
  content TEXT NOT NULL,  -- 일기 내용 (필수)
  author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- 일기장 전용 필드들
  mood TEXT,  -- 기분 (happy, sad, excited, tired, angry, calm, anxious, grateful)
  weather TEXT,  -- 날씨 (sunny, cloudy, rainy, snowy, windy)
  diary_date DATE DEFAULT CURRENT_DATE,  -- 일기 작성 날짜
  is_private BOOLEAN DEFAULT false,  -- 공개/비공개 설정
  
  -- 기본 필드들
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0
);

-- 2. Row Level Security (RLS) 활성화
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- 3. 보안 정책 설정
-- 공개 일기는 모든 사람이 볼 수 있고, 비공개 일기는 작성자만 볼 수 있음
CREATE POLICY "Anyone can view public posts" ON public.posts
  FOR SELECT USING (is_private = false OR auth.uid() = author_id);

-- 사용자는 자신의 일기만 작성할 수 있음
CREATE POLICY "Users can insert own posts" ON public.posts
  FOR INSERT WITH CHECK (auth.uid() = author_id);

-- 사용자는 자신의 일기만 수정할 수 있음
CREATE POLICY "Users can update own posts" ON public.posts
  FOR UPDATE USING (auth.uid() = author_id);

-- 사용자는 자신의 일기만 삭제할 수 있음
CREATE POLICY "Users can delete own posts" ON public.posts
  FOR DELETE USING (auth.uid() = author_id);

-- 4. 성능 향상을 위한 인덱스
CREATE INDEX IF NOT EXISTS idx_posts_diary_date ON public.posts(diary_date);
CREATE INDEX IF NOT EXISTS idx_posts_author_date ON public.posts(author_id, diary_date);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON public.posts(created_at);

-- 5. 업데이트 시간 자동 갱신 함수 (이미 있다면 스킵)
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. 업데이트 시간 자동 갱신 트리거
CREATE OR REPLACE TRIGGER on_posts_updated
  BEFORE UPDATE ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 완료! 이제 일기 작성을 시작할 수 있습니다 ✨ 
-- 📊 데이터베이스 상태 확인

-- 1. posts 테이블이 있는지 확인
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name = 'posts';

-- 2. 모든 public 테이블 목록 보기  
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- 3. posts 테이블이 있다면 구조 확인
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'posts'
ORDER BY ordinal_position; 
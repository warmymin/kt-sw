# 📔 오늘의 하루 일기장

Next.js와 Supabase로 만든 개인 일기장 웹 애플리케이션입니다.

## ✨ 주요 기능

- 🔐 **회원가입/로그인** - Supabase 인증
- 📝 **일기 작성** - 오늘의 기분과 날씨 기록
- 💬 **응원 메시지** - 다른 사용자들과 소통
- 👤 **프로필 관리** - 개인정보 설정
- 🌙 **반응형 UI** - 모바일/데스크톱 지원

## 🛠 기술 스택

- **Frontend**: Next.js 15 (App Router), React, Tailwind CSS
- **Backend**: Supabase (인증 + 데이터베이스)
- **배포**: Vercel (권장)

## 🚀 로컬 실행 방법

1. **저장소 클론**
   ```bash
   git clone https://github.com/warmymin/kt-sw.git
   cd kt-sw
   ```

2. **의존성 설치**
   ```bash
   npm install
   ```

3. **환경변수 설정**
   ```bash
   cp .env.example .env.local
   # .env.local 파일에서 Supabase 설정값 입력
   ```

4. **Supabase 데이터베이스 설정**
   - Supabase 대시보드에서 SQL 실행:
   ```sql
   -- complete-setup.sql 파일의 내용 실행
   ```

5. **개발 서버 실행**
   ```bash
   npm run dev
   ```

6. **브라우저에서 확인**
   - http://localhost:3002

## 📱 스크린샷

- 일기 목록 화면
- 일기 작성 화면  
- 개별 일기 조회 화면

## 🔧 주요 파일 구조

```
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── auth/           # 인증 페이지
│   │   ├── posts/          # 일기 관련 페이지
│   │   └── profile/        # 프로필 페이지
│   ├── contexts/           # React Context
│   └── lib/                # 유틸리티 함수
├── *.sql                   # Supabase 데이터베이스 스키마
└── README.md
```

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

---

💝 **오늘 하루도 수고하셨어요! 소중한 추억을 기록해보세요.**

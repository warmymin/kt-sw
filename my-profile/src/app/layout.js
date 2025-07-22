import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";

export const metadata = {
  title: "My Profile App",
  description: "Supabase 인증을 활용한 프로필 앱",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body className="antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}

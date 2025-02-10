import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import kakaoLoginImage from '../assets/kakao_login_medium_wide.png';

// Add CSS styles
const googleButtonStyles = {
  button: `
    w-full flex items-center justify-center gap-2 px-4 py-2.5 
    border border-gray-300 rounded-md 
    hover:bg-gray-50 transition-colors
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500
  `,
  contentWrapper: `
    flex items-center justify-center gap-2
  `
};

export function LoginForm({ open, onOpenChange, className, ...props }) {
  const handleGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_CORE_API_BASE_URL}/oauth2/authorization/google`
  }

  const handleKakaoLogin = () => {
    window.location.href = `${import.meta.env.VITE_CORE_API_BASE_URL}/oauth2/authorization/kakao`
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <Card className="border-none">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">안녕하세요</CardTitle>
            <CardDescription>
              구글 또는 카카오 계정으로 로그인 하세요!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <button 
                className={googleButtonStyles.button}
                onClick={handleGoogleLogin}
              >
                <div className={googleButtonStyles.contentWrapper}>
                  <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                  </svg>
                  <span>Sign in with Google</span>
                </div>
              </button>
              <img 
                src={kakaoLoginImage} 
                alt="Kakao Login" 
                onClick={handleKakaoLogin}
                className="cursor-pointer w-full"
              />
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}

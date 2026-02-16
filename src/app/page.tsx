import { LoginButton } from "@/components/auth/LoginButton";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-black flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
            SmartMarks
          </h1>
          <p className="text-gray-300 text-lg">
            Your bookmarks, everywhere. Real-time synchronization across all your devices.
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 shadow-2xl border border-white/20">
          <div className="space-y-6">
            <LoginButton />
            <p className="text-xs text-gray-400">
              By signing in, you agree to our Terms of Service.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

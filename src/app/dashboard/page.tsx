import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
// We import the client-side component here
import { BookmarkList } from '@/components/bookmark/BookmarkList'

export default async function DashboardPage() {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return redirect('/')
    }

    return (
        <div className="flex flex-col min-h-screen bg-gray-900 text-gray-100">
            <header className="flex justify-between items-center px-6 py-4 bg-gray-800/50 backdrop-blur-md border-b border-gray-700 sticky top-0 z-50">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-bold text-white">
                        S
                    </div>
                    <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 hidden sm:block">
                        SmartMarks
                    </h1>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-right">
                        <span className="text-xs text-gray-400 hidden sm:block">
                            {user.email}
                        </span>
                        {user.user_metadata.avatar_url && (
                            <img
                                src={user.user_metadata.avatar_url}
                                alt="Avatar"
                                className="w-8 h-8 rounded-full border border-gray-600"
                            />
                        )}
                    </div>

                    <form action="/auth/signout" method="post">
                        <button
                            className="text-sm font-medium text-gray-400 hover:text-white hover:bg-white/10 px-3 py-1.5 rounded-md transition-all"
                            type="submit"
                        >
                            Sign out
                        </button>
                    </form>
                </div>
            </header>

            <main className="flex-1 p-4 md:p-8 max-w-4xl mx-auto w-full">
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-white mb-2">Your Bookmarks</h2>
                    <p className="text-gray-400">Manage and sync your favorite links across devices.</p>
                </div>

                <BookmarkList />
            </main>
        </div>
    )
}

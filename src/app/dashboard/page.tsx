import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
// We import the client-side component here
import { BookmarkList } from '@/components/bookmark/BookmarkList'
import { LogOut, User } from 'lucide-react'

export default async function DashboardPage() {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return redirect('/')
    }

    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground">
            <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
                <div className="container flex h-16 items-center justify-between px-6 mx-auto max-w-5xl">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center font-serif font-bold text-primary-foreground text-lg">
                            S
                        </div>
                        <h1 className="font-serif text-xl font-medium tracking-tight hidden sm:block">
                            SmartMarks
                        </h1>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-3 text-right">
                            <span className="text-sm font-medium text-muted-foreground hidden sm:block">
                                {user.email}
                            </span>
                            {user.user_metadata.avatar_url ? (
                                <img
                                    src={user.user_metadata.avatar_url}
                                    alt="Avatar"
                                    className="w-9 h-9 rounded-full border border-border"
                                />
                            ) : (
                                <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center border border-border">
                                    <User className="w-4 h-4 text-secondary-foreground" />
                                </div>
                            )}
                        </div>

                        <form action="/auth/signout" method="post">
                            <button
                                className="inline-flex items-center justify-center gap-2 rounded-full text-sm font-medium text-muted-foreground transition-colors hover:text-primary hover:bg-secondary px-4 h-9 border border-border"
                                type="submit"
                                title="Sign out"
                            >
                                <LogOut className="w-4 h-4" />
                                <span className="hidden sm:inline">Sign Out</span>
                            </button>
                        </form>
                    </div>
                </div>
            </header>

            <main className="flex-1 w-full max-w-5xl mx-auto p-6 md:py-12">
                <div className="mb-10 text-center md:text-left">
                    <h2 className="text-4xl font-serif font-medium text-primary mb-3">Your Collection</h2>
                    <p className="text-lg text-muted-foreground font-light">Manage and organize your digital footprint.</p>
                </div>

                <BookmarkList />
            </main>
        </div>
    )
}

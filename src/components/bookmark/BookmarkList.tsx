"use client";

import { AddBookmarkForm } from "@/components/bookmark/AddBookmarkForm";
import { BookmarkItem } from "@/components/bookmark/BookmarkItem";
import { useRealtimeBookmarks } from "@/hooks/useRealtimeBookmarks";
import { Loader2, Bookmark } from "lucide-react";

export function BookmarkList() {
    const { bookmarks, loading, deleteBookmark } = useRealtimeBookmarks();

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <AddBookmarkForm />

            {bookmarks.length === 0 ? (
                <div className="text-center py-16 bg-muted/30 rounded-2xl border border-dashed border-border flex flex-col items-center justify-center">
                    <div className="bg-background p-4 rounded-full mb-4 shadow-sm">
                        <Bookmark className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <h3 className="font-serif text-xl font-medium mb-2">No bookmarks yet</h3>
                    <p className="text-muted-foreground max-w-sm mx-auto">
                        Add your first bookmark above to get started building your personal knowledge base.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {bookmarks.map((bookmark) => (
                        <BookmarkItem
                            key={bookmark.id}
                            bookmark={bookmark}
                            onDelete={deleteBookmark}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

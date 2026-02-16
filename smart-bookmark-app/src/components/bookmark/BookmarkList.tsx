"use client";

import { AddBookmarkForm } from "@/components/bookmark/AddBookmarkForm";
import { BookmarkItem } from "@/components/bookmark/BookmarkItem";
import { useRealtimeBookmarks } from "@/hooks/useRealtimeBookmarks";
import { Loader2 } from "lucide-react";

export function BookmarkList() {
    const { bookmarks, loading, deleteBookmark } = useRealtimeBookmarks();

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <AddBookmarkForm />

            {bookmarks.length === 0 ? (
                <div className="text-center py-12 bg-gray-800/30 rounded-lg border border-gray-700 border-dashed">
                    <p className="text-gray-400 text-lg mb-2">No bookmarks yet</p>
                    <p className="text-gray-500 text-sm">Add your first bookmark above to get started</p>
                </div>
            ) : (
                <div className="grid gap-4">
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

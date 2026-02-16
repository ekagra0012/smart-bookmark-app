"use client";

import { Trash2, ExternalLink } from "lucide-react";
import { Bookmark } from "@/types/bookmark";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface BookmarkItemProps {
    bookmark: Bookmark;
    onDelete: (id: string) => Promise<void>;
}

export function BookmarkItem({ bookmark, onDelete }: BookmarkItemProps) {
    const [isDeleting, setIsDeleting] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const handleDelete = async () => {
        setIsDeleting(true);
        setShowConfirm(false);
        try {
            await onDelete(bookmark.id);
        } catch (error) {
            setIsDeleting(false);
            console.error("Failed to delete", error);
            alert("Failed to delete bookmark");
        }
    };

    return (
        <div
            className={cn(
                "group relative bg-card text-card-foreground border border-border/40 rounded-xl p-6 transition-all hover:shadow-md hover:border-border/80",
                isDeleting && "opacity-50 pointer-events-none"
            )}
            role="article"
            aria-label={`Bookmark: ${bookmark.title}`}
        >
            <div className="flex-1 min-w-0 pr-8">
                <h3 className="font-serif text-lg font-medium truncate mb-2 text-primary" title={bookmark.title}>
                    {bookmark.title}
                </h3>
                <a
                    href={bookmark.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-muted-foreground hover:text-accent truncate block flex items-center gap-1 transition-colors font-mono"
                    title={bookmark.url}
                    aria-label={`Open ${bookmark.title} in new tab`}
                >
                    {(() => { try { return new URL(bookmark.url).hostname; } catch { return bookmark.url; } })()}
                    <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true" />
                </a>
            </div>

            {showConfirm ? (
                <div className="absolute top-3 right-3 flex items-center gap-1 bg-card border border-border rounded-lg shadow-lg p-1.5 animate-in fade-in slide-in-from-right-2 duration-150">
                    <button
                        onClick={handleDelete}
                        className="text-xs font-medium text-destructive hover:bg-destructive hover:text-destructive-foreground px-2.5 py-1 rounded-md transition-colors"
                        aria-label={`Confirm delete ${bookmark.title}`}
                    >
                        Delete
                    </button>
                    <button
                        onClick={() => setShowConfirm(false)}
                        className="text-xs font-medium text-muted-foreground hover:bg-muted px-2.5 py-1 rounded-md transition-colors"
                        aria-label="Cancel deletion"
                    >
                        Cancel
                    </button>
                </div>
            ) : (
                <button
                    onClick={() => setShowConfirm(true)}
                    disabled={isDeleting}
                    className="absolute top-4 right-4 text-muted-foreground hover:text-destructive p-2 rounded-full hover:bg-muted transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                    aria-label={`Delete bookmark: ${bookmark.title}`}
                    title="Delete Bookmark"
                >
                    <Trash2 className="w-4 h-4" aria-hidden="true" />
                </button>
            )}
        </div>
    );
}

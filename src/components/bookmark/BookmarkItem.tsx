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

    const handleDelete = async () => {
        if (confirm("Are you sure you want to delete this bookmark?")) {
            setIsDeleting(true);
            try {
                await onDelete(bookmark.id);
            } catch (error) {
                setIsDeleting(false);
                console.error("Failed to delete", error);
                alert("Failed to delete bookmark");
            }
        }
    };

    return (
        <div
            className={cn(
                "group relative bg-card text-card-foreground border border-border/40 rounded-xl p-6 transition-all hover:shadow-md hover:border-border/80",
                isDeleting && "opacity-50 pointer-events-none"
            )}
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
                >
                    {new URL(bookmark.url).hostname}
                    <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
            </div>
            <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="absolute top-4 right-4 text-muted-foreground hover:text-destructive p-2 rounded-full hover:bg-muted transition-colors opacity-0 group-hover:opacity-100"
                title="Delete Bookmark"
            >
                <Trash2 className="w-4 h-4" />
            </button>
        </div>
    );
}

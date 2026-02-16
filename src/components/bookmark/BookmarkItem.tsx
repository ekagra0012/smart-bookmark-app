import { Trash2, ExternalLink } from "lucide-react";
import { Bookmark } from "@/types/bookmark";
import { useState } from "react";
import clsx from "clsx";

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
            className={clsx(
                "bg-gray-800/80 backdrop-blur-sm border border-gray-700 rounded-lg p-4 flex items-center justify-between transition-all hover:bg-gray-800 hover:border-blue-500/50 group",
                isDeleting && "opacity-50 pointer-events-none"
            )}
        >
            <div className="flex-1 min-w-0 mr-4">
                <h3 className="text-white font-medium truncate" title={bookmark.title}>
                    {bookmark.title}
                </h3>
                <a
                    href={bookmark.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-gray-400 hover:text-blue-400 truncate block flex items-center gap-1 transition-colors"
                    title={bookmark.url}
                >
                    {bookmark.url}
                    <ExternalLink className="w-3 h-3 inline-block opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
            </div>
            <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="text-gray-500 hover:text-red-400 p-2 rounded-full hover:bg-white/5 transition-colors"
                title="Delete Bookmark"
            >
                <Trash2 className="w-5 h-5" />
            </button>
        </div>
    );
}

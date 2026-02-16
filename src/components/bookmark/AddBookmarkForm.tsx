"use client";

import { BookmarkFormData, bookmarkSchema } from "@/lib/validation";
import { Loader2, Plus } from "lucide-react";
import { useState } from "react";
import { ZodError } from "zod";
import { Button } from "@/components/ui/Button";

interface AddBookmarkFormProps {
    onAdd: (title: string, url: string) => Promise<unknown>;
}

export function AddBookmarkForm({ onAdd }: AddBookmarkFormProps) {
    const [formData, setFormData] = useState<BookmarkFormData>({ title: "", url: "" });
    const [errors, setErrors] = useState<Partial<BookmarkFormData>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Determine if form is valid for submit button state
    const isFormValid = formData.title.trim().length > 0 && formData.url.trim().length > 0;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});
        setIsSubmitting(true);

        // 1. Client-side Validation
        try {
            bookmarkSchema.parse(formData);
        } catch (error) {
            if (error instanceof ZodError) {
                const fieldErrors: Partial<BookmarkFormData> = {};
                error.issues.forEach((err) => {
                    if (err.path[0]) {
                        fieldErrors[err.path[0] as keyof BookmarkFormData] = err.message;
                    }
                });
                setErrors(fieldErrors);
                setIsSubmitting(false);
                return;
            }
        }

        // 2. Submit via the parent hook's addBookmark (optimistic update)
        try {
            await onAdd(formData.title, formData.url);
            setFormData({ title: "", url: "" });
        } catch (error) {
            console.error("Error adding bookmark:", error);
            alert("Failed to add bookmark. Please try again.");
        }

        setIsSubmitting(false);
    };

    return (
        <form onSubmit={handleSubmit} className="bg-card text-card-foreground rounded-2xl p-8 shadow-sm border border-border/50 mb-12" aria-label="Add new bookmark">
            <h3 className="font-serif text-2xl mb-6">Add New Bookmark</h3>
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 space-y-1">
                    <label htmlFor="bookmark-title" className="sr-only">Bookmark Title</label>
                    <input
                        id="bookmark-title"
                        type="text"
                        placeholder="Title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        aria-required="true"
                        aria-invalid={!!errors.title}
                        aria-describedby={errors.title ? "title-error" : undefined}
                        className={`w-full bg-background border ${errors.title ? 'border-red-500' : 'border-input'} rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all`}
                    />
                    {errors.title && <p id="title-error" className="text-red-500 text-xs px-1" role="alert">{errors.title}</p>}
                </div>

                <div className="flex-1 space-y-1">
                    <label htmlFor="bookmark-url" className="sr-only">Bookmark URL</label>
                    <input
                        id="bookmark-url"
                        type="url"
                        placeholder="URL (https://...)"
                        value={formData.url}
                        onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                        aria-required="true"
                        aria-invalid={!!errors.url}
                        aria-describedby={errors.url ? "url-error" : undefined}
                        className={`w-full bg-background border ${errors.url ? 'border-red-500' : 'border-input'} rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all`}
                    />
                    {errors.url && <p id="url-error" className="text-red-500 text-xs px-1" role="alert">{errors.url}</p>}
                </div>

                <Button
                    type="submit"
                    disabled={isSubmitting || !isFormValid}
                    aria-label="Add bookmark"
                    className="min-w-[120px]"
                >
                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Plus className="w-5 h-5 mr-2" /> Add</>}
                </Button>
            </div>
        </form>
    );
}

"use client";

import { createClient } from "@/lib/supabase/client";
import { BookmarkFormData, bookmarkSchema } from "@/lib/validation";
import { Loader2, Plus } from "lucide-react";
import { useState } from "react";
import { ZodError } from "zod";
import { Button } from "@/components/ui/Button";

export function AddBookmarkForm() {
    const [formData, setFormData] = useState<BookmarkFormData>({ title: "", url: "" });
    const [errors, setErrors] = useState<Partial<BookmarkFormData>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

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
                (error as any).errors.forEach((err: { path: (string | number)[]; message: string }) => {
                    if (err.path[0]) {
                        fieldErrors[err.path[0] as keyof BookmarkFormData] = err.message;
                    }
                });
                setErrors(fieldErrors);
                setIsSubmitting(false);
                return;
            }
        }

        // 2. Submit to Supabase
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            alert("You must be logged in to add a bookmark");
            window.location.href = "/";
            return;
        }

        const { error } = await supabase.from("bookmarks").insert({
            title: formData.title,
            url: formData.url,
            user_id: user.id
        });

        if (error) {
            console.error("Error adding bookmark:", error);
            alert("Failed to add bookmark. Please try again.");
        } else {
            // Reset form on success
            setFormData({ title: "", url: "" });
        }

        setIsSubmitting(false);
    };

    return (
        <form onSubmit={handleSubmit} className="bg-card text-card-foreground rounded-2xl p-8 shadow-sm border border-border/50 mb-12">
            <h3 className="font-serif text-2xl mb-6">Add New Bookmark</h3>
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 space-y-1">
                    <input
                        type="text"
                        placeholder="Title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className={`w-full bg-background border ${errors.title ? 'border-red-500' : 'border-input'} rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-all`}
                    />
                    {errors.title && <p className="text-red-500 text-xs px-1">{errors.title}</p>}
                </div>

                <div className="flex-1 space-y-1">
                    <input
                        type="url"
                        placeholder="URL (https://...)"
                        value={formData.url}
                        onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                        className={`w-full bg-background border ${errors.url ? 'border-red-500' : 'border-input'} rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-all`}
                    />
                    {errors.url && <p className="text-red-500 text-xs px-1">{errors.url}</p>}
                </div>

                <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="min-w-[120px]"
                >
                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Plus className="w-5 h-5 mr-2" /> Add</>}
                </Button>
            </div>
        </form>
    );
}

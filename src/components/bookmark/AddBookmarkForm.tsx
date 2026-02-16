import { createClient } from "@/lib/supabase/client";
import { BookmarkFormData, bookmarkSchema } from "@/lib/validation";
import { Loader2, Plus } from "lucide-react";
import { useState } from "react";
import { ZodError } from "zod";

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
                error.errors.forEach((err) => {
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
        <form onSubmit={handleSubmit} className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-xl mb-8">
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 space-y-1">
                    <input
                        type="text"
                        placeholder="Bookmark Title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className={`w-full bg-gray-900 border ${errors.title ? 'border-red-500' : 'border-gray-600'} rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
                    />
                    {errors.title && <p className="text-red-400 text-xs px-1">{errors.title}</p>}
                </div>

                <div className="flex-1 space-y-1">
                    <input
                        type="url"
                        placeholder="https://example.com"
                        value={formData.url}
                        onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                        className={`w-full bg-gray-900 border ${errors.url ? 'border-red-500' : 'border-gray-600'} rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
                    />
                    {errors.url && <p className="text-red-400 text-xs px-1">{errors.url}</p>}
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg px-6 py-3 flex items-center justify-center gap-2 transition-colors disabled:opacity-70 disabled:cursor-not-allowed min-w-[120px]"
                >
                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Plus className="w-5 h-5" /> Add</>}
                </button>
            </div>
        </form>
    );
}

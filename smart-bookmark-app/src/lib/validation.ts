import { z } from "zod";

export const bookmarkSchema = z.object({
    title: z.string().min(1, "Title is required").max(100, "Title must be less than 100 characters"),
    url: z.string().url("Please enter a valid URL (e.g., https://google.com)").startsWith("http", "URL must start with http:// or https://"),
});

export type BookmarkFormData = z.infer<typeof bookmarkSchema>;

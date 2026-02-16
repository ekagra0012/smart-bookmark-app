"use client";

import { createClient } from "@/lib/supabase/client";
import { Bookmark } from "@/types/bookmark";
import { useEffect, useState } from "react";

export function useRealtimeBookmarks() {
    const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const supabase = createClient();

        // 1. Fetch initial data
        const fetchBookmarks = async () => {
            const { data, error } = await supabase
                .from("bookmarks")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) {
                console.error("Error fetching bookmarks:", error);
            } else {
                setBookmarks(data || []);
            }
            setLoading(false);
        };

        fetchBookmarks();

        // 2. Subscribe to Realtime changes
        const channel = supabase
            .channel("realtime-bookmarks")
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "bookmarks",
                },
                (payload) => {
                    console.log("Realtime event received:", payload);

                    if (payload.eventType === "INSERT") {
                        const newBookmark = payload.new as Bookmark;
                        setBookmarks((prev) => [newBookmark, ...prev]);
                    } else if (payload.eventType === "DELETE") {
                        const deletedId = payload.old.id;
                        setBookmarks((prev) => prev.filter((b) => b.id !== deletedId));
                    } else if (payload.eventType === "UPDATE") {
                        const updatedBookmark = payload.new as Bookmark;
                        setBookmarks((prev) => prev.map((b) => b.id === updatedBookmark.id ? updatedBookmark : b));
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const deleteBookmark = async (id: string) => {
        // Optimistic UI update could happen here, but Realtime is fast enough for now
        const supabase = createClient();
        const { error } = await supabase.from("bookmarks").delete().eq("id", id);
        if (error) throw error;
    };

    return { bookmarks, loading, deleteBookmark };
}

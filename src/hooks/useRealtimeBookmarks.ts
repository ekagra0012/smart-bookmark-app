"use client";

import { createClient } from "@/lib/supabase/client";
import { Bookmark } from "@/types/bookmark";
import { useEffect, useState, useCallback, useRef } from "react";
import { RealtimeChannel, SupabaseClient } from "@supabase/supabase-js";

export function useRealtimeBookmarks() {
    const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
    const [loading, setLoading] = useState(true);
    const supabaseRef = useRef<SupabaseClient | null>(null);
    const channelRef = useRef<RealtimeChannel | null>(null);

    // Initialize Supabase client once
    if (!supabaseRef.current) {
        supabaseRef.current = createClient();
    }

    useEffect(() => {
        const supabase = supabaseRef.current!;

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

        // 2. Subscribe to cross-tab Broadcast channel + Postgres Changes
        const channel = supabase
            .channel("bookmark-sync")
            .on("broadcast", { event: "bookmark-added" }, (payload) => {
                console.log("Broadcast: bookmark-added received", payload);
                const newBookmark = payload.payload as Bookmark;
                setBookmarks((prev) => {
                    if (prev.some((b) => b.id === newBookmark.id)) return prev;
                    return [newBookmark, ...prev];
                });
            })
            .on("broadcast", { event: "bookmark-deleted" }, (payload) => {
                console.log("Broadcast: bookmark-deleted received", payload);
                const deletedId = payload.payload.id as string;
                setBookmarks((prev) => prev.filter((b) => b.id !== deletedId));
            })
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "bookmarks",
                },
                (payload) => {
                    console.log("Postgres Changes event received:", payload);
                    // Fallback for changes from external sources (e.g., DB admin)
                    if (payload.eventType === "INSERT") {
                        const newBookmark = payload.new as Bookmark;
                        setBookmarks((prev) => {
                            if (prev.some((b) => b.id === newBookmark.id)) return prev;
                            return [newBookmark, ...prev];
                        });
                    } else if (payload.eventType === "DELETE") {
                        const oldRecord = payload.old as Record<string, unknown>;
                        if (oldRecord && oldRecord.id) {
                            const deletedId = String(oldRecord.id);
                            setBookmarks((prev) => prev.filter((b) => b.id !== deletedId));
                        }
                    } else if (payload.eventType === "UPDATE") {
                        const updatedBookmark = payload.new as Bookmark;
                        setBookmarks((prev) =>
                            prev.map((b) => b.id === updatedBookmark.id ? updatedBookmark : b)
                        );
                    }
                }
            )
            .subscribe((status) => {
                console.log("Realtime subscription status:", status);
            });

        // Store channel ref so addBookmark/deleteBookmark can use it
        channelRef.current = channel;

        return () => {
            channelRef.current = null;
            supabase.removeChannel(channel);
        };
    }, []);

    // Optimistic add: insert into DB, update local state, and broadcast to other tabs
    const addBookmark = useCallback(async (title: string, url: string) => {
        const supabase = supabaseRef.current!;
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            throw new Error("Not authenticated");
        }

        const { data, error } = await supabase
            .from("bookmarks")
            .insert({ title, url, user_id: user.id })
            .select()
            .single();

        if (error) throw error;

        if (data) {
            // Immediately add to local state
            setBookmarks((prev) => {
                if (prev.some((b) => b.id === data.id)) return prev;
                return [data, ...prev];
            });

            // Broadcast to other tabs via the shared channel
            channelRef.current?.send({
                type: "broadcast",
                event: "bookmark-added",
                payload: data,
            });
        }

        return data;
    }, []);

    // Optimistic delete: remove from local state immediately, broadcast, then persist
    const deleteBookmark = useCallback(async (id: string) => {
        // Optimistically remove from UI
        setBookmarks((prev) => prev.filter((b) => b.id !== id));

        // Broadcast to other tabs immediately via the shared channel
        channelRef.current?.send({
            type: "broadcast",
            event: "bookmark-deleted",
            payload: { id },
        });

        const supabase = supabaseRef.current!;
        const { error } = await supabase.from("bookmarks").delete().eq("id", id);

        if (error) {
            // Rollback: refetch on error
            console.error("Delete failed, refetching:", error);
            const { data } = await supabase
                .from("bookmarks")
                .select("*")
                .order("created_at", { ascending: false });
            setBookmarks(data || []);
            throw error;
        }
    }, []);

    return { bookmarks, loading, addBookmark, deleteBookmark };
}

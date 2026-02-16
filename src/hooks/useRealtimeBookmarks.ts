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
    const subscribedRef = useRef(false);

    // Initialize Supabase client once
    if (!supabaseRef.current) {
        supabaseRef.current = createClient();
    }

    useEffect(() => {
        const supabase = supabaseRef.current!;
        subscribedRef.current = false;

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

        // 2. Build the channel with Broadcast + Postgres Changes listeners
        const setupSubscription = async () => {
            // Get the current session to ensure we have the token
            const { data: { session } } = await supabase.auth.getSession();

            const channel = supabase
                .channel("bookmark-sync", {
                    config: {
                        presence: {
                            key: session?.user?.id,
                        },
                    },
                })
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
                );

            // Store channel ref BEFORE subscribing so it's available immediately
            channelRef.current = channel;

            // Now subscribe and track readiness
            channel.subscribe((status) => {
                console.log("Realtime subscription status:", status);
                subscribedRef.current = status === "SUBSCRIBED";
            });
        };

        // Call the async subscription setup
        void setupSubscription();

        return () => {
            subscribedRef.current = false;
            // Clean up the channel if it exists
            if (channelRef.current) {
                supabase.removeChannel(channelRef.current);
                channelRef.current = null;
            }
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
            if (channelRef.current && subscribedRef.current) {
                const status = await channelRef.current.send({
                    type: "broadcast",
                    event: "bookmark-added",
                    payload: data,
                });
                console.log("Broadcast 'bookmark-added' sent:", status);
            } else {
                console.warn("Skipping broadcast: Channel not subscribed or missing");
            }
        }

        return data;
    }, []);

    // Optimistic delete: remove from local state immediately, broadcast, then persist
    const deleteBookmark = useCallback(async (id: string) => {
        // Optimistically remove from UI
        setBookmarks((prev) => prev.filter((b) => b.id !== id));

        // Broadcast to other tabs immediately via the shared channel
        if (channelRef.current && subscribedRef.current) {
            const status = await channelRef.current.send({
                type: "broadcast",
                event: "bookmark-deleted",
                payload: { id },
            });
            console.log("Broadcast 'bookmark-deleted' sent:", status);
        } else {
            console.warn("Skipping broadcast: Channel not subscribed or missing");
        }

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

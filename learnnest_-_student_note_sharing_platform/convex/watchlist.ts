import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const watchlistItems = await ctx.db
      .query("watchlist")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const notes = await Promise.all(
      watchlistItems.map(async (item) => {
        const note = await ctx.db.get(item.noteId);
        if (!note) return null;
        return {
          ...note,
          fileUrl: await ctx.storage.getUrl(note.fileId),
          watchlistId: item._id,
        };
      })
    );

    return notes.filter(Boolean);
  },
});

export const add = mutation({
  args: { noteId: v.id("notes") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("watchlist")
      .withIndex("by_user_and_note", (q) => q.eq("userId", userId).eq("noteId", args.noteId))
      .first();

    if (existing) return existing._id;

    return await ctx.db.insert("watchlist", {
      userId,
      noteId: args.noteId,
    });
  },
});

export const remove = mutation({
  args: { noteId: v.id("notes") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const item = await ctx.db
      .query("watchlist")
      .withIndex("by_user_and_note", (q) => q.eq("userId", userId).eq("noteId", args.noteId))
      .first();

    if (item) {
      await ctx.db.delete(item._id);
    }
  },
});

export const isInWatchlist = query({
  args: { noteId: v.id("notes") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return false;

    const item = await ctx.db
      .query("watchlist")
      .withIndex("by_user_and_note", (q) => q.eq("userId", userId).eq("noteId", args.noteId))
      .first();

    return !!item;
  },
});

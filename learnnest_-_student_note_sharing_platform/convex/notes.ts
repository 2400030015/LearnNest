import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: {
    subjectId: v.optional(v.id("subjects")),
    type: v.optional(v.union(v.literal("notes"), v.literal("previous_papers"), v.literal("question_papers"))),
    year: v.optional(v.number()),
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let notes;

    if (args.search && args.search.trim()) {
      const searchTerm = args.search.trim();
      notes = await ctx.db
        .query("notes")
        .withSearchIndex("search_notes", (q) => q.search("title", searchTerm))
        .collect();
    } else {
      notes = await ctx.db.query("notes").order("desc").collect();
    }

    // Apply filters
    if (args.subjectId) {
      notes = notes.filter(note => note.subjectId === args.subjectId);
    }
    if (args.type) {
      notes = notes.filter(note => note.type === args.type);
    }
    if (args.year) {
      notes = notes.filter(note => note.year === args.year);
    }

    // Get file URLs
    return await Promise.all(
      notes.map(async (note) => ({
        ...note,
        fileUrl: await ctx.storage.getUrl(note.fileId),
      }))
    );
  },
});

export const getById = query({
  args: { id: v.id("notes") },
  handler: async (ctx, args) => {
    const note = await ctx.db.get(args.id);
    if (!note) return null;

    return {
      ...note,
      fileUrl: await ctx.storage.getUrl(note.fileId),
    };
  },
});

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    
    return await ctx.storage.generateUploadUrl();
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    subjectId: v.id("subjects"),
    subjectName: v.string(),
    materialName: v.string(),
    fileId: v.id("_storage"),
    fileName: v.string(),
    fileSize: v.number(),
    fileType: v.string(),
    year: v.number(),
    type: v.union(v.literal("notes"), v.literal("previous_papers"), v.literal("question_papers")),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");

    const subject = await ctx.db.get(args.subjectId);
    if (!subject) throw new Error("Subject not found");

    // Get or create user profile
    let profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!profile) {
      const profileId = await ctx.db.insert("userProfiles", {
        userId,
        nickname: user.name || user.email?.split("@")[0] || "Anonymous",
        totalUploads: 0,
        totalDownloads: 0,
      });
      profile = await ctx.db.get(profileId);
    }

    if (!profile) {
      throw new Error("Failed to create user profile");
    }

    const noteId = await ctx.db.insert("notes", {
      ...args,
      uploadedBy: userId,
      uploaderNickname: profile.nickname,
      downloads: 0,
    });

    // Update user profile
    await ctx.db.patch(profile._id, {
      totalUploads: profile.totalUploads + 1,
    });

    return noteId;
  },
});

export const incrementDownload = mutation({
  args: { noteId: v.id("notes") },
  handler: async (ctx, args) => {
    const note = await ctx.db.get(args.noteId);
    if (!note) throw new Error("Note not found");

    await ctx.db.patch(args.noteId, {
      downloads: note.downloads + 1,
    });

    // Update uploader's download count
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", note.uploadedBy))
      .first();

    if (profile) {
      await ctx.db.patch(profile._id, {
        totalDownloads: profile.totalDownloads + 1,
      });
    }
  },
});

export const getPopular = query({
  args: {},
  handler: async (ctx) => {
    const notes = await ctx.db.query("notes").order("desc").take(10);
    
    return await Promise.all(
      notes
        .sort((a, b) => b.downloads - a.downloads)
        .slice(0, 6)
        .map(async (note) => ({
          ...note,
          fileUrl: await ctx.storage.getUrl(note.fileId),
        }))
    );
  },
});

export const getRecent = query({
  args: {},
  handler: async (ctx) => {
    const notes = await ctx.db.query("notes").order("desc").take(6);
    
    return await Promise.all(
      notes.map(async (note) => ({
        ...note,
        fileUrl: await ctx.storage.getUrl(note.fileId),
      }))
    );
  },
});

import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  subjects: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    color: v.string(), // For UI theming
  }),
  
  notes: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    subjectId: v.id("subjects"),
    subjectName: v.string(), // User-provided subject name
    materialName: v.string(), // User-provided material name
    fileId: v.id("_storage"),
    fileName: v.string(),
    fileSize: v.number(),
    fileType: v.string(),
    year: v.number(),
    type: v.union(v.literal("notes"), v.literal("previous_papers"), v.literal("question_papers")),
    uploadedBy: v.id("users"),
    uploaderNickname: v.string(),
    downloads: v.number(),
    tags: v.optional(v.array(v.string())),
  })
    .index("by_subject", ["subjectId"])
    .index("by_uploader", ["uploadedBy"])
    .index("by_year", ["year"])
    .index("by_type", ["type"])
    .searchIndex("search_notes", {
      searchField: "title",
      filterFields: ["subjectName", "materialName", "type", "year"]
    }),

  watchlist: defineTable({
    userId: v.id("users"),
    noteId: v.id("notes"),
  })
    .index("by_user", ["userId"])
    .index("by_note", ["noteId"])
    .index("by_user_and_note", ["userId", "noteId"]),

  userProfiles: defineTable({
    userId: v.id("users"),
    nickname: v.string(),
    bio: v.optional(v.string()),
    totalUploads: v.number(),
    totalDownloads: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_nickname", ["nickname"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});

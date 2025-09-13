import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("subjects").collect();
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    color: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("subjects", args);
  },
});

// Initialize default subjects
export const initializeDefaultSubjects = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("subjects").first();
    if (existing) return;

    const defaultSubjects = [
      { name: "Mathematics", description: "Math notes and papers", color: "#3B82F6" },
      { name: "Physics", description: "Physics study materials", color: "#EF4444" },
      { name: "Chemistry", description: "Chemistry notes and labs", color: "#10B981" },
      { name: "Computer Science", description: "Programming and CS concepts", color: "#8B5CF6" },
      { name: "English", description: "Literature and language", color: "#F59E0B" },
      { name: "Biology", description: "Life sciences materials", color: "#06B6D4" },
      { name: "History", description: "Historical documents and notes", color: "#84CC16" },
      { name: "Economics", description: "Economic theories and cases", color: "#F97316" },
    ];

    for (const subject of defaultSubjects) {
      await ctx.db.insert("subjects", subject);
    }
  },
});

import mongoose, { Schema } from "mongoose";

export type StoreCategory =
  | "thiet-bi-bay"
  | "phu-kien"
  | "sach-du-luon"
  | "khoa-hoc-du-luon";

export type KnowledgeSubCategory =
  | "can-ban"
  | "nang-cao"
  | "thermal"
  | "xc"
  | "khi-tuong";

export interface IPost {
  title: string;
  slug: string;
  content: string;          // HTML hoặc Markdown (có thể chứa <img>)
  coverImage?: string;      // URL ảnh
  author?: string;
  category?: string;        // vd: "news" | "knowledge" | "store"
  tags?: string[];
  language?: "vi" | "en";
  readTime?: number;
  isPublished?: boolean;
  views?: number;

  // ---- Mở rộng cho KIẾN THỨC ----
  subCategory?: KnowledgeSubCategory;  // dùng khi category = "knowledge" hoặc "store" & "khoa-hoc-du-luon"

  // ---- Mở rộng cho SẢN PHẨM ----
  type?: "blog" | "product";      // default "blog"
  storeCategory?: StoreCategory;  // dùng khi type = "product"
  price?: number;                 // >= 0, dùng khi type = "product"
}

const PostSchema = new Schema<IPost>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    content: { type: String, required: true },
    coverImage: String,
    author: { type: String, default: "Admin" },
    category: String,
    tags: [{ type: String }],
    language: { type: String, default: "vi" },
    readTime: { type: Number, default: 1 },
    isPublished: { type: Boolean, default: true },
    views: { type: Number, default: 0 },

    // ---- Knowledge fields ----
    subCategory: {
      type: String,
      enum: ["can-ban", "nang-cao", "thermal", "xc", "khi-tuong"],
    },

    // ---- Product fields ----
    type: { type: String, enum: ["blog", "product"], default: "blog" },
    storeCategory: {
      type: String,
      enum: ["thiet-bi-bay", "phu-kien", "sach-du-luon", "khoa-hoc-du-luon"],
    },
    price: { type: Number, min: 0 },
  },
  { timestamps: true }
);

// Index gợi ý cho filter & sort
PostSchema.index({ type: 1, storeCategory: 1, isPublished: 1, createdAt: -1 });        // cho Store
PostSchema.index({ category: 1, subCategory: 1, isPublished: 1, createdAt: -1 });      // cho Knowledge

export const Post =
  mongoose.models.Post || mongoose.model<IPost>("Post", PostSchema);

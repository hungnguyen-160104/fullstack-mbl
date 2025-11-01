// scripts/seedFixedPosts.ts
import "dotenv/config";
import { connectDB } from "@/lib/mongodb";
import { seedFixedPosts } from "@/lib/fixed-posts/fixedPosts.service";

(async () => {
  try {
    await connectDB();
    await seedFixedPosts();
    console.log("✅ Seed fixed posts done");
    process.exit(0);
  } catch (e) {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  }
})();

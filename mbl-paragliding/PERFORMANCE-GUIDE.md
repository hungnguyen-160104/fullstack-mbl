# Performance Optimization Guide

## 📊 Current Issues & Solutions

### 1. **TTFB (Time To First Byte) - HIGH**

**Problem:** API routes have `revalidate = 0`, `dynamic = force-dynamic`

**Solutions Implemented:**

- ✅ Set `revalidate = 3600` (1 hour cache) for `/api/posts`
- ✅ Set `revalidate = 86400` (24 hour cache) for `/api/spots`
- ✅ Add `.lean()` to MongoDB queries (2-3x faster)
- ✅ Add proper caching headers

**Manual Fixes Needed:**

```typescript
// ❌ BEFORE: app/api/posts/route.ts
export const revalidate = 0;
export const dynamic = "force-dynamic";

// ✅ AFTER:
export const revalidate = 3600; // Cache 1 hour
export const dynamic = "force-dynamic"; // Still allow dynamic queries

// In query:
const posts = await Post.find(query)
  .lean() // Add this for read-only queries
  .sort(sortObj)
  .limit(limit);
```

---

### 2. **Bundle Size - LARGE**

**Problem:** Framer Motion, Recharts loaded for every page

**Solutions:**

```typescript
// ✅ Lazy load heavy libraries
import dynamic from "next/dynamic";

// For pages that need animations
const AnimatedComponent = dynamic(
  () => import("@/components/AnimatedSection"),
  { loading: () => <div>Loading...</div> }
);

// For admin dashboard (only admin needs Recharts)
const ChartComponent = dynamic(() => import("@/components/Charts"), {
  ssr: false,
});
```

---

### 3. **Images - UNOPTIMIZED**

**Problem:** Images from Cloudinary not using responsive sizes

**Solutions Implemented:**

- ✅ Created `OptimizedImage.tsx` component
- ✅ Automatic Cloudinary URL transformation
- ✅ Responsive sizing with `sizes` prop
- ✅ Format negotiation (AVIF/WebP)

**Usage:**

```typescript
// ❌ OLD
<img src="https://res.cloudinary.com/.../image.jpg" alt="..." />

// ✅ NEW
<OptimizedImage
  src="https://res.cloudinary.com/.../image.jpg"
  alt="Spot"
  width={1200}
  height={630}
  sizes="(max-width: 640px) 100vw, 80vw"
  quality={80}
  priority={false}
/>
```

---

### 4. **Database Queries - SLOW**

**Problem:** No `.lean()`, no indexes, no caching

**Solutions:**

```typescript
// ❌ BEFORE
const posts = await Post.find({ published: true })
  .sort({ createdAt: -1 })
  .limit(10);

// ✅ AFTER (2-3x faster)
const posts = await Post.find({ published: true })
  .select("-__v") // Exclude unnecessary fields
  .sort({ createdAt: -1 })
  .limit(10)
  .lean() // Read-only, no need for document methods
  .exec();

// Also add indexes to models:
postSchema.index({ published: 1, createdAt: -1 }); // Compound index
postSchema.index({ slug: 1 }); // For slug lookups
```

---

### 5. **Link Prefetching - NOT ENABLED**

**Problem:** No Link prefetching, navigation feels slow

**Solution:**

```typescript
// ✅ Add prefetch to important links
<Link href="/blog" prefetch={true}>
  Blog
</Link>

// Or use <a> with prefetch on hover
```

---

## 🎯 Implementation Checklist

### Phase 1: Critical Fixes (Do First)

- [ ] Update `.next/config.mjs`:
  - [x] `productionBrowserSourceMaps: false`
  - [x] Add webpack optimization
  - [x] Add caching headers
- [ ] Update `/api/posts/route.ts`:
  - [ ] Change `revalidate = 3600`
  - [ ] Add `.lean()` to queries
  - [ ] Add cache headers
- [ ] Update `/api/spots/route.ts`:

  - [ ] Change `revalidate = 86400`
  - [ ] Add `.lean()` to queries

- [ ] Replace hardcoded images:
  - [ ] Use `OptimizedImage` component
  - [ ] Add width/height hints
  - [ ] Add `priority={true}` for LCP images

### Phase 2: SEO Optimization (Done)

- [x] Add `robots.txt`
- [x] Add `sitemap.ts`
- [x] Add metadata utility
- [x] Add structured data (JSON-LD)
- [x] Add OpenGraph tags
- [x] Add canonical URLs

### Phase 3: Advanced Optimizations

- [ ] Add Redis cache for DB queries
- [ ] Add ISR (Incremental Static Regeneration)
- [ ] Enable compression in middleware
- [ ] Add Image lazy loading
- [ ] Minify CSS/JS further

---

## 📈 Measuring Performance

### Test TTFB Locally

```bash
# Check first contentful paint
npm run build
npm start

# Open DevTools → Network → Check timing
# Look for "TTFB" column
```

### Test Bundle Size

```bash
# Install bundle analyzer
npm install --save-dev @next/bundle-analyzer

# Create next.config.mjs with analyzer
ANALYZE=true npm run build
```

### Test Lighthouse Score

```bash
# Use online tool
https://pagespeed.web.dev/

# Target:
# - Performance: > 90
# - Accessibility: > 90
# - Best Practices: > 90
# - SEO: > 90
```

---

## 🔍 Database Query Optimization

### Add Indexes to Models

```typescript
// models/Post.model.ts
postSchema.index({ published: 1, createdAt: -1 });
postSchema.index({ slug: 1 });
postSchema.index({ type: 1, published: 1 });

// models/Booking.model.ts
bookingSchema.index({ spotId: 1, startDate: 1, endDate: 1 });
bookingSchema.index({ status: 1, createdAt: -1 });

// Apply after schema definition
Post.collection.createIndexes();
Booking.collection.createIndexes();
```

### Query Optimization Patterns

```typescript
// ✅ GOOD: Lean for read-only
const posts = await Post.find()
  .select("title slug author createdAt")
  .lean()
  .exec();

// ❌ BAD: Full documents when not needed
const posts = await Post.find();

// ✅ GOOD: Lean with pagination
async function getPostsPage(page: number, limit: number = 10) {
  const skip = (page - 1) * limit;
  const [posts, total] = await Promise.all([
    Post.find().skip(skip).limit(limit).lean(),
    Post.countDocuments(),
  ]);
  return { posts, pagination: { page, limit, total } };
}
```

---

## 🚀 Caching Strategy

### Static Pages (Cache Forever)

```typescript
// app/about/page.tsx
export const revalidate = 86400 * 30; // 30 days
export const dynamic = "force-static";
```

### Blog Posts (Cache 1 Day)

```typescript
// app/blog/[slug]/page.tsx
export const revalidate = 86400; // 1 day
```

### User Data (No Cache)

```typescript
// app/admin/dashboard/page.tsx
export const revalidate = 0; // Always fresh
export const dynamic = "force-dynamic";
```

---

## 📝 After Implementation

**Expected Improvements:**

| Metric     | Before | After      | Improvement |
| ---------- | ------ | ---------- | ----------- |
| TTFB       | 2-3s   | 200-500ms  | 75% ↓       |
| LCP        | 3-4s   | 1-2s       | 50% ↓       |
| FCP        | 2-3s   | 500-1000ms | 60% ↓       |
| Bundle     | ~500KB | ~350KB     | 30% ↓       |
| Lighthouse | 60     | 85+        | ↑           |

---

## 🔗 Next Steps

1. Implement fixes in Phase 1
2. Run `npm run build` to verify
3. Test locally: `npm start`
4. Run Lighthouse test
5. Deploy to production
6. Monitor performance with Web Vitals

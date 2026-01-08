# Best Practices & Configuration Guide

## 📋 Table of Contents

1. [Environment Setup](#environment-setup)
2. [API Development](#api-development)
3. [Error Handling](#error-handling)
4. [Database](#database)
5. [Security](#security)
6. [Testing](#testing)
7. [Deployment](#deployment)

---

## Environment Setup

### Validation

Environment variables are automatically validated at startup. If validation fails, the app won't start.

```bash
# Development
cp .env.example .env.local
# Edit with your values
pnpm dev

# Production
# Set environment variables in your hosting platform
```

**Required variables:**

- `MONGODB_URI` - MongoDB connection
- `JWT_SECRET` - JWT signing key (min 8 chars)
- `CLOUDINARY_URL` - Image hosting

---

## API Development

### Request/Response Pattern

All API routes should follow this pattern:

```typescript
// app/api/posts/route.ts
import { NextRequest, NextResponse } from "next/server";
import { successResponse, errorResponse } from "@/lib/api-response";
import { CreatePostSchema } from "@/lib/validation-schemas";
import { validateBody } from "@/middlewares/api-middleware";
import { createLogger } from "@/lib/logger";

const logger = createLogger("PostsAPI");

export async function POST(request: NextRequest) {
  try {
    // Validate request body
    const bodyData = await validateBody(CreatePostSchema)(request);
    if (bodyData instanceof NextResponse) return bodyData;

    // Business logic
    const post = await createPost(bodyData);

    logger.info("Post created", { postId: post._id });
    return successResponse(post, 201);
  } catch (error) {
    logger.error("Failed to create post", error as Error);
    return errorResponse(error);
  }
}
```

### Input Validation

Use Zod schemas from `lib/validation-schemas.ts`:

```typescript
import { LoginSchema, CreatePostSchema } from "@/lib/validation-schemas";

// Validate with error handling
const result = LoginSchema.safeParse(data);
if (!result.success) {
  throw new ValidationError(
    "Invalid input",
    formatValidationErrors(result.error)
  );
}
```

---

## Error Handling

### Use Custom Error Classes

```typescript
import {
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
  DatabaseError,
} from "@/lib/errors";

// Validation
throw new ValidationError("Invalid email", { field: "email" });

// Not found
throw new NotFoundError("User");

// Auth errors
throw new UnauthorizedError("Invalid credentials");
throw new ForbiddenError("Access denied");

// Conflict
throw new ConflictError("Email already in use");

// Database
throw new DatabaseError("Query failed", originalError);
```

### Error Response Format

Errors are automatically formatted:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request",
    "details": { "field": "error message" } // Only in development
  },
  "timestamp": "2025-01-01T00:00:00Z"
}
```

---

## Database

### Proper Model Definition

Models should extend MongoDB Document and use proper types:

```typescript
import mongoose, { Document, Schema } from "mongoose";

export interface IMyModel extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

const myModelSchema = new Schema<IMyModel>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
  },
  { timestamps: true }
);

// Add indexes for frequent queries
myModelSchema.index({ createdAt: -1 });

export const MyModel =
  mongoose.models.MyModel || mongoose.model<IMyModel>("MyModel", myModelSchema);
```

### Query Best Practices

```typescript
// Use lean() for read-only queries (faster)
const users = await User.find({ active: true }).lean();

// Use select() to limit fields
const post = await Post.findById(id).select("title content author");

// Use populate() for references
const booking = await Booking.findById(id).populate("userId");

// Index your queries
// Add indexes to frequently queried fields in schema
```

---

## Security

### Security Headers

Automatically added via `security-middleware.ts`:

- X-Content-Type-Options
- X-Frame-Options
- Content-Security-Policy
- Strict-Transport-Security
- CORS configuration

### Authentication

Use JWT tokens with validation:

```typescript
import { verifyAuth } from "@/middlewares/api-middleware";

export const POST = requireAuth(async (request: NextRequest) => {
  // User is authenticated
  return successResponse({ message: "OK" });
});
```

### Rate Limiting

Implemented in middleware:

```typescript
import {
  checkRateLimit,
  rateLimitResponse,
} from "@/middlewares/security-middleware";

export async function POST(request: NextRequest) {
  const ip = request.ip || "unknown";

  if (!checkRateLimit(ip, 100, 60000)) {
    return rateLimitResponse();
  }
  // ... rest of handler
}
```

---

## Testing

### Test Structure

```typescript
// __tests__/unit/services/myService.test.ts
import { MyService } from "@/services/myService";

describe("MyService", () => {
  describe("method()", () => {
    it("should return correct value", async () => {
      const result = await MyService.method();
      expect(result).toBeDefined();
      expect(result).toEqual(expected);
    });

    it("should handle errors gracefully", async () => {
      await expect(MyService.method()).rejects.toThrow();
    });
  });
});
```

### Run Tests

```bash
pnpm test              # Run all tests
pnpm test:watch       # Watch mode
pnpm test:coverage    # Coverage report
```

---

## Deployment

### Pre-deployment Checklist

- [ ] All tests pass: `pnpm test`
- [ ] No TypeScript errors: `pnpm typecheck`
- [ ] No linting errors: `pnpm lint`
- [ ] Environment variables configured
- [ ] Database migration completed
- [ ] Secrets not committed

### Build Process

```bash
pnpm build            # Create optimized build
pnpm start            # Start production server
```

### Docker Deployment

```bash
pnpm docker:build     # Build image
pnpm docker:up        # Start with Docker Compose
```

### Environment Variables (Production)

Set these on your hosting platform:

- `NODE_ENV=production`
- `MONGODB_URI=<production-mongo-uri>`
- `JWT_SECRET=<strong-random-secret>`
- `CLOUDINARY_URL=<cloudinary-url>`
- `TELEGRAM_BOT_TOKEN=<bot-token>`

---

## Logging

### Use Structured Logger

```typescript
import { createLogger } from "@/lib/logger";

const logger = createLogger("MyComponent");

// Debug (not logged in production)
logger.debug("Debug message", { data: value });

// Info
logger.info("Operation completed", { userId: 123 });

// Warning
logger.warn("Unusual activity", { attempt: 3 });

// Error
logger.error("Operation failed", error, { context: data });
```

Output format:

```
[2025-01-01T12:00:00.000Z] INFO: [MyComponent] Operation completed {"data":{"userId":123}}
```

---

## Common Patterns

### Safe Type-Safe Queries

```typescript
// Use interfaces for type safety
interface QueryOptions {
  page?: number;
  limit?: number;
  sort?: string;
}

async function getItems(options: QueryOptions = {}) {
  const { page = 1, limit = 10, sort = "-createdAt" } = options;

  return Item.find()
    .sort(sort)
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();
}
```

### Async Error Handling

```typescript
// Good: Use try-catch
async function safeOperation() {
  try {
    const result = await someAsyncOp();
    return result;
  } catch (error) {
    logger.error("Operation failed", error as Error);
    throw new AppError(
      ErrorCode.INTERNAL_ERROR,
      "Failed to complete operation"
    );
  }
}

// Bad: Don't ignore errors
async function badOperation() {
  return await someAsyncOp(); // What if it fails?
}
```

---

## Resources

- [Environment Setup Docs](./README.md)
- [Error Classes](./lib/errors.ts)
- [Validation Schemas](./lib/validation-schemas.ts)
- [Security Middleware](./middlewares/security-middleware.ts)

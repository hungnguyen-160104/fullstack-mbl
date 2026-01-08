# Admin Login - Complete Debug & Fix Guide

## 🔴 Issue Analysis

### Root Causes Found:

1. **Environment Variables Not Set**

   - `.env.local` has placeholder values
   - `SINGLE_PASSWORD_HASH=$2b$10$...` is a placeholder

2. **Missing Fallback Logic**

   - Only `SINGLE_PASSWORD_HASH` is being checked
   - Fallback to `SINGLE_PASSWORD` not working properly

3. **Token Not Being Stored Correctly**
   - Browser localStorage may have CORS issues
   - Token expiration not validated on client

---

## ✅ Step-by-Step Fix

### 1️⃣ Generate Bcrypt Hash (One-Time Setup)

```bash
# Option A: Use Node.js
node -e "console.log(require('bcryptjs').hashSync('your-password', 10))"

# Output: $2b$10$xxxxxxxxxxxxx...

# Copy this hash
```

### 2️⃣ Update `.env.local`

```env
# Authentication
SINGLE_USER=admin
SINGLE_PASSWORD=your-password                # Plain text (fallback)
SINGLE_PASSWORD_HASH=$2b$10$xxxxx...         # Bcrypt hash (primary)
JWT_SECRET=super-strong-secret-key-min-32-chars
JWT_EXPIRES_IN=7d
```

### 3️⃣ Verify Auth Service

File: `services/auth.service.ts`

```typescript
// This should already have proper logic:
export async function validateAdmin(
  username: string,
  password: string
): Promise<boolean> {
  const SINGLE_USER = process.env.SINGLE_USER ?? "";
  const PASS_HASH = process.env.SINGLE_PASSWORD_HASH ?? "";
  const PASS_PLAIN = process.env.SINGLE_PASSWORD ?? "";

  if (username !== SINGLE_USER) return false;

  // Try bcrypt hash first
  if (PASS_HASH) {
    try {
      if (await bcrypt.compare(password, PASS_HASH)) return true;
    } catch (e) {
      // Fall through to plaintext
    }
  }

  // Fallback to plaintext
  if (PASS_PLAIN) {
    return password === PASS_PLAIN;
  }

  return false;
}
```

### 4️⃣ Test Admin Login Locally

```bash
# Start dev server
pnpm dev

# Visit: http://localhost:8080/admin/login

# Try login with:
# Username: admin
# Password: your-password
```

### 5️⃣ Debug in Browser Console

```javascript
// In browser DevTools console:

// 1. Check if token is stored
localStorage.getItem("mbl_token");
// Should return: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

// 2. Check API response
fetch("/api/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ username: "admin", password: "your-password" }),
})
  .then((r) => r.json())
  .then((d) => console.log(d));
// Should return: { token: "...", user: {username: "admin"}, expiresIn: "7d" }

// 3. Check admin check
fetch("/api/auth/me", {
  headers: { Authorization: "Bearer " + localStorage.getItem("mbl_token") },
})
  .then((r) => r.json())
  .then((d) => console.log(d));
// Should return: { user: {...} }
```

### 6️⃣ Enhanced Logout Handler

The logout is already implemented in `app/admin/layout.tsx`:

```typescript
<button
  onClick={() => {
    clearToken(); // Removes token from localStorage
    router.push("/admin/login"); // Redirect to login
  }}
  className="text-sm underline"
>
  Đăng xuất
</button>
```

**But let's enhance it with proper confirmation:**

```typescript
// Enhanced logout with confirmation
const handleLogout = async () => {
  const confirmed = window.confirm("Bạn chắc chắn muốn đăng xuất?");
  if (!confirmed) return;

  try {
    // Optional: Invalidate token on server
    await fetch("/api/auth/logout", { method: "POST" });
  } catch (e) {
    // Ignore errors, still logout locally
  } finally {
    clearToken();
    router.push("/admin/login");
  }
};
```

---

## 🧪 Complete Test Flow

### Test Login Success Path

```bash
1. Navigate to /admin/login
2. Enter: username = "admin"
3. Enter: password = "your-password"
4. Click "Đăng nhập"
5. Expect: Redirect to /admin/dashboard
6. Check: localStorage has token
7. Check: Dashboard loads with posts
```

### Test Logout Path

```bash
1. Logged in on /admin/dashboard
2. Click "Đăng xuất" button
3. Confirm dialog
4. Expect: Redirect to /admin/login
5. Check: localStorage token removed
6. Try to visit /admin/dashboard directly
7. Expect: Redirect back to /admin/login
```

### Test Token Validation

```bash
1. Login successfully
2. Get token from: localStorage.getItem('mbl_token')
3. Open DevTools → Network
4. Create new admin post request
5. Check: Authorization header has token
6. Check: Request succeeds (posts created)
```

---

## 🔐 Security Enhancements

### Add JWT Validation on Protected Routes

```typescript
// middlewares/requireAuth.ts - ENHANCED

import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "@/utils/jwt";

export async function withAuth(
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  return async (request: NextRequest) => {
    const token = request.headers.get("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json(
        { message: "Unauthorized - missing token" },
        { status: 401 }
      );
    }

    try {
      const payload = jwtVerify(token);
      // payload should contain { username, iat, exp }

      // Check expiration
      if (payload.exp && Date.now() / 1000 > payload.exp) {
        return NextResponse.json({ message: "Token expired" }, { status: 401 });
      }

      // Continue to handler
      return handler(request);
    } catch (error) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }
  };
}
```

### Add CSRF Protection to Admin Routes

```typescript
// app/admin/layout.tsx - ADD CSRF TOKEN

import { generateCSRFToken, validateCSRFToken } from "@/lib/csrf";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const csrfToken = generateCSRFToken();

  return (
    <div>
      {/* Hidden CSRF token in form */}
      <input type="hidden" name="csrf" value={csrfToken} />
      {/* ... rest of layout */}
    </div>
  );
}
```

---

## 📋 Verification Checklist

- [ ] `.env.local` has `SINGLE_PASSWORD` or `SINGLE_PASSWORD_HASH`
- [ ] `SINGLE_USER=admin` is set
- [ ] `JWT_SECRET` is set to strong random string
- [ ] Login page loads without errors
- [ ] Can login with correct credentials
- [ ] Cannot login with wrong credentials
- [ ] Token stored in localStorage after login
- [ ] Can access dashboard after login
- [ ] Logout button works
- [ ] Accessing /admin/dashboard without token redirects to login
- [ ] Can create posts after login
- [ ] Posts appear in dashboard

---

## 🚨 Common Issues & Solutions

### "Invalid credentials" always shows

**Cause:** Password in env doesn't match what you're entering

**Fix:**

```bash
# Check what password is set:
echo $SINGLE_PASSWORD

# Re-generate bcrypt hash:
node -e "console.log(require('bcryptjs').hashSync('newpassword', 10))"

# Update .env.local and restart dev server
pnpm dev
```

### Token not persisting after refresh

**Cause:** localStorage issue or CORS problem

**Fix:**

```typescript
// Check localStorage is enabled
console.log(typeof localStorage); // Should be 'object'

// Check CORS headers allow credentials
fetch('/api/...', {
  method: 'POST',
  credentials: 'include', // Include cookies/storage
  headers: { ... }
})
```

### Can login but dashboard shows "Đang kiểm tra phiên..."

**Cause:** Token validation failing

**Fix:**

```bash
# In browser console:
localStorage.getItem('mbl_token')
// If empty or null, logout and login again

# Restart dev server
pnpm dev
```

### "Cannot read property 'user' of undefined" in dashboard

**Cause:** API `/api/auth/me` not returning user

**Fix:**

```typescript
// Check app/api/auth/me/route.ts exists and returns proper response
export async function GET(req: Request) {
  const user = req.user; // This should be set by middleware
  if (!user)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ user });
}
```

---

## 📝 After Login Works

1. Test creating a post from admin
2. Check post appears in blog
3. Test logout and login again
4. Test token expiration (set JWT_EXPIRES_IN=1m to test)
5. Deploy to production with strong password

**Once verified working locally, credentials are ready for production!**

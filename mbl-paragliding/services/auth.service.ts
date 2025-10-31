// services/auth.service.ts
import bcrypt from "bcryptjs";

const SINGLE_USER = process.env.SINGLE_USER ?? "";
const PASS_HASH = process.env.SINGLE_PASSWORD_HASH ?? "";          // bcrypt hash (nếu có)
const PASS_PLAIN = process.env.SINGLE_PASSWORD ?? "";              // plaintext (tùy chọn cho demo)

/**
 * Xác thực admin 1 tài khoản đơn.
 * - Ưu tiên so sánh bcrypt với SINGLE_PASSWORD_HASH
 * - Nếu không khớp hoặc không có hash => fallback so sánh với SINGLE_PASSWORD
 */
export async function validateAdmin(username: string, password: string): Promise<boolean> {
  if (!SINGLE_USER) return false;
  if (username !== SINGLE_USER) return false;

  // 1) Thử hash trước (nếu cung cấp)
  if (PASS_HASH) {
    try {
      if (await bcrypt.compare(password, PASS_HASH)) return true;
    } catch {
      // bỏ qua, rơi xuống plaintext
    }
  }

  // 2) Fallback plaintext (dùng cho demo)
  if (PASS_PLAIN) {
    return password === PASS_PLAIN;
  }

  return false;
}

import bcrypt from "bcryptjs";

const pass = "@mebayluonweb2025";
const hash = "$2b$10$w11V7vpL.k7cgSXwIRho9uKQ1URlg.y7tFuNIyOicXe7yRQ8jfG/C";

const ok = await bcrypt.compare(pass, hash);
console.log("match?", ok);

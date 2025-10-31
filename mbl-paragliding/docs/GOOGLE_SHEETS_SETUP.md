# Hướng dẫn cài đặt Google Sheets Integration

## Bước 1: Tạo Google Sheet

1. Truy cập [Google Sheets](https://sheets.google.com)
2. Tạo một spreadsheet mới có tên "MBL Paragliding Bookings"
3. Giữ nguyên sheet đầu tiên (Sheet1)

## Bước 2: Cài đặt Google Apps Script

1. Trong Google Sheet, vào **Extensions** → **Apps Script**
2. Xóa code mặc định và paste toàn bộ code dưới đây:

\`\`\`javascript
// Google Apps Script code to deploy as a web app
// SpreadsheetApp and ContentService are global objects provided by Google Apps Script

function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet()

    // Parse the JSON payload
    const data = JSON.parse(e.postData.contents)

    // Prepare row data
    const timestamp = new Date(data.timestamp)
    const mainGuest = data.guests[0]

    const optionsList = []
    if (data.options.transfer) optionsList.push("Đưa đón")
    if (data.options.flycam) optionsList.push("Flycam")
    if (data.options.luggage) optionsList.push("Hành lý")

    const row = [
      timestamp,
      data.guestCount,
      mainGuest.name,
      mainGuest.phone,
      mainGuest.email,
      mainGuest.date,
      mainGuest.timeSlot,
      mainGuest.pickup || "",
      optionsList.join(", "),
      data.discountCode || "",
      data.subtotal,
      data.discountAmount,
      data.total,
      mainGuest.note || "",
      // Add all guests info as JSON string
      JSON.stringify(data.guests),
    ]

    // Append the row
    sheet.appendRow(row)

    return ContentService.createTextOutput(
      JSON.stringify({
        status: "success",
        message: "Booking recorded successfully",
      }),
    ).setMimeType(ContentService.MimeType.JSON)
  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({
        status: "error",
        message: error.toString(),
      }),
    ).setMimeType(ContentService.MimeType.JSON)
  }
}

function doGet() {
  return ContentService.createTextOutput("MBL Paragliding Booking API is running")
}

// Setup function to create headers (run this once manually)
function setupSheet() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet()
  const headers = [
    "Timestamp",
    "Số khách",
    "Tên khách chính",
    "Số điện thoại",
    "Email",
    "Ngày bay",
    "Khung giờ",
    "Điểm đón",
    "Dịch vụ thêm",
    "Mã giảm giá",
    "Tạm tính",
    "Giảm giá",
    "Tổng cộng",
    "Ghi chú",
    "Chi tiết khách (JSON)",
  ]
  sheet.getRange(1, 1, 1, headers.length).setValues([headers])
  sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold")
}
\`\`\`

3. Lưu project (Ctrl+S hoặc Cmd+S)
4. Đặt tên project: "MBL Booking API"

## Bước 3: Chạy hàm setup (chỉ 1 lần)

1. Trong Apps Script editor, chọn function `setupSheet` từ dropdown
2. Click nút **Run** (▶️)
3. Lần đầu chạy sẽ yêu cầu authorize:
   - Click **Review permissions**
   - Chọn tài khoản Google của bạn
   - Click **Advanced** → **Go to MBL Booking API (unsafe)**
   - Click **Allow**
4. Kiểm tra Google Sheet - sẽ thấy hàng header đã được tạo

## Bước 4: Deploy Web App

1. Trong Apps Script editor, click **Deploy** → **New deployment**
2. Click icon ⚙️ bên cạnh "Select type" → chọn **Web app**
3. Cấu hình:
   - **Description**: "MBL Booking API v1"
   - **Execute as**: Me (your email)
   - **Who has access**: Anyone
4. Click **Deploy**
5. Copy **Web app URL** (dạng: `https://script.google.com/macros/s/ABC.../exec`)

## Bước 5: Cấu hình trong Next.js

1. Trong v0, mở **Vars** section từ in-chat sidebar bên trái
2. Thêm environment variable mới:
   - **Key**: `NEXT_PUBLIC_GOOGLE_SCRIPT_URL`
   - **Value**: URL vừa copy từ bước 4 (ví dụ: `https://script.google.com/macros/s/AKfycbx.../exec`)
3. Save và reload trang

## Bước 6: Test

1. Truy cập trang booking trên website
2. Điền thông tin và đi đến bước cuối
3. Click vào một trong các nút liên hệ (Zalo/WhatsApp/Messenger)
4. Kiểm tra Google Sheet - sẽ thấy dữ liệu mới được thêm vào

## Cấu trúc dữ liệu trong Sheet

| Cột | Mô tả |
|-----|-------|
| Timestamp | Thời gian đặt tour |
| Số khách | Số lượng khách |
| Tên khách chính | Tên người đặt tour |
| Số điện thoại | SĐT liên hệ |
| Email | Email liên hệ |
| Ngày bay | Ngày dự kiến bay |
| Khung giờ | Sáng/Chiều/Tối |
| Điểm đón | Địa chỉ đón khách |
| Dịch vụ thêm | Các option đã chọn |
| Mã giảm giá | Mã discount đã dùng |
| Tạm tính | Giá trước giảm |
| Giảm giá | Số tiền giảm |
| Tổng cộng | Giá cuối cùng |
| Ghi chú | Ghi chú từ khách |
| Chi tiết khách (JSON) | Thông tin đầy đủ tất cả khách |

## Troubleshooting

### Lỗi CORS
- Đây là bình thường với Google Apps Script
- Code sử dụng `mode: 'no-cors'` để bypass

### Không thấy dữ liệu trong Sheet
- Kiểm tra Console log trong browser (F12)
- Verify URL trong Vars section đúng
- Đảm bảo đã deploy với "Who has access: Anyone"

### Lỗi Authorization
- Re-run function `setupSheet` và authorize lại
- Đảm bảo "Execute as: Me" trong deployment settings

### Environment variable không hoạt động
- Đảm bảo đã thêm `NEXT_PUBLIC_GOOGLE_SCRIPT_URL` trong **Vars** section của v0
- Reload trang sau khi thêm environment variable
- Kiểm tra tên variable phải chính xác (có prefix `NEXT_PUBLIC_`)

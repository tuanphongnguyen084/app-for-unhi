# HRM - Ứng Dụng Ôn Tập Quản Trị Nhân Lực

Ứng dụng web giúp học sinh ôn tập môn Quản Trị Nhân Lực (HRM) với 566 câu hỏi trắc nghiệm từ 9 bài học.

## ✨ Tính Năng Chính

### 1. Chế độ Ôn Tập Từng Bài
- Chọn từ 9 bài học có sẵn
- Làm từng đề tương ứng (40 câu/đề)
- Thời gian: 60 phút/đề
- Lưu kết quả để xem lại

### 2. Chế độ Ôn Tập Tổng Hợp
- Trộn ngẫu nhiên 40 câu từ toàn bộ 566 câu
- 14 đề tổng hợp khác nhau
- Thời gian: 60 phút/đề

### 3. Tính Năng Đặc Biệt
- **Timer** tự động đếm ngược với cảnh báo
- **Theo dõi kết quả**: Lưu trữ điểm số, tỉ lệ % cho mỗi bài đã làm
- **Làm lại:** Có thể làm lại toàn bộ đề hoặc chỉ làm lại những câu sai
- **Xem chi tiết**: Hiển thị số câu đúng/sai/bỏ qua, thời gian làm bài
- **Giao diện hiện đại**: Thiết kế pink gradient, responsive trên mobile & desktop

## 📊 Dữ Liệu Câu Hỏi

- **Tổng cộng**: 566 câu hỏi
- **Số bài**: 9 bài học
- **Số đề**: ~50+ đề trắc nghiệm
- **Format dữ liệu**: JSON (hrm_data.json)

## 🚀 Cách Sử Dụng

### Chạy Ứng Dụng

**Cách 1: Mở file trực tiếp**
- Mở file `index.html` trong trình duyệt
- App sẽ tự động load dữ liệu từ `hrm_data.json`

**Cách 2: Chạy local server (Recommended)**
```bash
cd hrm-app
python3 -m http.server 8000
```
Sau đó truy cập: `http://localhost:8000`

### Quy Trình Làm Bài
1. Chọn chế độ ôn tập:
   - **Ôn Tập Từng Bài**: Chọn bài → chọn đề → làm bài
   - **Ôn Tập Tổng Hợp**: Chọn đề tổng hợp → làm bài

2. Làm bài:
   - Đọc câu hỏi và chọn đáp án (A/B/C/D)
   - Nút **Tiếp** để sang câu sau
   - Nút **Trước** để quay lại câu trước
   - Nút **Bỏ Qua** để bỏ câu
   - Nút **Nộp Bài** ở câu cuối để hoàn thành

3. Xem kết quả:
   - Số câu đúng/sai/bỏ qua
   - Phần trăm điểm
   - Nhận xét (Giỏi quá kkk! / Gà quá làm lại đi!)
   - Tùy chọn: **Làm Lại Full** hoặc **Làm Lại Câu Sai**

## 📂 Cấu Trúc File

```
hrm-app/
├── index.html              # Giao diện chính (HTML + CSS)
├── app.js                  # Logic ứng dụng (JavaScript)
├── hrm_data.json           # Dữ liệu 566 câu hỏi + đáp án
├── extract_hrm.py          # Script trích xuất dữ liệu từ file Word
└── README.md               # Hướng dẫn sử dụng
```

## 🔄 Cập Nhật Dữ Liệu

Nếu cần cập nhật câu hỏi:

1. Chỉnh sửa file docx gốc
2. Chạy script trích xuất:
```bash
python3 extract_hrm.py
```
3. Script sẽ tự động tạo/cập nhật `hrm_data.json`

### Lưu ý về đáp án
- Đáp án được trích từ **chữ in đậm (bold)** trong file Word
- Hiện tại 100% câu hỏi (566/566) đã có đáp án
- Bạn có thể edit `hrm_data.json` trực tiếp để sửa đáp án nếu cần
- **Responsive:** Tự động điều chỉnh trên mobile
- **Smooth animations:** Các hiệu ứng mượt mà

## 📝 Liên Hệ / Báo Lỗi

Nếu gặp vấn đề:
1. Kiểm tra console (F12 → Console) để xem lỗi
2. Đảm bảo `hrm_data.json` tồn tại trong cùng thư mục
3. Thử reload trang (Ctrl+F5 hoặc Cmd+Shift+R)## 🛠 Công Nghệ Sử Dụng

- **Frontend**: HTML5, CSS3 (Gradient, Flexbox)
- **Interactivity**: Vanilla JavaScript (No Framework)
- **Data Format**: JSON
- **Data Extraction**: Python 3 (docx → JSON)
- **Deployment**: Static files (no backend needed)

## 📈 Thống Kê

| Thành phần | Số lượng |
|-----------|---------|
| Câu hỏi | 566 |
| Bài học | 9 |
| Đề thi | ~50+ |
| Đáp án | 566/566 (100%) |
| Dòng code JS | 651 |

## 💡 Features Chính

✅ **State Management**: Theo dõi tiến độ làm bài, lưu trữ kết quả  
✅ **Timer**: Tự động đếm ngược và cảnh báo thời gian  
✅ **Responsive Design**: Hoạt động tốt trên mobile & desktop  
✅ **Local Storage Ready**: Có thể lưu trữ dữ liệu offline (sẵn sàng cho V2)  
✅ **Score Tracking**: Lưu kết quả mỗi đề để theo dõi tiến độ  
✅ **Retry Logic**: Làm lại toàn bộ hoặc chỉ câu sai

---

**Version:** 1.0  
**Cập nhật:** Tháng 1, 2026  
**Author**: Học sinh ôn tập HRM

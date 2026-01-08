# 📚 App Ôn Tập HRM - Quản Trị Nhân Lực

## 📋 Tính Năng

### Chế độ Ôn Tập
1. **Ôn Tập Từng Bài** 📖
   - Chọn bài học từ 9 bài có sẵn
   - Chọn đề tương ứng (2-3 đề/bài)
   - Làm 40 câu trong 60 phút

2. **Ôn Tập Tổng Hợp** 🎲
   - Trộn câu hỏi từ nhiều bài
   - Chọn số lượng: 20, 30 hoặc 40 câu
   - Thời gian tương ứng: 30, 45, 60 phút

### Tính Năng Khác
- ⏱ **Timer** tự động đếm ngược
- ✓ **Chỉnh sửa câu trả lời** dễ dàng
- 📊 **Tính điểm tự động** dựa trên đáp án đúng
- 🎯 **Xem kết quả** chi tiết (Đúng/Sai/Bỏ qua)
- 📱 **Responsive** trên mobile và desktop

## 📊 Dữ Liệu

**Tổng cộng:** 566 câu hỏi từ 9 bài học

| Bài | Chủ đề | Đề | Câu | Đáp án |
|-----|--------|-----|-----|--------|
| 1 | Tổng quan | 2 | 80 | 80 ✓ |
| 2 | Phân tích công việc | 2 | 80 | 80 ✓ |
| 3 | Tuyển dụng nhân lực | 3 | 119 | 119 ✓ |
| 4 | Đào tạo và phát triển | 2 | 80 | 14 |
| 5 | Đánh giá thực hiện công việc | 1 | 40 | 39 ✓ |
| 6 | Thù lao lao động | 2 | 80 | 62 ✓ |
| 7 | Phúc lợi và dịch vụ | 1 | 39 | 21 |
| 8 | Quan hệ lao động | 1 | 40 | 40 ✓ |
| 9 | QTNL toàn cầu | 1 | 8 | 8 ✓ |

## 🚀 Cách Sử Dụng

### Khởi động
1. Mở file `index.html` trong trình duyệt
2. App sẽ tự động load dữ liệu từ `hrm_data.json`

### Làm Bài
1. Chọn chế độ ôn tập
2. Chọn bài/đề hoặc số lượng câu
3. Trả lời từng câu hỏi
4. Nút **"Tiếp →"** để sang câu tiếp theo
5. Nút **"Bỏ Qua"** để bỏ câu và sang câu tiếp
6. Nút **"Trước"** để quay lại câu trước
7. Nút **"Nộp Bài"** ở câu cuối cùng để hoàn thành

### Xem Kết Quả
- Thời gian làm bài
- Số câu đúng/sai/bỏ qua
- Phần trăm điểm
- Nhận xét (Xuất sắc/Tốt/Bình thường/Cần ôn tập)

## 📂 Cấu Trúc File

```
app-for-unhi/
├── index.html           # Giao diện chính
├── app.js              # Logic ứng dụng
├── hrm_data.json       # Dữ liệu câu hỏi + đáp án
├── extract_hrm.py      # Script trích xuất dữ liệu từ docx
├── Test bank HRM.docx  # File docx gốc
└── old_app/            # App cũ (Lịch sử Đảng)
    ├── index.html
    ├── data/
    │   ├── 1.json
    │   ├── 11.json
    │   └── ...
    └── extract_*.ipynb
```

## 🔄 Cập Nhật Dữ Liệu

Nếu bạn thay đổi file `Test bank HRM.docx`, chạy:

```bash
python3 extract_hrm.py
```

Script sẽ tự động:
- Trích xuất tất cả câu hỏi
- Tìm câu trả lời đúng (từ formatting **bold**)
- Lưu vào `hrm_data.json`

## ✨ Lưu Ý

- **Đáp án được trích xuất từ formatting bold** trong docx
- Hiện tại có 463/566 đáp án được đánh dấu
- Một số câu từ Bài 4, 7 chưa có đáp án (không có formatting bold)
- Bạn có thể edit `hrm_data.json` để thêm đáp án thiếu

## 🎨 Giao Diện

- **Màu chủ đạo:** Xanh tím (Gradient)
- **Responsive:** Tự động điều chỉnh trên mobile
- **Smooth animations:** Các hiệu ứng mượt mà

## 📝 Liên Hệ / Báo Lỗi

Nếu gặp vấn đề:
1. Kiểm tra console (F12 → Console) để xem lỗi
2. Đảm bảo `hrm_data.json` tồn tại trong cùng thư mục
3. Thử reload trang (Ctrl+F5 hoặc Cmd+Shift+R)

---

**Version:** 1.0  
**Cập nhật lần cuối:** Tháng 1, 2026

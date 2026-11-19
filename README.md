# Hash Table Probing Strategies

**Báo cáo tương tác:** so sánh Linear Probing, Quadratic Probing và Double Hashing theo cùng một đầu vào, tập trung vào **khi nào nên chọn từng phương pháp và trade-off**.

Giao diện một cột, phong cách báo cáo học thuật tối giản, tiếp nối dự án [quicksort-pivot-selection](https://github.com/kieran-lucas/quicksort-pivot-selection).

## Nội dung

1. Va chạm và bài toán chọn dãy thăm dò.
2. Công thức và tính chất của ba chiến lược.
3. Mã Java tương ứng.
4. **Mô phỏng đồng bộ theo khóa**: ba bảng chạy song song; Play/Pause, từng bước, thanh tua, tốc độ và bộ dữ liệu mẫu.
5. Thống kê từng lần chèn, tổng số lượt thăm dò, va chạm, chèn thất bại; thử tìm kiếm khóa có/không tồn tại.
6. Phân tích hệ số tải và hiệu năng kỳ vọng của Linear Probing; đối chiếu clustering, cache locality, tính bao phủ, tính phức tạp triển khai.

## Chạy

Mở trực tiếp `index.html` trong trình duyệt hiện đại. Không yêu cầu build hoặc framework.

```bash
node --test tests/probing.test.cjs
javac src/ProbingStrategies.java
java -cp src ProbingStrategies
```

## Quy ước thí nghiệm

- Bảng có `M ∈ {11,13,17,19,23,29,31}`, đều là số nguyên tố lớn hơn 7.
- `h₁(k) = k mod M`; `h₂(k) = 7 − (k mod 7)`; modulo được chuẩn hóa cho khóa âm.
- Thăm dò theo `i=0,1,…`: Linear `h₁+i`, Quadratic `h₁+i²`, Double `h₁+i·h₂` (lấy modulo M).
- Đầu vào gồm các khóa nguyên **phân biệt**; không có xóa, tombstone hay tự động resize. Mỗi ô kiểm tra được tính là **một probe**; kiểm tra ô đã có khóa khác là **một collision**; báo cáo cả khóa không thể chèn.
- Vì `M` là số nguyên tố >7, mọi bước `h₂∈{1,…,7}` nguyên tố cùng nhau với `M`; Double Hashing duyệt hết M ô. Quadratic với `i²` **không** luôn đi qua mọi ô.
- Các số liệu trong mô phỏng là **đếm phép thăm dò**, không phải benchmark CPU hoặc phép đo cache miss. So sánh thời gian thực thi cần benchmark độc lập.
- Các công thức kỳ vọng Linear Probing cần giả định uniform hashing và chỉ áp dụng cho `0≤α<1`; không dùng chúng như dự báo đúng cho các bộ dữ liệu cố tình gây collision.

## Tài liệu

- Robert Sedgewick, Kevin Wayne, *Algorithms, Fourth Edition*, mục 3.4 *Hash Tables*, **slide 25–35, 42–43** (tài liệu Princeton do người học cung cấp): https://algs4.cs.princeton.edu/34hash/
- OpenDSA, *Improved Collision Resolution* (Quadratic và Double Hashing): https://opendsa.cs.vt.edu/ODSA/StandaloneModules/20260527004920/html/HashCImproved.html
- Aalto University, *Hashing and hash tables*: https://tarjotin.cs.aalto.fi/CS-A1140/2022/notes/hashing-tables.html
- MIT OpenCourseWare 6.006, *Open Addressing*: https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-fall-2011/a7f609148928e4a10653d3f3be03a2b5_MIT6_006F11_lec10.pdf

**Phạm vi nguồn:** slide Princeton phân tích chủ yếu Linear Probing; Quadratic và Double Hashing được bổ sung từ OpenDSA, Aalto và MIT, không gán nhầm cho Princeton.

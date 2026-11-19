# Linear, Quadratic và Double Hashing

Khi hai khóa cùng băm về một ô, bảng cần tìm chỗ lưu cho khóa đến sau. Linear Probing thử lần lượt các ô tiếp theo; Quadratic Probing tính vị trí từ bình phương số lần thăm dò; còn Double Hashing dùng một hàm băm thứ hai để xác định bước nhảy. Bài viết so sánh ba cách xử lý va chạm này bằng mã Java, mô phỏng từng bước và số lần kiểm tra ô.

**[Đọc bài viết và chạy mô phỏng](https://kieran-lucas.github.io/hash-table-probing-strategies/)**

## Ví dụ

Dãy mặc định gồm tám khóa `17, 34, 51, 68, 85, 102, 119, 136` được chèn vào bảng có `M = 17`. Cả tám khóa đều băm về ô 0. Kết quả:

| Phương pháp | Số lần thăm dò | Khóa chèn thành công |
| --- | ---: | ---: |
| Linear Probing | 36 | 8 |
| Quadratic Probing (`i²`) | 36 | 8 |
| Double Hashing | 15 | 8 |

Linear lấp các ô liên tiếp từ 0 đến 7. Quadratic phân tán khóa sang nhiều ô khác nhau nhưng vẫn thử lại cùng một dãy vì các khóa có cùng vị trí băm ban đầu. Với Double Hashing, bước nhảy thay đổi theo khóa nên nhiều lần va chạm được tránh ngay từ lượt thử thứ hai.

Mô phỏng cho phép phát, tạm dừng, tua theo từng bước và thay đổi dữ liệu. Bảng thống kê hiển thị số probe, số va chạm và các lần chèn thất bại. Bạn cũng có thể tìm kiếm một khóa hoặc thay đổi hệ số tải để khảo sát công thức kỳ vọng của Linear Probing.

## Chạy và kiểm thử

Website sử dụng HTML, CSS và JavaScript thuần. Mở `index.html` trong trình duyệt hoặc dùng một máy chủ tĩnh.

```bash
node --test tests/probing.test.cjs
javac src/ProbingStrategies.java
java -cp src ProbingStrategies
```

`engine.js` xử lý thuật toán và lưu các bước thăm dò, `app.js` điều khiển giao diện, còn `src/ProbingStrategies.java` cung cấp phần cài đặt Java. GitHub Actions chạy kiểm thử Node.js và kiểm tra mã Java sau mỗi lần push.

## Quy ước mô phỏng

Bảng có kích thước nguyên tố `M ∈ {11, 13, 17, 19, 23, 29, 31}`. Các hàm băm được chọn là `h₁(k) = k mod M` và `h₂(k) = 7 − (k mod 7)`. Tùy phương pháp, độ dịch chuyển ở lượt thứ `i` là `i`, `i²` hoặc `i·h₂(k)`.

Một **probe** được tính mỗi khi kiểm tra một ô; **collision** xảy ra khi ô đó đã có khóa khác. Mô phỏng dùng các khóa nguyên phân biệt, không thay đổi kích thước bảng trong lúc chèn. Các số liệu là số lần kiểm tra ô, còn thời gian chạy thực tế phụ thuộc thêm vào chi phí tính toán và truy cập bộ nhớ.

## Tài liệu tham khảo

- Robert Sedgewick & Kevin Wayne, *Algorithms, 4th Edition*, **3.4 Hash Tables**, slide 25–35 và 42–43: https://algs4.cs.princeton.edu/34hash/
- OpenDSA, *Improved Collision Resolution*: https://opendsa.cs.vt.edu/ODSA/StandaloneModules/20260527004920/html/HashCImproved.html
- Aalto University, *Hashing and hash tables*: https://tarjotin.cs.aalto.fi/CS-A1140/2022/notes/hashing-tables.html
- MIT OpenCourseWare 6.006, *Open Addressing*: https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-fall-2011/a7f609148928e4a10653d3f3be03a2b5_MIT6_006F11_lec10.pdf

Giáo trình Princeton là nguồn chính cho phần Linear Probing và phân tích hệ số tải. Quadratic Probing và các điều kiện của Double Hashing được bổ sung từ những tài liệu thuật toán còn lại.

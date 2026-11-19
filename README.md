# Linear, Quadratic và Double Hashing

Một lần va chạm trong bảng băm có thể dẫn đến nhiều lần kiểm tra ô trước khi tìm được chỗ trống. Với **Linear Probing**, ta thử các ô liền nhau. **Quadratic Probing** thay đổi độ dịch chuyển theo bình phương số lần thăm dò, còn **Double Hashing** tính bước nhảy bằng một hàm băm thứ hai. Cách đi qua các ô quyết định số probe, hiện tượng clustering và cả khả năng tận dụng cache.

Bài viết dùng các ví dụ có thể chạy từng bước để trả lời câu hỏi: **khi nào nên chọn từng phương pháp và phải đánh đổi điều gì?**

**[Đọc bài viết và chạy mô phỏng](https://kieran-lucas.github.io/hash-table-probing-strategies/)**

## Xem hai ví dụ

Chèn dãy `17, 34, 51, 68, 85, 102, 119, 136` vào bảng có `M = 17` và `h(k) = k mod 17`. Cả tám khóa đều băm về ô 0. Linear và Quadratic phải thử lại nhiều ô đã có phần tử, trong khi Double Hashing cho các khóa đi theo những dãy khác nhau.

| Phương pháp | Tổng probe | Khóa chèn thành công |
| --- | ---: | ---: |
| Linear Probing | 36 | 8 |
| Quadratic Probing (`i²`) | 36 | 8 |
| Double Hashing | 15 | 8 |

Thử tiếp bộ dữ liệu `1, 4, 18, 0, 6, 9, 12, 15`, cũng trên bảng 17 ô. Lúc chèn khóa `18`, Linear thử ô 1 đã có khóa rồi tới ô 2 còn trống. Double Hashing nhảy từ ô 1 sang ô 4 đang bận, sau đó mới tới ô 7. Tổng cộng Linear và Quadratic cần **9 probe**, còn Double cần **10**. Lợi thế về số probe phụ thuộc vào chính dữ liệu được chèn.

Mô phỏng có Play/Pause, tiến/lùi và thanh tua. Các bảng chạy đồng bộ theo khóa, hiển thị vị trí đang thử, va chạm và trạng thái sau khi chèn. Bên dưới là thống kê số probe, số collision, lượt chèn thành công/thất bại và phần thử tìm kiếm.

## Đọc theo thứ tự

Bài gồm năm phần: cơ chế thăm dò và mã Java; clustering cùng hệ số tải; mô phỏng; đánh đổi giữa số probe và chi phí bộ nhớ; cuối cùng là điều kiện nên chọn Linear, Quadratic hay Double Hashing.

## Chạy tại máy

Website sử dụng HTML, CSS và JavaScript thuần. Có thể mở trực tiếp `index.html` trong trình duyệt.

```bash
node --test tests/probing.test.cjs
javac src/ProbingStrategies.java
java -cp src ProbingStrategies
```

Lõi mô phỏng nằm trong `engine.js`, giao diện và animation trong `app.js`, còn `src/ProbingStrategies.java` là bản cài đặt Java. Các bài kiểm thử Node.js và Java chạy tự động qua GitHub Actions.

## Quy ước phép thử

Bảng có kích thước nguyên tố `M ∈ {11, 13, 17, 19, 23, 29, 31}`. Hàm băm chính là `h₁(k) = k mod M`; Double Hashing dùng `h₂(k) = 7 − (k mod 7)`. Quadratic sử dụng công thức `h₁(k) + i²` lấy modulo `M`, nên có thể chỉ thử được một phần các ô của bảng.

Mỗi lần kiểm tra một ô được tính là một **probe**; gặp ô đã có khóa khác được tính là một **collision**. Dãy đầu vào gồm các khóa nguyên phân biệt và kích thước bảng được giữ cố định trong mỗi lượt chạy. Mô phỏng đo số lần thăm dò; để so sánh thời gian chạy thực tế còn cần đo tốc độ truy cập bộ nhớ và chi phí tính toán.

## Tài liệu tham khảo

- Sedgewick & Wayne, *Algorithms, 4th Edition*, mục **3.4 Hash Tables**: https://algs4.cs.princeton.edu/34hash/
- OpenDSA, *Improved Collision Resolution*: https://opendsa.org/OpenDSA/Books/CS3/html/HashCImproved.html
- Aalto University, *Hashing and hash tables*: https://tarjotin.cs.aalto.fi/CS-A1140/2022/notes/hashing-tables.html
- MIT OpenCourseWare 6.006, *Open Addressing*: https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-fall-2011/a7f609148928e4a10653d3f3be03a2b5_MIT6_006F11_lec10.pdf

# Linear, Quadratic và Double Hashing

Ba cách thăm dò phổ biến trong bảng băm có những điểm mạnh khác nhau. Linear Probing đọc các ô liên tiếp, dễ cài đặt và tận dụng cache tốt. Quadratic Probing giảm các cụm ô liền nhau. Double Hashing dùng thêm một hàm băm để các khóa cùng vị trí ban đầu có thể dò theo những dãy khác nhau.

Bài viết phân tích khi nào nên dùng mỗi cách, giải thích các yếu tố gây clustering và so sánh kết quả trên cùng dữ liệu đầu vào.

**[Đọc bài viết và chạy mô phỏng](https://kieran-lucas.github.io/hash-table-probing-strategies/)**

## Nội dung

Bài viết có năm phần: cơ chế thăm dò, clustering và hệ số tải, mô phỏng chèn khóa, đánh đổi về số probe và truy cập bộ nhớ, cuối cùng là cách chọn phương pháp.

Mô phỏng cho phép phát từng bước, thay đổi khóa, xem số probe/collision và thử tìm kiếm. Dữ liệu mặc định là tám khóa cùng băm về ô 0 trong bảng 17 ô:

| Phương pháp | Probe | Khóa chèn được |
| --- | ---: | ---: |
| Linear Probing | 36 | 8 |
| Quadratic Probing (`i²`) | 36 | 8 |
| Double Hashing | 15 | 8 |

Có thêm mẫu `1, 4, 18, 0, 6, 9, 12, 15` (cũng trên bảng 17 ô). Trong mẫu này, Linear và Quadratic dùng 9 probe, Double dùng 10. Hai phép thử cho thấy kết quả phụ thuộc đáng kể vào cách các khóa phân bố trong bảng.

## Chạy và kiểm thử

Website dùng HTML, CSS và JavaScript thuần. Mở `index.html` trong trình duyệt hoặc sử dụng máy chủ tĩnh.

```bash
node --test tests/probing.test.cjs
javac src/ProbingStrategies.java
java -cp src ProbingStrategies
```

`engine.js` cài đặt các dãy thăm dò và ghi lại trạng thái bảng, `app.js` điều khiển mô phỏng, `src/ProbingStrategies.java` là bản Java. GitHub Actions kiểm thử lõi JavaScript và Java sau mỗi lần push.

## Quy ước

Bảng sử dụng kích thước nguyên tố `M ∈ {11, 13, 17, 19, 23, 29, 31}`. Hàm băm chính là `h₁(k) = k mod M`; bước nhảy của Double Hashing là `h₂(k) = 7 − (k mod 7)`. Quadratic dùng biến thể `i²`, nên chỉ thăm dò được một phần các ô trong bảng có kích thước nguyên tố lẻ.

Một **probe** là một lần kiểm tra ô; một **collision** xảy ra nếu ô đã chứa khóa khác. Đầu vào gồm các khóa nguyên phân biệt. Bảng giữ nguyên kích thước trong suốt lần chạy. Số probe cho biết thuật toán kiểm tra bao nhiêu ô, còn tốc độ thực thi phụ thuộc cả cách truy cập bộ nhớ và phần cứng.

## Nguồn tham khảo

- Sedgewick & Wayne, *Algorithms, 4th Edition*, mục **3.4 Hash Tables**: https://algs4.cs.princeton.edu/34hash/
- OpenDSA, *Improved Collision Resolution*: https://opendsa.org/OpenDSA/Books/CS3/html/HashCImproved.html
- Aalto University, *Hashing and hash tables*: https://tarjotin.cs.aalto.fi/CS-A1140/2022/notes/hashing-tables.html
- MIT OpenCourseWare 6.006, *Open Addressing*: https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-fall-2011/a7f609148928e4a10653d3f3be03a2b5_MIT6_006F11_lec10.pdf

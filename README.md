# Linear, Quadratic và Double Hashing

Khi hai khóa cùng băm vào một ô, ta sẽ đưa khóa đến đâu? **Linear Probing** thử các ô kế tiếp, **Quadratic Probing** trải rộng các vị trí theo độ dịch chuyển bình phương, còn **Double Hashing** dùng một hàm băm phụ để xác định bước nhảy. Ba cách tiếp cận này cùng giải quyết va chạm, nhưng khác nhau ở clustering, số lần thăm dò và đặc tính truy cập bộ nhớ.

Repository là một **bài tech blog tương tác bằng tiếng Việt**, xây dựng theo phong cách tối giản của dự án [quicksort-pivot-selection](https://github.com/kieran-lucas/quicksort-pivot-selection). Bài viết nối tiếp từ ví dụ va chạm, phân tích công thức, mô phỏng từng bước và cuối cùng trả lời câu hỏi: *Khi nào nên chọn cách nào, và phải đánh đổi những gì?*

**[Đọc bài viết và chạy mô phỏng](https://kieran-lucas.github.io/hash-table-probing-strategies/)**

## Thử ngay một ví dụ

Chèn lần lượt `17, 34, 51, 68, 85, 102, 119, 136` vào bảng có `M = 17`. Tất cả khóa cùng có vị trí băm ban đầu là 0. Nếu chạy cùng bộ dữ liệu trên cả ba chiến lược, số lượt thăm dò sẽ là:

| Chiến lược | Tổng số probe | Chèn thành công |
| --- | ---: | ---: |
| Linear Probing | 36 | 8 |
| Quadratic Probing (`i²`) | 36 | 8 |
| Double Hashing | 15 | 8 |

Đáng chú ý, Quadratic trải các phần tử ra các ô khác nhau nhưng vẫn cần từng ấy lượt thăm dò, vì mọi khóa cùng băm về 0 đều đi theo chung một dãy. Double Hashing tách dãy thăm dò nhờ bước nhảy phụ thuộc vào khóa. Đây là ví dụ có chủ đích để nhìn rõ sự khác biệt về cơ chế; bạn có thể chuyển sang các bộ dữ liệu hỗn hợp, phân phối đều hoặc tình huống Quadratic gặp giới hạn bao phủ.

Animation hiển thị ba bảng song song, cho phép phát/tạm dừng, tua, đi từng bước và điều chỉnh tốc độ. Bên dưới là bảng thống kê số lượt thăm dò, số va chạm, thao tác chèn và mục thử tìm kiếm. Thanh hệ số tải giúp khảo sát các công thức kỳ vọng Linear Probing của Sedgewick–Wayne.

## Chạy cục bộ và kiểm thử

Website dùng HTML, CSS và JavaScript thuần. Mở `index.html` trực tiếp hoặc chạy một static server bất kỳ.

```bash
node --test tests/probing.test.cjs
javac src/ProbingStrategies.java
java -cp src ProbingStrategies
```

Lõi tính toán nằm ở `engine.js`; `app.js` điều khiển giao diện và animation; `src/ProbingStrategies.java` cài đặt ba chiến lược tương ứng. Workflow GitHub Actions chạy kiểm thử Node.js và biên dịch/chạy Java ở mỗi lần push.

## Quy ước thực nghiệm

Bảng mô phỏng sử dụng kích thước nguyên tố `M ∈ {11, 13, 17, 19, 23, 29, 31}`, với `h₁(k) = k mod M` và `h₂(k) = 7 − (k mod 7)`. Dãy vị trí lần lượt tuân theo `h₁+i`, `h₁+i²`, hoặc `h₁+i·h₂`, rồi lấy modulo `M`. Công thức Quadratic đang dùng là biến thể `i²`; các biến thể khác có thể có tính chất bao phủ khác.

Mỗi khóa là một số nguyên phân biệt. Một **probe** là một ô đã được kiểm tra; một **collision** xảy ra khi ô đó chứa khóa khác. Mô phỏng giữ nguyên kích thước bảng khi chèn để nhìn rõ ảnh hưởng của lựa chọn dãy thăm dò. Các con số so sánh ở đây là số lượt kiểm tra ô; đánh giá thời gian CPU và cache locality là một phép đo khác, phụ thuộc cả phần cứng và cách cài đặt.

## Tài liệu tham khảo

- Robert Sedgewick & Kevin Wayne, *Algorithms, 4th Edition*, **3.4 Hash Tables**, slide 25–35 và 42–43: https://algs4.cs.princeton.edu/34hash/
- OpenDSA, *Improved Collision Resolution*: https://opendsa.cs.vt.edu/ODSA/StandaloneModules/20260527004920/html/HashCImproved.html
- Aalto University, *Hashing and hash tables*: https://tarjotin.cs.aalto.fi/CS-A1140/2022/notes/hashing-tables.html
- MIT OpenCourseWare 6.006, *Open Addressing*: https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-fall-2011/a7f609148928e4a10653d3f3be03a2b5_MIT6_006F11_lec10.pdf

Giáo trình Princeton là nguồn chính cho phần Linear Probing và phân tích hệ số tải. Quadratic Probing và các điều kiện của Double Hashing được bổ sung từ những tài liệu thuật toán còn lại.

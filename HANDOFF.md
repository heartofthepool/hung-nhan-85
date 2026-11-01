# BÀN GIAO DỰ ÁN — Web app gọi món bằng giọng nói "Bún cá cay Hùng Nhàn 85"

> File này dùng để tiếp tục làm việc ở đoạn chat mới. Hãy gửi kèm file này (hoặc bảo Claude clone repo `heartofthepool/hung-nhan-85` và đọc `HANDOFF.md`).
> Cập nhật: 01/11/2026 · Phiên bản app: **01/11 22:45** (hiện ở dòng chữ nhỏ dưới màn hình chính).

---

## 1. Tổng quan

- **Chủ dự án:** Tuấn Anh (GitHub `heartofthepool`). Xưng hô: gọi là "bro", tự xưng "tôi", nói tiếng Việt.
- **Quán:** Bún cá cay **Hùng Nhàn 85** (trước đây spec ghi "Cậu Đoành" — đã đổi hết). Có 2 cơ sở:
  - **CS1: 55B Phan Đăng Lưu**
  - **CS2: 59 Trần Nhân Tông**
- **Mục tiêu:** nhân viên nói vào iPad để lên đơn ("Bếp ơi hai bún cá rô…"), bếp xem đơn theo thứ tự trên màn hình 2 cột, nhiều iPad đồng bộ realtime, chủ quán xem báo cáo từ xa trên iPhone.
- **Spec gốc:** file `App_order_tu_dong_v4.docx` (đã có ở chat cũ). App hiện tại đã vượt spec ở nhiều điểm theo yêu cầu bổ sung liên tục — **file này là nguồn đúng nhất**.

## 2. Đường dẫn quan trọng

| Thứ | Ở đâu |
|---|---|
| App chạy thật (HTTPS) | **https://heartofthepool.github.io/hung-nhan-85/** |
| Repo | https://github.com/heartofthepool/hung-nhan-85 (public, nhánh `main`, GitHub Pages từ `main` / root) |
| Firebase project | `hungnhan85-bd9ca` (Firestore + Authentication Email/Password, gói Spark miễn phí) |
| Bản xem trước trên claude.ai | artifact "Hùng Nhàn 85 · Gọi món giọng nói" — **không có mic** (khung xem chặn micro), chỉ để xem giao diện |

**Đẩy code lên GitHub:** Claude GitHub App đã được cài cho repo này → trong chat mới gọi `add_repo` (owner `heartofthepool`, repo `hung-nhan-85`, access `push`), clone rồi `git push` bình thường. GitHub API bật Pages bị proxy chặn — Pages đã bật sẵn, không cần làm lại.

## 3. Cấu trúc repo

```
index.html                 ← TOÀN BỘ app (1 file, ~2200 dòng: HTML + CSS + JS thuần ES5/ES2015, không build)
vosk.js                    ← thư viện vosk-browser (Apache 2.0) — nhận diện offline
vosk-vn-lite-0.3.tar.gz    ← gói tiếng Việt bản nhẹ 18MB (Gr.fst thay bằng FST rỗng giữ bảng từ) — MẶC ĐỊNH
vosk-vn-small-0.3.tar.gz   ← gói tiếng Việt đầy đủ 33MB (vosk-model-small-vn-0.3, đã bỏ file rác ._*)
firestore.rules            ← quy tắc bảo mật (đã dán vào Firebase): chỉ user đăng nhập mới đọc/ghi orders/* và config/*
THIRD_PARTY.md, LICENSE-vosk-model.txt
dev-tests/                 ← script test Playwright (chạy: cd dev-tests && node <file>.test.js)
  mockfb.js                ← Firebase giả lập (compat API) để test đồng bộ 2 iPad không cần mạng
  *.test.js                ← test parser, giá, bàn, đoàn, thập cẩm, bún-vs-4, hiệu ứng/khóa, đồng bộ
HANDOFF.md                 ← file này
```

> Môi trường sandbox của Claude **không truy cập được** gstatic/firestore/npm/pypi — chỉ GitHub (qua git proxy). Vì vậy test Firebase luôn dùng `mockfb.js`. Khi test local, app dùng cấu hình Firebase nhúng sẵn và tự rơi về chế độ "dữ liệu trên máy" sau khi tải SDK thất bại (có toast đỏ "Không tải được Firebase" — chỉ xuất hiện trong sandbox).

## 4. Kiến trúc trong `index.html`

Các khối chính (tìm theo comment `/* ====`):

1. **utils** (`norm`, `stripD`, `ymd`, `money`, `kmoney`…).
2. **DEFAULT_MENU / defaults()** — menu, lịch đặc biệt mẫu, settings, chi nhánh.
3. **DB** (load/save localStorage) + **migration** khi load (đổi tên Cậu Đoành→Hùng Nhàn 85, thêm `short`, thêm nước lọc, chả tròn/dài, wake word "chị nghĩa ơi", món thập cẩm…). Các hàm `ensureWake()` / `ensureMenu()` chạy cả khi nhận config từ Firebase, có cờ `wakeAdded2`, `tcAdded` để không thêm lại nếu chủ quán đã xoá.
4. **FB (Firebase sync)** — xem mục 6.
5. **Bộ hiểu đơn (parser)** — `KWS` từ khoá, `FIX` sửa nghe nhầm, `fixThapCam`, `parseNum` (có hàng trăm), `buildVocab`, `tokenize`, `parseItems`, `editOrder/doAdd/doRemove/doReplace`, `extractTime`, `extractGroup`, `extractTable`, `analyse`, `handleUtterance`, `createOrder`, `confirmBig`.
6. **Âm thanh** `beep(ok)` ("ting"/"tè").
7. **Giọng nói**: `V` = Web Speech API (vi-VN, continuous, 5 alternatives); `VK` = Vosk offline. Lúc boot: `if(voiceEngine()==='vosk') V=VK;`.
8. **Sales UI**: `renderSales`, `cardHTML/groupHTML/servedHTML/detailHTML`, hiệu ứng `snapCards/animateCards/ghost`, `markOk`, `undo`, `autoHide`, `hiddenDialog` (Lịch sử hôm nay), nút giữ để nói (`holdStart/endHold`, có fallback touch cho iOS 12).
9. **Admin UI**: `admOverview`, `admReport`, `admMenu`, `admSpecial`, `admSettings`, `admTrash`, CSV, sao lưu.
10. **Boot**: `DB.load(); buildVocab(); markPhone(); FB.boot() / afterReady()`.

CSS: phần chính ở đầu `<style>`; **các khối override quan trọng nằm cuối `<style>`** (kích thước nút `--bw/--bf`, tông màu thẻ, ô mic hiện kết quả, chi tiết khi chạm, cuộn nảy, báo cáo hôm nay).

## 5. Quy tắc hiểu câu nói (đã chốt với chủ quán)

**Từ kích hoạt** (Cài đặt, cách nhau dấu phẩy): `ơi bếp, bếp ơi, chị nghĩa ơi`. So khớp mờ (bếp/bết/bép, ơi/hơi/ời…), ở bất kỳ đâu trong câu. Chỉ nghe được chữ "bếp/nghĩa" ở đầu câu → chỉ lên đơn nếu khớp menu, không thì im lặng. Nút **GIỮ ĐỂ NÓI** không cần từ kích hoạt.

| Quy tắc | Ví dụ → kết quả |
|---|---|
| Mặc định **bún** nếu không nói | "1 tô cá rô" → 1 Cá rô (bún) |
| Bánh đa | "hai bánh đa cá bống", "bánh đa thay bún" |
| **Topping sau tên món, không có "thêm" = trộn trong bát (không tính tiền)** | "cá rô chả tròn" → Cá rô + CHẢ TRÒN |
| Có số/“bát” trước topping = **bát riêng** (giá bát tự chọn 35k) | "một bát cá rô và một bát chả" → 2 bát |
| "thêm X" = **tính tiền topping** | "một cá rô thêm chả tròn" → 45k |
| Không/ít/nhiều/bỏ | "không hành", "ít bún", "nhiều rau" |
| Chia bát | "hai bún cá rô, một bát không hành" → 1 thường + 1 không hành |
| Mang đi | "mang đi / mang về / gói" |
| Số đếm có hàng trăm | "một trăm hai mươi", "hai trăm linh năm" |
| **4/bốn đứng sát trước tên món = "bún"** (Safari nghe "bún" thành "bốn") | "4 thập cẩm" → 1; "cho 4 bát 4 thập cẩm" → 4; "bốn bát/bốn tô/bốn bún…" → 4; "4 đặc biệt bánh đa" → 4 |
| **"10 cẩm" = thập cẩm** (Safari đổi "thập" thành 10) | "bún 10 cẩm", "10cẩm", "10 câm", "mười khẩm", "tập cẩm"… |
| **Giá riêng khi nói giá** (giá mỗi bát) | "1 bún thập cẩm 40k", "40 nghìn", "40.000đ", "giá 50 ngàn" → nhãn GIÁ 40K |
| **Giờ** | "lúc bảy giờ rưỡi", "7 giờ 30", "8h", "chín giờ mười lăm phút", "mười giờ kém mười lăm". Lưu ý "bảy giờ hai mươi cá rô" = 7:00 + 20 bát (muốn 7:20 thì thêm "phút") |
| **Số bàn** | "bàn 5", "bàn số 12", "bàn năm" → nhãn BÀN dưới thẻ |
| **Đoàn**: câu có "đoàn / tập thể / khách đoàn / đoàn khách / tour" | "chiều nay có đoàn 50 người" → thanh ĐOÀN 50 (không hỏi lại; >300 bát mới coi là nhầm) |
| Đơn **11–60 bát** (không nói "đoàn") | hỏi "Có chắc bạn order xx bát không?" → đồng ý = đơn đoàn |
| Đơn **>60 bát** | coi là nói nhầm, không lên đơn |
| Chống trùng | Safari gửi lặp câu (nháp + chốt, cộng dồn) → gộp; cùng câu trong 5s ở chế độ nghe liên tục bị bỏ (PTT thì không chặn) |
| Sửa đơn (giữ nút SỬA) | "thêm một lon coca", "bỏ hành", "bỏ một cá thu", "sửa cá rô thành cá thu", "sửa thành mang đi", "hủy đơn", "bàn 7" |
| Gọi thêm món nấu cho đơn đang ăn | tạo thanh "GỌI THÊM" ở cột trái; Xong → gộp vào đơn gốc. Đồ uống cộng thẳng |

**Quyết định đã xác nhận:** bát trộn không cộng tiền; bát chả riêng = giá bát tự chọn 35k; giá topping mẫu 10k (chả tròn/chả dài/cá rô), 15k cá thu, 5k thêm bún/bánh đa; nước lọc tạm 10k; giá nói ra là **giá mỗi bát**.

## 6. Firebase / đồng bộ

- Config nhúng trong `index.html` (`FIREBASE_CONFIG`, project `hungnhan85-bd9ca`). Trên domain claude.ai thì tự tắt.
- SDK compat v10.14.1 tải động từ gstatic. Firestore `enablePersistence` (offline).
- Dữ liệu: `orders/{id}` (mỗi đơn 1 doc, toàn bộ object đơn), `config/main` = `{json: <chuỗi JSON menu/specials/branches/pw/settings chung>}`.
- Lắng nghe đơn từ đầu ngày hôm qua; Quản trị tải lịch sử 400 ngày (`FB.loadHistory`), dọn thùng rác >30 ngày.
- Đẩy thay đổi bằng diff JSON (`FB.synced`), xoá hẳn chỉ qua `FB.removeOrders` (dữ liệu mẫu, thùng rác).
- **Đăng nhập tài khoản quán 1 lần**: lưu email/mật khẩu trong localStorage (`hn85_acc`, base64), Safari mất phiên → tự đăng nhập lại ngầm; mất mạng → không chặn bán hàng. Màn đăng nhập chỉ hiện khi đổi mật khẩu hoặc bấm "Ngắt kết nối máy này".
- Bộ nhớ máy chỉ giữ đơn 2 ngày (`hn85_fb_cache_v1`).
- Thiết lập theo máy (không đồng bộ): `deviceBranch`, `kiosk`, `voiceEngine`, `voskFull`, `counter`.
- Mỗi máy bán hàng chỉ thấy đơn của **cơ sở đang chọn** (`brOf(o)===S.deviceBranch`).
- Máy khác làm đơn di chuyển → máy này **khóa bấm Sửa/Xong 1 giây** (`renderCause='remote'`, `setLock`). Cùng máy bấm liên tục thoải mái.

localStorage keys: `caudoanh_order_v1` (chế độ không Firebase), `hn85_fb_cache_v1`, `hn85_acc`, `hn85_auth` (thời điểm nhập đúng mật khẩu Quản trị), `vkCached`.

## 7. Giao diện (đã chốt)

**Màn hình chính** (nền tối): logo vector (trace từ JPG, khói bay/lá rung), 3 ô dọc: **CS1: 55B Phan Đăng Lưu**, **CS2: 59 Trần Nhân Tông**, **Quản Trị**; dòng phiên bản nhỏ ở dưới.

**Bán hàng:**
- Mở app vào thẳng màn bán hàng (nhớ cơ sở). Không còn màn "chạm để bắt đầu"; nếu iOS đòi cử chỉ thì lần chạm đầu tiên sẽ bật mic.
- Đầu trang: ⌂ (về màn chính — **cần mật khẩu Quản trị**), ô **📍 CS1: 55B Phan Đăng Lưu ▾** (bấm để đổi cơ sở: điện thoại không cần mật khẩu, iPad cần), ô mic **● Đang nghe** (kết quả câu vừa nghe hiện trong ô này 10s rồi trở lại), **Báo cáo hôm nay** (chỉ điện thoại; doanh thu ẩn bằng dấu chấm, chạm mới hiện; gọn 1 màn hình), Hoàn tác (điện thoại = ↶).
- iPad: 2 cột **Đang lên đơn 2/3** | **Đang ăn 1/3**. Điện thoại: xếp trên/dưới.
- Thẻ thường: nhãn **BÚN** (đen) / **BÁNH ĐA** (tím) trước tên món; chip ghi chú; nhãn GIÁ, BÀN. Nút SỬA/XONG phủ kín chiều cao thẻ, cùng chiều ngang mọi thẻ (`--bw` iPad 104px, điện thoại 64px), chữ Oswald.
- **Tông màu đậm nhạt**: tại quán = xanh dương (nền nhạt, SỬA xanh nhạt, XONG xanh đậm); mang đi = xanh lá; đoàn = tím; gọi thêm = viền cam.
- Thanh **ĐOÀN 50 · 7:30 · BÀN 3** cao ~1/3 thẻ thường, luôn trên cùng; Xong → hỏi "Đã phục vụ đoàn xong?".
- Cột Đang ăn: thẻ gọn (chỉ "2 Cá rô · 1 Coca — 85.000đ", không bún/bánh đa/ghi chú). Nút **Lịch sử hôm nay (n)** mở danh sách đơn đã xong/hủy trong ngày (có "Đưa lại").
- **Chạm vào thẻ** → mở rộng chi tiết (từng món, bún/bánh đa, ghi chú, tiền từng món, tổng) — 10s tự thu.
- Hiệu ứng: Xong ở cột trái → thẻ bay sang (iPad) / rơi xuống (điện thoại); Xong ở cột phải → thẻ chui lên biến mất, các thẻ dưới trượt lên.
- Danh sách luôn cuộn nảy được (iOS) kể cả khi ít đơn.
- Nút **GIỮ ĐỂ NÓI** chiếm hết đáy; khi giữ, thanh cao lên và chạy chữ theo lời nói (giữ SỬA trên thẻ cũng dùng thanh này). Chạm nhanh → chữ trong nút đổi thành "Giữ nút để nói / Thả tay ra để chốt đơn" 2,6s.
- **Mic:** iPad luôn nghe; điện thoại mặc định tắt ("Bấm để nghe"); ra màn hình chính → tắt mic, iPad quay lại tự nghe.
- **Mật khẩu Quản trị:** iPad nhớ 5 phút, điện thoại nhớ hết ngày. Mặc định `1234`, bắt đổi lần đầu (lưu băm SHA-256 trong config chung).

**Quản trị** (nền tối): đầu trang là địa chỉ cơ sở (bấm để chọn CS1/CS2/Tất cả). Tab: Tổng quan (dạng dòng), Báo cáo (ngày/tháng/năm, xoá ngày/đơn → thùng rác 30 ngày, chế độ demo, CSV), Menu & giá (tên báo cáo + tên hiện trên thẻ, giá, tên gọi khác, nhóm; đồ uống có "loại cụ thể" + "chỉ ghi tên loại"; topping; ô **Thử câu lệnh**), Lịch đặc biệt (+X nghìn, +X%, giá riêng), Cài đặt (tự ẩn 60 phút, từ kích hoạt, chi nhánh + "máy này", mật khẩu, nhận diện giọng nói & gói Vosk, sao lưu/khôi phục, dữ liệu mẫu, ngắt kết nối Firebase), Thùng rác.

## 8. Menu hiện tại

Bát (bún hoặc bánh đa cùng giá): Đặc biệt 55k · Cá thu 45k · Thập cẩm cá thu 45k · Cá rô 35k · Thập cẩm cá rô 35k · Cá bò 35k · Thập cẩm cá bò 35k · Cá bống 35k · Thập cẩm cá bống 35k · **Thập cẩm 35k** (mới) · Tự chọn 35k.
Đồ uống: Trà sâm dứa 5k · Trà tắc 10k · Nước ngọt 15k (coca, pepsi, 7up, sting, fanta, bò húc, mirinda — hiện tên loại) · Nước lọc 10k (tạm) · Bia 15k (hà nội, tiger, sài gòn, heineken, trúc bạch) · Rượu 30k.
Topping (giá mẫu): Chả tròn 10k, Chả dài 10k, Chả 10k, Cá rô 10k, Cá thu 15k, Bún 5k, Bánh đa 5k; miễn phí: hành, rau, ớt, cay, giá, chanh, mắm tôm, nước, dọc mùng, cà chua.

## 9. Thiết bị & giới hạn đã biết

- **Nhận diện của Safari cần iOS/iPadOS 14.5+** và bật *Cài đặt → Cài đặt chung → Bàn phím → Đọc chính tả*; cần mạng.
- **iPad Air 1 (iOS 12.5.8)** của quán không có nhận diện → app tự dùng **Vosk offline**. Đã sửa lỗi `EventTarget` (iOS <14) bằng `patchET()`, thêm thanh tiến trình, gói nhẹ 18MB. **Chưa xác nhận Vosk chạy được trên Air 1** (lần thử trước kẹt ở "Đang nạp gói tiếng Việt"; bản gói nhẹ chưa được thử lại). Đề xuất: Air 1 làm màn hình bếp.
- Khuyến nghị mua máy order: **iPad Gen 9 cũ** (~4–6 triệu, có jack 3.5mm) hoặc **iPad Air 2** (~2 triệu, iPadOS 15.8). Android (Redmi Pad 2 / Galaxy Tab A9+) chưa test.
- Hỏi quyền mic mỗi lần mở: do Safari — chỉnh *aA → Cài đặt trang web → Micrô → Cho phép* (iOS 15+). iOS 12 không tắt được.
- App thêm ra màn hình chính có bộ nhớ riêng → đăng nhập tài khoản quán thêm 1 lần trong app đó.
- GitHub Pages cache ~10 phút → kiểm tra số phiên bản ở màn hình chính; tải lại trang nếu chưa lên.

## 10. Việc còn mở / gợi ý tiếp theo

1. Thử Vosk gói nhẹ trên iPad Air 1 (thời gian nạp, độ chính xác) — nếu không nổi, chốt Air 1 làm màn bếp.
2. Theo dõi các từ Safari hay nghe sai ngoài quán → thêm vào `FIX` / quy tắc như `fixThapCam`, quy tắc 4→bún.
3. Xác nhận giá thật: topping, nước lọc, bát chả/bát tự chọn.
4. Test thật 2 máy cùng lúc phần khóa 1s khi máy khác bấm Xong (đã test bằng giả lập).
5. Giai đoạn 2 theo spec: báo hết món bằng giọng nói, cảnh báo đơn chờ lâu, ảnh khách, camera Hikvision, báo cáo tự gửi mỗi tối, sao lưu NAS.
6. Có thể: tách `index.html` thành nhiều file nếu tiếp tục lớn; thêm service worker để mở offline lần đầu.

## 11. Quy trình làm việc đã dùng

- Sửa `index.html` bằng script Python thay chuỗi có `assert` (đảm bảo chỉ khớp 1 chỗ), test bằng Playwright (Chromium headless) với ảnh chụp giả lập iPad 1024×768 và iPhone 390×844, rồi commit + push. Mỗi lần đổi nên tăng `APP_VER`.
- Commit message kết thúc bằng dòng `Co-Authored-By` theo hướng dẫn hệ thống.
- Chạy test: `cd dev-tests && node sync-2-ipad.test.js` (cần Playwright có sẵn trong môi trường).

# Quy trình xử lý đơn hàng theo từng loại

Tài liệu này mô tả cách nhân viên xử lý bốn loại đơn của hệ thống, chỉ ra những
chỗ code hiện tại chưa đáp ứng, và đưa ra kế hoạch triển khai theo từng giai
đoạn. Toàn bộ việc mua hàng, thanh toán và nhận hàng đều do nhân viên làm tay
trên sàn Trung Quốc; hệ thống chỉ ghi nhận và điều phối.

## 1. Bốn loại đơn khác nhau ở đâu

| Loại | Khách đã làm gì | Nhân viên phải làm gì | Tiền |
| --- | --- | --- | --- |
| `PROXY_PURCHASE` — Mua hộ | Chọn hàng trong catalogue, đặt qua giỏ hàng | Mua thật trên sàn, ghi mã đơn sàn | Đã trừ ví 100% tiền hàng lúc checkout |
| `PROXY_ORDER` — Đặt hàng hộ | Dán link hoặc mô tả sản phẩm, giá chỉ là ước tính | Kiểm hàng, **báo giá**, chờ duyệt, rồi mua | Chưa trừ gì |
| `PROXY_PAYMENT` — Thanh toán hộ | Tự đặt trên sàn, có mã đơn, cần người trả tiền | Đối chiếu mã đơn và số tiền trên sàn, trả tiền cho shop | Chưa trừ gì; phải trả đủ 100% |
| `CONSIGNMENT` — Ký gửi | Tự mua, tự trả, hàng đang chuyển tới kho Trung Quốc | Nhận hàng ở kho TQ, cân đo, báo phí, vận chuyển | Chỉ thu phí vận chuyển |

Khác biệt cốt lõi: **mua hộ và đặt hàng hộ có bước mua; thanh toán hộ có bước trả
tiền nhưng không mua; ký gửi không có cả hai.** Ba loại sau đều bắt đầu ở
`NEW_REQUEST` và cần một bước xác nhận giá trước khi động tới ví khách.

## 2. Luồng trạng thái đề xuất cho từng loại

Ký hiệu `*` là trạng thái cần bổ sung vào enum `OrderStatus`.

### Mua hộ (`PROXY_PURCHASE`)

```
DEPOSIT_PAID → PURCHASED → SHOP_SHIPPED → AT_CN_WAREHOUSE*
             → IN_TRANSIT_TO_VN → AT_VN_WAREHOUSE → PAID
             → DELIVERY_REQUESTED → COMPLETED
```

Khách đã trả tiền hàng khi checkout nên đơn vào thẳng `DEPOSIT_PAID`. Việc đầu
tiên của nhân viên là kiểm tra hàng còn bán và giá không đổi trước khi mua.

### Đặt hàng hộ (`PROXY_ORDER`)

```
NEW_REQUEST → QUOTED* → (khách duyệt) DEPOSIT_PAID → PURCHASED → ... → COMPLETED
```

Giống mua hộ từ `DEPOSIT_PAID` trở đi. Phần thêm là hai bước đầu: nhân viên tra
giá thật trên sàn rồi báo giá, khách bấm duyệt thì mới trừ ví.

### Thanh toán hộ (`PROXY_PAYMENT`)

```
NEW_REQUEST → QUOTED* → (khách duyệt, trừ đủ 100%) PURCHASED
            → SHOP_SHIPPED → AT_CN_WAREHOUSE* → IN_TRANSIT_TO_VN
            → AT_VN_WAREHOUSE → PAID → DELIVERY_REQUESTED → COMPLETED
```

Không có bước mua hàng. Dùng lại `PURCHASED` nhưng đổi nhãn theo loại đơn thành
"Đã thanh toán cho shop", tránh thêm một giá trị enum chỉ để đổi chữ.

### Ký gửi (`CONSIGNMENT`)

```
NEW_REQUEST → AWAITING_CN_ARRIVAL* → AT_CN_WAREHOUSE* → QUOTED*
            → IN_TRANSIT_TO_VN → AT_VN_WAREHOUSE → PAID
            → DELIVERY_REQUESTED → COMPLETED
```

Không mua, không thanh toán hộ. Báo giá diễn ra **sau** khi cân đo tại kho Trung
Quốc, vì trước đó chưa biết khối lượng và kích thước nên chưa tính được cước.

### Trạng thái nhánh

`CANCELLED` và `COMPLAINT` đi được từ bất kỳ trạng thái nào. `CANCELLED` kèm quy
tắc hoàn tiền: hoàn toàn bộ nếu chưa `PURCHASED`, hoàn phần chưa tiêu nếu đã mua.

## 3. Quy tắc tiền theo loại đơn

| Loại | Trừ ví lần 1 | Trừ ví lần 2 |
| --- | --- | --- |
| Mua hộ | Lúc checkout, 100% tiền hàng | Khi về kho VN: cước vận chuyển và phụ phí |
| Đặt hàng hộ | Khi khách duyệt báo giá, 100% tiền hàng báo giá | Khi về kho VN: cước và phụ phí |
| Thanh toán hộ | Khi khách duyệt, 100% số tiền đơn cộng phí dịch vụ | Khi về kho VN: cước và phụ phí |
| Ký gửi | Không có | Khi về kho VN: cước và phụ phí |

Chênh lệch giữa giá báo và giá mua thực tế được xử lý ở bước `purchase`: mua rẻ
hơn thì hoàn phần dư vào ví, đắt hơn thì tạo khoản phải thu và chặn đơn cho tới
khi khách nạp thêm.

## 4. Những chỗ code hiện tại chưa đáp ứng

| Vấn đề | Vị trí | Hệ quả |
| --- | --- | --- |
| Một danh sách trạng thái phẳng cho cả bốn loại | `admin/src/lib/order-status.ts`, `prisma/schema.prisma` | Nhân viên chọn được "Đã mua hàng" cho đơn ký gửi |
| Không kiểm tra chuyển trạng thái | `OrdersService.update` | Nhảy từ `NEW_REQUEST` thẳng sang `COMPLETED` được |
| Không có bước báo giá và duyệt giá | Toàn bộ module orders | Ba loại đơn thủ công không có cách chốt giá với khách |
| `chargeWallet` ghi đè trạng thái đơn | `OrdersService.chargeWallet` | Thu cước cho đơn đang ở kho VN sẽ kéo đơn lùi về `PAID` |
| Không có chỗ ghi mã đơn nhân viên mua được | `Order` | `sourceOrderCode` là mã khách nhập, dùng chung sẽ đè lên nhau |
| Chỉ có một `warehouseId` | `Order` | Không lưu được đồng thời kho Trung Quốc và kho Việt Nam |
| Không có người phụ trách | `Order` | Chỉ biết ai tạo, không biết ai đang xử lý |
| Không có trạng thái từng sản phẩm | `OrderItem` | Một sản phẩm hết hàng làm treo cả đơn |
| Không hiện số tiền còn phải thu | Admin | Nhân viên tự nhẩm tiền hàng trừ đã trả |
| Trang chi tiết đơn không đổi được trạng thái | `admin/src/app/(dashboard)/orders/[id]/page.tsx` | Phải quay ra danh sách mở modal mới đổi được |
| Trang chi tiết đơn chưa theo hệ thiết kế Dock | cùng file trên | Còn dùng `text-primary`, `w-4 h-4`, thiếu `PageHeader` |
| Khách không huỷ được đơn | `customer-orders.controller.ts` | Mọi yêu cầu huỷ phải gọi điện |

## 5. Kế hoạch triển khai

### Giai đoạn 1 — Mô hình luồng, không đụng giao diện

1. Thêm `QUOTED`, `AWAITING_CN_ARRIVAL`, `AT_CN_WAREHOUSE` vào enum `OrderStatus`
   và tạo migration.
2. Tạo `backend/src/modules/orders/order-workflow.ts`:
   - `ORDER_FLOW: Record<OrderType, OrderStatus[]>` — đường đi hợp lệ của từng loại.
   - `allowedNextStatuses(type, status)` — trả về các bước kế tiếp cộng hai nhánh
     `CANCELLED` và `COMPLAINT`.
   - `statusLabel(type, status)` — nhãn theo loại đơn, để `PURCHASED` hiện là
     "Đã thanh toán cho shop" với đơn thanh toán hộ.
3. `OrdersService.update` kiểm tra chuyển trạng thái, báo lỗi rõ ràng khi sai.
4. `chargeWallet` thôi tự đặt `status`; chỉ cập nhật `paymentStatus`,
   `depositAmount` hoặc `walletPaidAmount`.
5. Chép `order-workflow` sang admin và frontend dưới dạng file dùng chung về nhãn
   và thứ tự, giữ đúng một nguồn sự thật.

### Giai đoạn 2 — Trường dữ liệu nhân viên cần

1. `Order.assignedToId`, `Order.assignedAt` — người phụ trách.
2. `Order.purchaseOrderCode` — mã đơn nhân viên mua được trên sàn, tách khỏi
   `sourceOrderCode` của khách.
3. `Order.cnWarehouseId` — kho Trung Quốc; `warehouseId` giữ nghĩa kho Việt Nam.
4. `Order.quotedAt`, `Order.quoteExpiresAt`, `Order.quoteApprovedAt`.
5. `OrderItem.status` với các giá trị `PENDING`, `PURCHASED`, `OUT_OF_STOCK`,
   `PRICE_CHANGED`, `REFUNDED`, kèm `OrderItem.purchasedPriceCny`.
6. Hàm tính `amountDueCny` từ tiền hàng, phí và số đã trả. Không lưu vào bảng.

### Giai đoạn 3 — Một endpoint cho mỗi hành động

Thay vì chỉ có `PATCH /orders/:id` chung chung, mỗi bước nghiệp vụ là một
endpoint riêng, tự kiểm tra trạng thái đầu vào và tự ghi `OrderEvent`.

| Endpoint | Áp dụng cho | Kết quả |
| --- | --- | --- |
| `POST /orders/:id/assign` | mọi loại | gán người phụ trách |
| `POST /orders/:id/quote` | đặt hàng hộ, thanh toán hộ, ký gửi | `QUOTED`, báo khách |
| `POST /customer/orders/:id/approve-quote` | như trên | trừ ví, sang `DEPOSIT_PAID` hoặc `PURCHASED` |
| `POST /customer/orders/:id/cancel` | khi còn `NEW_REQUEST` hoặc `QUOTED` | `CANCELLED` |
| `POST /orders/:id/purchase` | mua hộ, đặt hàng hộ, thanh toán hộ | ghi mã đơn sàn, cập nhật từng sản phẩm, sang `PURCHASED` |
| `POST /orders/:id/cn-receive` | mọi loại | nhập khối lượng và kích thước, tính cước theo `ShippingRate`, sang `AT_CN_WAREHOUSE` |
| `POST /orders/:id/depart` | mọi loại | `IN_TRANSIT_TO_VN` |
| `POST /orders/:id/vn-receive` | mọi loại | `AT_VN_WAREHOUSE`, chốt số tiền còn phải thu, báo khách |
| `POST /orders/:id/settle` | mọi loại | trừ ví phần còn lại, sang `PAID` |
| `POST /orders/:id/deliver` | mọi loại | `COMPLETED` |
| `POST /orders/:id/cancel` | mọi loại | `CANCELLED` kèm hoàn tiền theo quy tắc |

### Giai đoạn 4 — Admin

1. Viết lại `orders/[id]/page.tsx` theo hệ thiết kế Dock, dùng `PageHeader` và
   `Modal` như các trang đã chuẩn hoá.
2. Thanh hành động theo ngữ cảnh: chỉ hiện đúng các nút hợp lệ với loại đơn và
   trạng thái hiện tại, lấy từ `allowedNextStatuses`.
3. Bảng sản phẩm cho phép đánh dấu hết hàng hoặc đổi giá từng dòng, giữ nguyên
   nút chép thuộc tính tiếng Trung đã có.
4. Danh sách đơn thêm bộ lọc theo việc cần làm thay vì theo trạng thái thô:
   chờ báo giá, chờ mua, chờ về kho Trung Quốc, chờ xuất, chờ thu tiền, chờ giao.
5. Thẻ "Việc của tôi" lọc theo người phụ trách.

### Giai đoạn 5 — Cổng khách hàng

1. Trang chi tiết đơn hiện bảng báo giá cùng hai nút duyệt và từ chối.
2. Dòng thời gian vẽ theo đúng luồng của loại đơn, không hiện bước không liên quan.
3. Nút huỷ khi đơn còn `NEW_REQUEST` hoặc `QUOTED`.
4. Nhắc nạp thêm tiền khi số dư không đủ để duyệt báo giá.

### Giai đoạn 6 — Thông báo và hạn xử lý

1. Thông báo cho khách khi có báo giá, khi hàng về kho Việt Nam, khi cần trả nốt.
2. Thông báo cho nhân viên khi khách duyệt giá hoặc từ chối.
3. Đánh dấu quá hạn: `NEW_REQUEST` quá bốn giờ chưa báo giá, `QUOTED` quá bốn
   mươi tám giờ chưa duyệt thì tự huỷ và hoàn chỗ giữ.

## 6. Tình trạng triển khai

Cả sáu giai đoạn đã làm xong.

**Backend**

- `src/modules/orders/order-workflow.ts` giữ luồng của từng loại đơn, nhãn theo
  loại, và các hàm kiểm tra chuyển trạng thái.
- `src/modules/orders/order-workflow.service.ts` cài mọi bước nghiệp vụ, mỗi
  bước một phương thức, tự tính tiền còn phải thu.
- `src/modules/orders/order-workflow.controller.ts` và các route mới trong
  `customer-orders.controller.ts` mở các endpoint tương ứng.
- `src/modules/orders/order-sla.service.ts` chạy mỗi 30 phút: huỷ đơn có báo giá
  hết hạn và hoàn tiền, nhắc nhân viên những yêu cầu chờ báo giá quá bốn giờ.
- Migration `20260913135338_order_workflow_steps` thêm ba trạng thái đơn, trạng
  thái từng dòng hàng, người phụ trách, kho Trung Quốc và các mốc báo giá.

**Admin**

- `src/lib/order-workflow.ts` ánh xạ câu trả lời của server thành nút bấm và
  thành các hàng đợi công việc.
- `src/components/orders/workflow/` gồm thanh hành động theo ngữ cảnh, sheet cho
  từng bước, bảng công nợ, bảng sản phẩm sửa được theo dòng, và tiến trình.
- Trang chi tiết đơn viết lại theo hệ thiết kế Dock.
- Danh sách đơn lọc theo việc cần làm và theo người phụ trách, đánh dấu đơn quá
  hạn báo giá.

**Cổng khách hàng**

- `src/components/portal/orders/QuotePanel.tsx` hiện báo giá cùng nút duyệt và
  từ chối, nhắc nạp thêm khi ví không đủ.
- `src/components/portal/orders/OrderProgress.tsx` vẽ đúng luồng của loại đơn.
- Trang chi tiết đơn cho phép khách tự huỷ khi đơn chưa được xử lý.

## 7. Thứ tự làm

Giai đoạn 1 và 2 là nền, phải xong trước. Giai đoạn 3 làm theo nhóm: báo giá và
duyệt giá trước, vì đó là chỗ ba loại đơn thủ công đang tắc; sau đó tới nhóm kho
và thu tiền. Giai đoạn 4 và 5 đi kèm ngay sau nhóm endpoint tương ứng để mỗi
nhóm đều dùng được thật. Giai đoạn 6 làm cuối.

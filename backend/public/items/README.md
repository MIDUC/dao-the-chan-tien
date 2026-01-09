# Item Images Folder

## Cách sử dụng

1. **Đặt ảnh vào folder này**: `backend/public/items/`
2. **Đặt tên file**: Sử dụng format `item_{id}.{ext}` hoặc tên tùy chỉnh
   - Ví dụ: `item_1.png`, `item_2.jpg`, `sword_legendary.png`
3. **Cập nhật database**: Set field `icon_url` trong bảng `items` thành tên file
   - Ví dụ: Nếu file là `item_1.png`, set `icon_url = 'item_1.png'`

## Định dạng hỗ trợ

- PNG (.png)
- JPEG (.jpg, .jpeg)
- WebP (.webp)
- SVG (.svg)
- GIF (.gif)

## URL truy cập

Sau khi đặt ảnh và cập nhật database, ảnh sẽ được truy cập qua:
```
http://localhost:3000/public/items/{icon_url}
```

## Ví dụ

- File: `backend/public/items/sword_legendary.png`
- Database: `icon_url = 'sword_legendary.png'`
- URL: `http://localhost:3000/public/items/sword_legendary.png`


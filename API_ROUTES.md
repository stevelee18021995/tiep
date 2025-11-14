# API Routes Documentation

Hệ thống API Proxy này được tạo để bảo mật và kiểm soát các cuộc gọi đến Laravel backend.

## Tính năng chính

✅ **Bảo mật endpoints**: Ẩn Laravel API URL thực tế  
✅ **Rate limiting**: Giới hạn số request per minute  
✅ **Input validation**: Kiểm tra và làm sạch dữ liệu đầu vào  
✅ **Authentication check**: Xác thực JWT token  
✅ **CORS handling**: Xử lý Cross-Origin requests  
✅ **Logging**: Ghi log requests trong development  
✅ **Error handling**: Xử lý lỗi và trả về responses nhất quán  

## Endpoints

### Authentication

#### POST /api/auth/login
- **Rate limit**: 10 requests/minute
- **Required fields**: `email`, `password`
- **Validation**: Email format, required fields
- **Response**: User data + JWT token

```json
{
  "user": { "id": 1, "name": "John Doe", "email": "john@example.com" },
  "access_token": "jwt_token_here"
}
```

#### POST /api/auth/register  
- **Rate limit**: 5 requests/minute
- **Required fields**: `name`, `email`, `password`, `password_confirmation`
- **Validation**: Email format, password length (min 8), password confirmation match
- **Response**: User data + JWT token

#### POST /api/auth/logout
- **Auth required**: Yes
- **Response**: Success message

#### GET /api/auth/me
- **Auth required**: Yes
- **Response**: Current user data

### Categories

#### GET /api/categories
- **Auth required**: Yes
- **Response**: List of all categories

#### POST /api/categories
- **Auth required**: Yes
- **Required fields**: `name`
- **Validation**: Name length (2-100 chars)
- **Response**: Created category

#### GET /api/categories/[id]
- **Auth required**: Yes
- **Validation**: Valid numeric ID
- **Response**: Single category

#### PUT /api/categories/[id]
- **Auth required**: Yes
- **Required fields**: `name`
- **Validation**: Valid ID, name length (2-100 chars)
- **Response**: Updated category

#### DELETE /api/categories/[id]
- **Auth required**: Yes
- **Validation**: Valid numeric ID
- **Response**: Delete confirmation

### Object Categories

#### GET /api/object-categories
- **Auth required**: Yes
- **Response**: List of all object categories

#### POST /api/object-categories
- **Auth required**: Yes
- **Required fields**: `name`, `category_id`
- **Validation**: Name length (2-100 chars), valid category_id
- **Response**: Created object category

#### GET /api/object-categories/[id]
- **Auth required**: Yes
- **Validation**: Valid numeric ID
- **Response**: Single object category

#### PUT /api/object-categories/[id]
- **Auth required**: Yes
- **Required fields**: `name`, `category_id`
- **Validation**: Valid ID, name length, valid category_id
- **Response**: Updated object category

#### DELETE /api/object-categories/[id]
- **Auth required**: Yes
- **Validation**: Valid numeric ID
- **Response**: Delete confirmation

### Users (Admin only)

#### GET /api/users
- **Auth required**: Yes (Admin)
- **Response**: List of all users

## Configuration

### Environment Variables

```bash
# Frontend (public)
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_WEBSOCKET_URL=ws://localhost:3000/api/ws

# Backend (private - chỉ server Next.js biết)
LARAVEL_API_URL=http://localhost:8000/api
```

### Security Features

1. **Input Sanitization**: Loại bỏ HTML tags và script injection
2. **Rate Limiting**: Ngăn chặn spam và brute force
3. **CORS**: Cấu hình Cross-Origin Resource Sharing
4. **Security Headers**: X-Frame-Options, X-Content-Type-Options, etc.
5. **Authentication**: JWT token validation

### Error Responses

```json
{
  "error": "Error message",
  "details": ["Detailed error messages"],
  "message": "Additional info (only in development)"
}
```

## Usage trong Frontend

```typescript
// Các API calls hiện tại sẽ hoạt động như bình thường
// Chỉ cần đảm bảo NEXT_PUBLIC_API_URL đúng

const response = await axios.post('/api/auth/login', {
  email: 'user@example.com',
  password: 'password123'
});
```

## Logs

Trong development mode, tất cả requests và responses sẽ được log:

```
[API Proxy] POST http://localhost:8000/api/login
[API Proxy] Response 200: { user: {...}, access_token: "..." }
```

## Rate Limiting

- **Login**: 10 requests/minute per IP
- **Register**: 5 requests/minute per IP  
- **General**: 60 requests/minute per IP (có thể cấu hình)

## Laravel Backend

Laravel API vẫn hoạt động bình thường, chỉ cần đảm bảo:
- CORS được cấu hình cho Next.js server
- Sanctum hoặc JWT authentication hoạt động
- API endpoints trả về JSON responses

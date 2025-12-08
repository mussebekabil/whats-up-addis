# API Documentation

Base URL: `http://localhost:3001` (development)

## Authentication

Most endpoints require authentication via JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Response Format

All responses follow this format:

```json
{
  "data": {},
  "error": "Error message if applicable"
}
```

Paginated responses include pagination metadata:

```json
{
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

## Authentication Endpoints

### Register User

```http
POST /api/auth/register
```

**Body:**

```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

**Response:**

```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "USER"
  },
  "tokens": {
    "accessToken": "jwt-token",
    "expiresIn": "7d"
  }
}
```

### Login

```http
POST /api/auth/login
```

**Body:**

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "USER"
  },
  "tokens": {
    "accessToken": "jwt-token",
    "expiresIn": "7d"
  }
}
```

### Get Current User

```http
GET /api/auth/me
Authorization: Bearer <token>
```

**Response:**

```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "John Doe",
  "role": "USER",
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T00:00:00.000Z"
}
```

### Logout

```http
POST /api/auth/logout
```

## Event Endpoints

### List Events

```http
GET /api/events?page=1&limit=20&categoryId=uuid&search=music&isFree=true
```

**Query Parameters:**

- `page` (number, default: 1)
- `limit` (number, default: 20, max: 100)
- `categoryId` (string, optional)
- `search` (string, optional)
- `startDate` (ISO date, optional)
- `endDate` (ISO date, optional)
- `minPrice` (number, optional)
- `maxPrice` (number, optional)
- `isFree` (boolean, optional)

**Response:**

```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Music Concert",
      "description": "Description...",
      "location": "Addis Ababa",
      "venue": "National Theater",
      "startDate": "2025-02-01T18:00:00.000Z",
      "endDate": "2025-02-01T22:00:00.000Z",
      "imageUrl": "https://...",
      "price": 500.0,
      "source": "manual",
      "categoryId": "uuid",
      "category": {
        "id": "uuid",
        "name": "Music & Concerts",
        "slug": "music-concerts"
      },
      "tags": [
        {
          "id": "uuid",
          "tag": "live-music"
        }
      ],
      "isActive": true
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "totalPages": 3
  }
}
```

### Get Event by ID

```http
GET /api/events/:id
```

**Response:** Single event object (same structure as list events)

### Create Event

```http
POST /api/events
Authorization: Bearer <token>
```

**Body:**

```json
{
  "title": "Music Concert",
  "description": "Amazing live performance",
  "location": "Addis Ababa",
  "venue": "National Theater",
  "startDate": "2025-02-01T18:00:00.000Z",
  "endDate": "2025-02-01T22:00:00.000Z",
  "imageUrl": "https://...",
  "price": 500.0,
  "categoryId": "uuid",
  "tags": ["live-music", "concert"]
}
```

**Response:** Created event object

### Update Event

```http
PUT /api/events/:id
Authorization: Bearer <token>
```

**Body:** Partial event object (any fields from create)

**Response:** Updated event object

**Authorization:** Only event creator or admin can update

### Delete Event

```http
DELETE /api/events/:id
Authorization: Bearer <token>
```

**Response:**

```json
{
  "message": "Event deleted successfully"
}
```

**Authorization:** Only event creator or admin can delete

### Search Events

```http
GET /api/events/search?q=music&page=1&limit=20
```

**Query Parameters:**

- `q` (string, required) - Search query
- `page` (number, default: 1)
- `limit` (number, default: 20)

## Category Endpoints

### List Categories

```http
GET /api/categories
```

**Response:**

```json
[
  {
    "id": "uuid",
    "name": "Music & Concerts",
    "slug": "music-concerts",
    "description": "Live music performances",
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
]
```

### Get Category by Slug

```http
GET /api/categories/:slug
```

**Response:** Single category object

### Get Events by Category

```http
GET /api/categories/:slug/events?page=1&limit=20
```

**Response:** Paginated events list

## Admin Endpoints

All admin endpoints require authentication and admin role.

### List Crawler Sources

```http
GET /api/admin/crawler/sources
Authorization: Bearer <admin-token>
```

**Response:**

```json
[
  {
    "id": "uuid",
    "name": "Example Events Site",
    "baseUrl": "https://example.com/events",
    "scraperType": "generic",
    "isActive": true,
    "lastCrawledAt": "2025-01-01T00:00:00.000Z",
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
]
```

### Create Crawler Source

```http
POST /api/admin/crawler/sources
Authorization: Bearer <admin-token>
```

**Body:**

```json
{
  "name": "New Event Site",
  "baseUrl": "https://example.com/events",
  "scraperType": "generic",
  "isActive": true
}
```

### Update Crawler Source

```http
PUT /api/admin/crawler/sources/:id
Authorization: Bearer <admin-token>
```

**Body:** Partial crawler source object

### Delete Crawler Source

```http
DELETE /api/admin/crawler/sources/:id
Authorization: Bearer <admin-token>
```

### Trigger Manual Crawl

```http
POST /api/admin/crawler/run
Authorization: Bearer <admin-token>
```

**Response:**

```json
{
  "message": "Crawler triggered successfully"
}
```

## Error Responses

All errors follow this format:

```json
{
  "error": "Error message"
}
```

### Common Error Codes

- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing or invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

### Validation Errors

```json
{
  "error": "Validation error",
  "details": [
    {
      "field": "email",
      "message": "Invalid email address"
    }
  ]
}
```

## Rate Limiting

- General API: 100 requests per 15 minutes per IP
- Auth endpoints: 5 requests per 15 minutes per IP

When rate limit is exceeded:

```json
{
  "error": "Too many requests from this IP, please try again later."
}
```

# LexiAI API Documentation

## Table of Contents
- [Authentication](#authentication)
- [PDF Management](#pdf-management)
- [Chat Management](#chat-management)

## Authentication

### Register User
```http
POST /api/auth/register
```
**Request Body:**
```json
{
    "username": "string",
    "email": "string",
    "password": "string"
}
```
**Success Response: (201)**
```json
{
    "success": true,
    "token": "JWT_TOKEN",
    "user": {
        "id": "string",
        "username": "string",
        "email": "string"
    }
}
```

### Login
```http
POST /api/auth/login
```
**Request Body:**
```json
{
    "email": "string",
    "password": "string"
}
```
**Success Response: (200)**
```json
{
    "success": true,
    "token": "JWT_TOKEN",
    "user": {
        "id": "string",
        "username": "string",
        "email": "string"
    }
}
```

### Logout
```http
POST /api/auth/logout
```
**Success Response: (200)**
```json
{
    "success": true,
    "message": "Logged out successfully"
}
```

## PDF Management

### Upload PDF
```http
POST /api/pdfs/upload
```
**Request Body:**
```form-data
file: [PDF File]
title: string (optional)
textContent: string
```
**Success Response: (201)**
```json
{
    "success": true,
    "data": {
        "id": "string",
        "title": "string",
        "url": "string",
        "user": "string",
        "uploadedAt": "date"
    }
}
```

### Get All PDFs
```http
GET /api/pdfs
```
**Success Response: (200)**
```json
{
    "success": true,
    "count": "number",
    "data": [{
        "id": "string",
        "title": "string",
        "url": "string",
        "uploadedAt": "date"
    }]
}
```

### Get PDF by ID
```http
GET /api/pdfs/:id
```
**Success Response: (200)**
```json
{
    "success": true,
    "data": {
        "id": "string",
        "title": "string",
        "url": "string",
        "chats": ["array of chat objects"]
    }
}
```

### Get User PDFs
```http
GET /api/pdfs/:userId/pdfs
```
**Success Response: (200)**
```json
{
    "success": true,
    "count": "number",
    "data": [{
        "id": "string",
        "title": "string",
        "url": "string",
        "chatCount": "number"
    }]
}
```

### Summarize PDF
```http
POST /api/pdfs/:id/summarize
```
**Success Response: (200)**
```json
{
    "success": true,
    "data": {
        "summary": "string"
    }
}
```

### Ask Question About PDF
```http
POST /api/pdfs/:id/ask
```
**Request Body:**
```json
{
    "question": "string"
}
```
**Success Response: (200)**
```json
{
    "success": true,
    "data": {
        "question": "string",
        "response": "string",
        "createdAt": "date"
    }
}
```

### Generate PDF Flow
```http
GET /api/pdfs/:id/flow
```
**Success Response: (200)**
```json
{
    "success": true,
    "data": {
        "flow": "string"
    }
}
```

### Delete PDF
```http
DELETE /api/pdfs/:id
```
**Success Response: (200)**
```json
{
    "success": true,
    "message": "PDF deleted successfully"
}
```

## Chat Management

### Ask Question in Chat
```http
POST /api/chats/:pdfId/question
```
**Request Body:**
```json
{
    "question": "string"
}
```
**Success Response: (200)**
```json
{
    "success": true,
    "data": {
        "question": "string",
        "response": "string",
        "createdAt": "date"
    }
}
```

### Get PDF Chats
```http
GET /api/chats/:pdfId/chats
```
**Success Response: (200)**
```json
{
    "success": true,
    "count": "number",
    "data": [{
        "question": "string",
        "response": "string",
        "createdAt": "date"
    }]
}
```

### Delete Chat
```http
DELETE /api/chats/chats/:chatId
```
**Success Response: (200)**
```json
{
    "success": true,
    "message": "Chat deleted successfully"
}
```

## Error Responses
All endpoints can return the following error responses:

**Authentication Error (401)**
```json
{
    "success": false,
    "message": "Not authorized"
}
```

**Validation Error (400)**
```json
{
    "success": false,
    "message": "Error message"
}
```

**Server Error (500)**
```json
{
    "success": false,
    "message": "Error message",
    "error": "Detailed error message"
}
```

## Authentication
All endpoints except `/api/auth/register` and `/api/auth/login` require authentication.
Add the JWT token to the Authorization header:
```http
Authorization: Bearer <JWT_TOKEN>
```
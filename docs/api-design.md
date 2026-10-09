
# QuickNotes API Design

## 1. Overview

QuickNotes is a notes application that allows users to create, read, update, and delete notes. The API follows REST principles and uses JSON for request and response bodies.

Base URL: `https://api.quicknotes.example.com`

All endpoints below describe the proposed QuickNotes production API. The current frontend assignment uses JSONPlaceholder as a demo API.

## 2. REST Endpoints

| Method | Path | Description | Success status |
|---|---|---|---|
| GET | `/notes` | List the authenticated user's notes | 200 OK |
| GET | `/notes/{id}` | Retrieve one note by ID | 200 OK |
| POST | `/notes` | Create a new note | 201 Created |
| PUT | `/notes/{id}` | Replace an existing note | 200 OK |
| PATCH | `/notes/{id}` | Partially update a note | 200 OK |
| DELETE | `/notes/{id}` | Delete a note | 204 No Content |
| GET | `/tags` | List the user's tags | 200 OK |

## 3. Create a Note

### Request

`POST /notes`

Headers:

`Content-Type: application/json`

`Authorization: Bearer <access-token>`

Request JSON:

```json
{
  "title": "Study plan",
  "body": "Revise system design before class.",
  "tagIds": [1, 2]
}
```

### Successful response

Status: `201 Created`

```json
{
  "id": 101,
  "userId": 7,
  "title": "Study plan",
  "body": "Revise system design before class.",
  "tags": [
    {"id": 1, "name": "School"},
    {"id": 2, "name": "Revision"}
  ],
  "createdAt": "2026-10-09T08:00:00Z",
  "updatedAt": "2026-10-09T08:00:00Z"
}
```

The server validates the title and associates the note with the authenticated user.

## 4. List Notes

### Request

`GET /notes?limit=10&offset=0`

Headers:

`Authorization: Bearer <access-token>`

### Successful response

Status: `200 OK`

```json
{
  "data": [
    {
      "id": 101,
      "userId": 7,
      "title": "Study plan",
      "body": "Revise system design before class.",
      "createdAt": "2026-10-09T08:00:00Z",
      "updatedAt": "2026-10-09T08:00:00Z"
    }
  ],
  "pagination": {
    "limit": 10,
    "offset": 0,
    "total": 1
  }
}
```

Pagination prevents the API from returning an unlimited number of notes in one response.

## 5. Error Status Codes

| Status | Meaning | Example |
|---|---|---|
| 400 Bad Request | Invalid input or malformed JSON | Missing title |
| 401 Unauthorized | Authentication is missing or invalid | Expired token |
| 403 Forbidden | User lacks permission | Accessing another user's note |
| 404 Not Found | Resource does not exist | Unknown note ID |
| 500 Internal Server Error | Unexpected server failure | Database operation fails |

### Example error body

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The title field is required.",
    "details": {
      "field": "title"
    }
  }
}
```

The API should return meaningful error messages without exposing passwords, tokens, SQL statements, or internal server details.

## 6. Design Decisions

- JSON is used because it is widely supported by browsers and backend frameworks.
- Standard HTTP methods describe the operation being performed.
- Authentication identifies the user, and authorization ensures users can only access their own notes.
- Pagination supports large note collections.
- The server validates all input; browser-side validation alone is not sufficient.
- `201 Created` confirms creation, while `204 No Content` confirms deletion without returning a response body.

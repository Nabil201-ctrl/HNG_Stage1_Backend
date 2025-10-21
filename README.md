# Stage 1 – String Analyzer Service API

## 🚀 Overview

This project is a RESTful API built using **Node.js** and **Express.js**. It provides endpoints to analyze strings, compute their properties, and store them in an in-memory database (Map). The API supports creating, retrieving, filtering, and deleting strings, with advanced features like natural language query parsing.

This task showcases the ability to:

* Build a robust RESTful API with multiple endpoints
* Compute string properties (length, palindrome, word count, etc.)
* Implement natural language query parsing
* Handle input validation and error cases
* Use environment variables and modular code structure

---

## ✅ Features

* Analyze strings for properties: length, palindrome status, unique characters, word count, SHA-256 hash, and character frequency
* Store strings in an in-memory database with SHA-256 hash as the unique identifier
* Support filtering strings by properties (e.g., palindrome, length, word count)
* Parse natural language queries (e.g., "all single word palindromic strings")
* Robust input sanitization and error handling
* RESTful design with proper HTTP status codes (201, 204, 400, 404, 409, 422)

---

## 📡 API Endpoints

| Method   | Endpoint                              | Description                                    |
|----------|---------------------------------------|------------------------------------------------|
| `POST`   | `/strings`                           | Creates and analyzes a new string              |
| `GET`    | `/strings/:string_value`             | Retrieves a specific string's analysis         |
| `GET`    | `/strings`                           | Retrieves all strings with optional filters    |
| `GET`    | `/strings/filter-by-natural-language` | Filters strings using natural language query   |
| `DELETE` | `/strings/:string_value`             | Deletes a specific string                      |

### ✅ Example Responses

#### POST /strings
**Request**:
```json
{
  "value": "hello world"
}
```
**Response** (201 Created):
```json
{
  "id": "<sha256_hash>",
  "value": "hello world",
  "properties": {
    "length": 11,
    "is_palindrome": false,
    "unique_characters": 8,
    "word_count": 2,
    "sha256_hash": "<sha256_hash>",
    "character_frequency_map": {
      "h": 1, "e": 1, "l": 3, "o": 2, " ": 1, "w": 1, "r": 1, "d": 1
    }
  },
  "created_at": "2025-10-21T10:23:00.000Z"
}
```

#### GET /strings?word_count=2
**Response** (200 OK):
```json
{
  "data": [
    {
      "id": "<sha256_hash>",
      "value": "hello world",
      "properties": { /* ... */ },
      "created_at": "2025-10-21T10:23:00.000Z"
    }
  ],
  "count": 1,
  "filters_applied": {
    "word_count": "2"
  }
}
```

#### GET /strings/filter-by-natural-language?query=all%20single%20word%20palindromic%20strings
**Response** (200 OK):
```json
{
  "data": [
    {
      "id": "<sha256_hash>",
      "value": "radar",
      "properties": { /* ... */ },
      "created_at": "2025-10-21T10:23:00.000Z"
    }
  ],
  "count": 1,
  "interpreted_query": {
    "original": "all single word palindromic strings",
    "parsed_filters": {
      "word_count": 1,
      "is_palindrome": true
    }
  }
}
```

---

## 🛠️ Tech Stack

* **Node.js** (JavaScript)
* **Express.js** for routing and middleware
* **crypto** (Node.js built-in) for SHA-256 hashing
* **Map** for in-memory storage

---

## 📂 Project Setup

### 1️⃣ Clone Repository

```bash
git clone <repo-url>
cd string-analyzer-service
```

### 2️⃣ Install Dependencies

```bash
npm install express
```

### 3️⃣ Create `.env` File

```bash
PORT=3000
```

### 4️⃣ Run Locally

```bash
node index.js
```

> Server will start at: `http://localhost:3000`

---

## 🌍 Deployment

* Hosted on **PXXL SPACE**
* Ensure environment variables (e.g., `PORT`) are configured on the hosting platform.

---

## 🧪 Testing

The API was tested using **Postman** to ensure all endpoints meet the requirements.

### Test Setup
1. **Install Postman**: Download from [postman.com](https://www.postman.com/downloads/).
2. **Create Collection**: Name it "String Analyzer API".
3. **Set Base URL**: Use `http://localhost:3000` or your deployed URL as a variable (`baseUrl`).

### Test Cases
1. **POST /strings**
   - Request: `POST {{baseUrl}}/strings` with body `{"value": "hello world"}`
   - Expected: 201, response with `id`, `value`, `properties`, `created_at`
   - Error Tests: Missing `value` (400), non-string `value` (422), duplicate string (409)
2. **GET /strings/:string_value**
   - Request: `GET {{baseUrl}}/strings/hello%20world`
   - Expected: 200, same structure as POST response
   - Error Test: Non-existent string (404)
3. **GET /strings**
   - Request: `GET {{baseUrl}}/strings?word_count=2&is_palindrome=false`
   - Expected: 200, response with `data`, `count`, `filters_applied`
   - Error Tests: Invalid `is_palindrome` (400), negative `min_length` (400), invalid range (400)
4. **GET /strings/filter-by-natural-language**
   - Request: `GET {{baseUrl}}/strings/filter-by-natural-language?query=all%20single%20word%20palindromic%20strings`
   - Expected: 200, response with `data`, `count`, `interpreted_query`
   - Error Tests: Empty query (400), unparsable query (400), conflicting filters (422)
5. **DELETE /strings/:string_value**
   - Request: `DELETE {{baseUrl}}/strings/hello%20world`
   - Expected: 204, empty response
   - Error Test: Non-existent string (404)

### Validation
- Ensured response formats match the specified schema ✅
- Verified SHA-256 hashes are consistent ✅
- Tested natural language queries (e.g., "strings longer than 10 characters") ✅
- Confirmed proper error handling for all edge cases ✅
- Checked `Content-Type: application/json` for all responses ✅

---

## 🧠 Lessons & Best Practices Applied

* **Modular Code**: Separated natural language parsing and filter logic into utility modules
* **Input Sanitization**: Implemented `sanitizeInput` to handle invalid inputs
* **Error Handling**: Used proper HTTP status codes (201, 204, 400, 404, 409, 422)
* **SHA-256 Hashing**: Used Node.js `crypto` module for unique string identification
* **Natural Language Parsing**: Supported queries like "single word palindromic strings" with extensible parser
* **Environment Variables**: Used `process.env.PORT` for flexible deployment

---

## 📝 Tasks Done

* ✅ Implemented all required endpoints with full functionality
* ✅ Added robust input validation and error handling
* ✅ Hosted API on Railway (or alternative platform)
* ✅ Provided GitHub repo with clear README and setup instructions
* ✅ Tested all endpoints using Postman
* ✅ Published write-up on **LinkedIn** explaining:
  * Thought process
  * Implementation details
  * Screenshots of API responses

---

Backend Wizard 🧙‍♂️🔥

---
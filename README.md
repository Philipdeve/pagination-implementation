# Pagination Implementation
Imagine if you searched for something on Google and it returned all results at once. That would be disastrous because your browser will crash as thousands of results will eat up all your computer's memory. 

Pagination is needed to break large result sets into manageable chunks. There are two main approaches to pagination: offset-based and cursor-based.
This project demonstrates production-style backend pagination using FastAPI and PostgreSQL. I implemented cursor based pagination and offset based pagination to understand the differences between both. For the frontend, I used Next.js

## Tech Stack
- Python
- FastAPI
- PostgreSQL (Pagila dataset)
- SQLModel
- Next.js


## What I Learned

### The difference between Offset and Cursor pagination
- Offset-based pagination is the simplest approach and used by most websites but it can be slow on large datasets. For example, if someone adds new data while you're paginating through results, you might see duplicates or miss records as the data shifts.
- Cursor-based pagination solves this by using a pointer to a specific record instead of counting from the beginning.
- Cursor is more efficient for infinite scroll scenarios like Instagram and TikTok.
- Cursor-based pagination improves scalability but makes it harder to implement features like "jump to page 5."

### Importance of indexing
- Indexes speed up WHERE and ORDER BY queries
- Without indexes, databases do full table scans

### Designing Scalable APIs
- Pagination reduces payload size


## API Example

GET /payments

### Query Params

- cursor (string, optional)
- limit (int, default=20)

### Example Response:
```json
{
  "data": [...],
  "pagination": {
    "next_cursor": "...",
    "limit": "..",
    "has_more_data": boolean,
  }
}
```
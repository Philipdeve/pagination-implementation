# Pagination Implementation

This project demonstrates production-style backend pagination using FastAPI and PostgreSQL. I implemented cursor based pagination and offset based pagination to understand the differences between both. To visualize it, I used Next.js.

## Tech Stack
- FastAPI
- PostgreSQL (Pagila dataset)
- SQLModel
- Next.js


## What I Learned
- Difference between OFFSET and cursor pagination 
- Importance of indexing in query performance
- How to design scalable APIs

## API Example

GET /payments

### Query Params

- cursor (string, optional)
- limit (int, default=20)

### Response:
{
  "data": [...],
  "pagination": {
    "next_cursor": "...",
    "limit": ".."
    "has_more_data": boolean
  }
}
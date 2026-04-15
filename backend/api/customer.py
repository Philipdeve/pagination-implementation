from fastapi import APIRouter

from sqlmodel import select, func, Session
from models.customer import Customer
from db.connect import engine

router = APIRouter()

@router.get("/customers") # To demonstrate Offset-based Pagination
def get_customers(page: int = 1, limit: int = 10):
    page = max(1, page) # If the client sends page=0 or any negative number, it silently corrects it to 1. same thing for limit below.
    limit = max(1, limit)

    MAX_LIMIT = 100
    limit = min(limit, MAX_LIMIT)

    offset = (page - 1) * limit

    with Session(engine) as session:
        statement = (
            select(Customer)
            .order_by(Customer.customer_id)
            .offset(offset)
            .limit(limit)
        )
        results = session.exec(statement).all()
    
        count_statement = select(func.count()).select_from(Customer)
        total_count = session.exec(count_statement).one()

    return {
        "data": results,
        "pagination": {
            "page": page,
            "limit": limit,
            "total_items": total_count,
            "total_pages": (total_count + limit - 1) // limit, # Ceiling division
            "has_next_page": (page * limit) < total_count
        }
    }


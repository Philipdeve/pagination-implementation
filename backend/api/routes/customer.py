from fastapi import APIRouter, Query

from sqlmodel import select, func, Session
from models.customer import Customer
from db.connect import engine

router = APIRouter()

@router.get("/customers") # To demonstrate Offset-based Pagination
def get_customers(
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=10, ge=1, le=100)
):

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


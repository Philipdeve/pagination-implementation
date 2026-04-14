from fastapi import APIRouter

from sqlmodel import select, Session
from models.customer import Customer
from db.connect import engine

router = APIRouter()

@router.get("/customers")
def get_customers(page: int = 1, limit: int = 20):
    offset = (page - 1) * limit

    with Session(engine) as session:
        statement = (
            select(Customer)
            .order_by(Customer.customer_id)
            .offset(offset)
            .limit(limit)
        )
        results = session.exec(statement).all()

    return results


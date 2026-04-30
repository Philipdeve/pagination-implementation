from typing import Optional

from fastapi import APIRouter, HTTPException, Query

from sqlmodel import select, Session
from models.payment import Payment
from db.connect import engine

from utils.cursor_helper import encode_cursor, decode_cursor

router = APIRouter()

@router.get("/payments") # To demonstrate cursor based Pagination
def get_payments(
    cursor: Optional[str] = None,
    limit: int = Query(default=20, ge=1, le=1000)
):
    with Session(engine) as session:
        statement = (
            select(Payment)
            .order_by(Payment.payment_id)
            .limit(limit + 1)
        )  

        if cursor is not None:
            try:
                payment_id = decode_cursor(cursor)
            except ValueError as exc:
                raise HTTPException(status_code=400, detail="Invalid cursor") from exc
            statement = statement.where(Payment.payment_id > payment_id)

        results = session.exec(statement).all()

        has_more_data = len(results) > limit
        results = results[:limit]

        next_cursor = None

        if has_more_data:
            next_cursor = encode_cursor(results[-1].payment_id) 

    return {
        "data": results,
         "pagination": {
            "next_cursor": next_cursor,
            "limit": limit,
            "has_more_data": has_more_data
        }
     
    }
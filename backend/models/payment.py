from sqlmodel import SQLModel, Field
from datetime import datetime

class Payment(SQLModel, table=True):
    payment_id: int = Field(primary_key=True)
    customer_id: int
    staff_id: int
    rental_id: int
    amount: float
    payment_date: datetime
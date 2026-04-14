from sqlmodel import SQLModel, Field

class Customer(SQLModel, table=True):
    customer_id: int = Field(primary_key=True)
    first_name: str
    last_name: str
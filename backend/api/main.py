from fastapi import APIRouter
from api.routes import customer, payment

api_router = APIRouter()

api_router.include_router(customer.router)
api_router.include_router(payment.router)
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from api.customer import router as customer_router

app = FastAPI()

origins = [
    "http://localhost:3000", 
    "https://your-frontend-domain.com", # if i was deploying live, I would handle this properly
]

# 2. Add the middleware to your FastAPI app
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,          
    allow_credentials=True,
    allow_methods=["*"],             
    allow_headers=["*"],             
)


@app.get("/")
def read_root():
    return {"msg": "Pagination Implementation"}


app.include_router(customer_router)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.main import api_router

app = FastAPI()

origins = [
    "http://localhost:3000", 
    "https://your-frontend-domain.com", # if i was deploying live, I would handle this properly
]


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


app.include_router(api_router)

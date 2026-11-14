from fastapi import APIRouter
from backend.app.api.endpoints import jobs, grid, analytics

api_router = APIRouter()
api_router.include_router(jobs.router)
api_router.include_router(grid.router)
api_router.include_router(analytics.router)

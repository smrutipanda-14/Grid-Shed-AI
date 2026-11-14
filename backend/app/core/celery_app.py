from celery import Celery
from backend.app.core.config import settings

celery_app = Celery(
    "grid_shed_ai",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
    include=["backend.app.worker.tasks"]
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    worker_prefetch_multiplier=1,  # Strict prefetch limit to avoid buffered task leakage
    task_acks_late=True,
    broker_connection_retry_on_startup=False,
    broker_transport_options={"max_retries": 1, "visibility_timeout": 3600, "socket_timeout": 0.5, "socket_connect_timeout": 0.5},
    broker_connection_timeout=0.5,
    beat_schedule={
        "evaluate-reserve-queue-every-30-seconds": {
            "task": "backend.app.worker.tasks.evaluate_reserve_queue_task",
            "schedule": 30.0,
        },
    },
)

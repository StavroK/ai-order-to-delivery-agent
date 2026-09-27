from fastapi import FastAPI, HTTPException
from sqlalchemy import select
from .database import Base, engine, SessionLocal
from .models import Order

app = FastAPI(title="Order-to-Delivery Agent Reference API", version="0.1.0")
Base.metadata.create_all(bind=engine)

@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/orders/{order_number}")
def get_order(order_number: str):
    with SessionLocal() as session:
        order = session.scalar(select(Order).where(Order.order_number == order_number))
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        return {
            "order_number": order.order_number,
            "customer_name": order.customer_name,
            "payment_status": order.payment_status,
            "fulfillment_status": order.fulfillment_status,
            "total_amount": float(order.total_amount),
        }

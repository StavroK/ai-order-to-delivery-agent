from sqlalchemy import String, Integer, Numeric
from sqlalchemy.orm import Mapped, mapped_column
from .database import Base

class Order(Base):
    __tablename__ = "orders"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    order_number: Mapped[str] = mapped_column(String(32), unique=True, index=True)
    customer_name: Mapped[str] = mapped_column(String(120))
    payment_status: Mapped[str] = mapped_column(String(40))
    fulfillment_status: Mapped[str] = mapped_column(String(40))
    total_amount: Mapped[float] = mapped_column(Numeric(12, 2))

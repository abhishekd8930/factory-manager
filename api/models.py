"""
Pydantic models for FastAPI salary calculation endpoints.
All request/response schemas for the Factory Manager financial API.
"""

from pydantic import BaseModel, Field
from typing import Optional


# ==========================================
# Shared / Config Models
# ==========================================

class Rates(BaseModel):
    OT_PER_HOUR: float = 45
    NPL_FINE: float = 500
    ATTENDANCE_BONUS: float = 600
    DEFAULT_IN_TIME: str = "09:30 AM"
    DEFAULT_OUT_TIME: str = "07:00 PM"


class DayData(BaseModel):
    """Represents a single day's attendance data."""
    hours: Optional[float] = None
    ot: Optional[float] = None
    status: Optional[str] = None  # 'NPL', 'LEAVE', 'SUNDAY', 'HOLIDAY', 'PAID_LEAVE'
    in_time: Optional[str] = Field(None, alias="in")
    out_time: Optional[str] = Field(None, alias="out")

    model_config = {"populate_by_name": True}


class PcsEntry(BaseModel):
    """A single piece-rate work entry."""
    item: str = "Unknown Item"
    rate: float = 0
    quantity: float = 0
    total: Optional[float] = 0


# ==========================================
# 1. Time-Based Salary Calculation
# ==========================================

class SalaryRequest(BaseModel):
    """Request body for time-based salary calculation."""
    employee_name: str
    employee_role: str = ""
    salary: float = 0  # Basic monthly salary
    advance: float = 0
    days: dict[str, DayData] = {}  # Key is day number as string
    year: int
    month: int
    rates: Rates = Rates()
    owner_name: str = "Factory Manager"


class SalaryResponse(BaseModel):
    """Computed salary data returned to the frontend."""
    employee_name: str
    employee_role: str
    date_label: str

    # Attendance breakdown
    full_days: float
    partial_hours: float
    total_ot_hours: float
    npl_count: int
    leave_count: int
    absent_days: int
    unpaid_sundays: int
    half_paid_sundays: int
    actual_work_days: int
    total_sundays_in_month: int

    # Financial breakdown
    daily_wage: float
    basic_earned: float
    ot_pay: float
    incentive: float
    npl_fine: float
    advance: float
    gross: float
    net: float

    # Display helpers
    sunday_status: str  # e.g., "2 Unpaid, 1 Half-Pay" or "All Paid"
    owner_name: str


# ==========================================
# 2. Piece-Rate Billing
# ==========================================

class PieceRateRequest(BaseModel):
    """Request body for piece-rate salary calculation."""
    employee_name: str
    employee_role: str = ""
    advance: float = 0
    pcs_entries: list[PcsEntry] = []
    owner_name: str = "Factory Manager"
    date_label: str = ""


class ConsolidatedItem(BaseModel):
    """A consolidated piece-rate item (duplicates merged)."""
    display_name: str
    rate: float
    quantity: float
    total: float


class PieceRateResponse(BaseModel):
    """Computed piece-rate data returned to the frontend."""
    employee_name: str
    employee_role: str
    date_label: str
    owner_name: str

    consolidated_items: list[ConsolidatedItem]
    total_quantity: float
    total_piece_earnings: float
    advance: float
    net: float


# ==========================================
# 3. Wage Summary
# ==========================================

class EmployeeLedger(BaseModel):
    """Employee data plus their ledger for a specific month."""
    id: str
    name: str
    role: str = ""
    type: str = "timings"  # 'timings' or 'pcs'
    salary: float = 0
    advance: float = 0
    days: dict[str, DayData] = {}
    pcs_entries: list[PcsEntry] = []


class WageSummaryRequest(BaseModel):
    """Request body for the wage summary endpoint."""
    year: int
    month: int
    employees: list[EmployeeLedger]
    rates: Rates = Rates()


class EmployeeWageRow(BaseModel):
    """Computed wage data for a single employee."""
    name: str
    role: str
    earned: int
    advance: int
    net: int


class StaffGroup(BaseModel):
    """A group of employees with their subtotal."""
    title: str
    color_class: str
    employees: list[EmployeeWageRow]
    subtotal: int
    count: int


class WageSummaryResponse(BaseModel):
    """Full wage summary grouped by staff type."""
    groups: list[StaffGroup]
    grand_total: int

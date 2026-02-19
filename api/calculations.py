"""
Pure Python calculation functions for Factory Manager financials.
These mirror the logic from js/modules/staff/finance.js exactly.
"""

from calendar import monthrange
from datetime import date
from .models import (
    SalaryRequest, SalaryResponse,
    PieceRateRequest, PieceRateResponse, ConsolidatedItem,
    WageSummaryRequest, WageSummaryResponse, EmployeeWageRow, StaffGroup,
    DayData, Rates
)


# ==========================================
# 1. Time-Based Salary Calculation
# ==========================================

def calculate_time_salary(req: SalaryRequest) -> SalaryResponse:
    """
    Calculates salary for a time-based (salaried) employee.
    Mirrors the logic from finance.js calculateSalary() for emp.type === 'timings'.
    """
    days_in_month = monthrange(req.year, req.month)[1]
    daily_wage = req.salary / days_in_month if days_in_month > 0 else 0
    hourly_wage = daily_wage / 8 if daily_wage > 0 else 0

    full_days = 0.0
    partial_hours = 0.0
    total_ot_hours = 0.0
    npl_count = 0
    leave_count = 0
    absent_days = 0
    unpaid_sundays = 0
    half_paid_sundays = 0
    actual_work_days = 0
    total_sundays_in_month = 0

    day_map = req.days
    today = date.today()

    for i in range(1, days_in_month + 1):
        day_key = str(i)
        day_data = day_map.get(day_key, DayData())
        current_date = date(req.year, req.month, i)
        is_sunday = current_date.weekday() == 6 or day_data.status == "SUNDAY"
        is_holiday = day_data.status == "HOLIDAY"
        is_paid_leave = day_data.status == "PAID_LEAVE"

        if is_sunday:
            total_sundays_in_month += 1

        # HOLIDAY or PAID_LEAVE — Full Pay + OT if worked
        if is_holiday or is_paid_leave:
            full_days += 1
            if day_data.hours:
                total_ot_hours += day_data.hours

        # SUNDAY — Base Pay via lookback + Pure OT
        elif is_sunday:
            # Lookback logic for previous 6 days
            week_total_hours = 0.0
            week_work_days = 0
            has_any_status = False

            for back in range(1, 7):
                check_day = i - back
                if check_day < 1:
                    break
                prev_key = str(check_day)
                prev_data = day_map.get(prev_key)
                if prev_data:
                    if prev_data.hours:
                        week_total_hours += prev_data.hours
                        week_work_days += 1
                    if prev_data.status or prev_data.hours or prev_data.in_time:
                        has_any_status = True

            # Base Pay
            if not has_any_status and i != 1:
                unpaid_sundays += 1
            elif i == 1:
                day1 = day_map.get("1")
                day2 = day_map.get("2")
                if not (day1 and day1.hours) and not (day2 and day2.hours):
                    full_days += 1
                else:
                    full_days += 1
            else:
                avg_hours = (week_total_hours / week_work_days) if week_work_days > 0 else 0
                if avg_hours > 0 and avg_hours < 5:
                    full_days += 0.5
                    half_paid_sundays += 1
                else:
                    full_days += 1

            # OT on Sunday
            if day_data.hours:
                total_ot_hours += day_data.hours or 0
                actual_work_days += 1

        # NORMAL DAYS
        else:
            if day_data.status == "NPL":
                npl_count += 1
                absent_days += 1
            elif day_data.status == "LEAVE":
                leave_count += 1
                absent_days += 1
                actual_work_days += 1
            elif day_data.hours:
                total_h = day_data.hours or 0
                ot_h = day_data.ot or 0
                total_ot_hours += ot_h
                normal_work = total_h - ot_h
                if normal_work >= 8:
                    full_days += 1
                else:
                    partial_hours += normal_work
                actual_work_days += 1
            else:
                if not day_data.in_time and not day_data.out_time and not day_data.status:
                    if current_date <= today:
                        absent_days += 1

    # If no actual work, zero out
    if actual_work_days == 0:
        full_days = 0
        unpaid_sundays = total_sundays_in_month
        half_paid_sundays = 0

    # Financials
    incentive = req.rates.ATTENDANCE_BONUS if (
        absent_days == 0 and npl_count == 0 and leave_count == 0 and
        unpaid_sundays == 0 and actual_work_days > 0
    ) else 0

    basic_earned = (full_days * daily_wage) + (partial_hours * hourly_wage)
    ot_pay = total_ot_hours * req.rates.OT_PER_HOUR
    npl_fine = npl_count * req.rates.NPL_FINE
    gross = basic_earned + ot_pay + incentive
    net = gross - npl_fine - req.advance
    if net < 0:
        net = 0

    # Sunday status string
    parts = []
    if unpaid_sundays > 0:
        parts.append(f"{unpaid_sundays} Unpaid")
    if half_paid_sundays > 0:
        parts.append(f"{half_paid_sundays} Half-Pay")
    sunday_status = ", ".join(parts) if parts else "All Paid"

    # Date label
    date_label = date(req.year, req.month, 1).strftime("%B %Y")

    return SalaryResponse(
        employee_name=req.employee_name,
        employee_role=req.employee_role,
        date_label=date_label,
        full_days=round(full_days, 1),
        partial_hours=round(partial_hours, 1),
        total_ot_hours=round(total_ot_hours, 1),
        npl_count=npl_count,
        leave_count=leave_count,
        absent_days=absent_days,
        unpaid_sundays=unpaid_sundays,
        half_paid_sundays=half_paid_sundays,
        actual_work_days=actual_work_days,
        total_sundays_in_month=total_sundays_in_month,
        daily_wage=round(daily_wage, 2),
        basic_earned=round(basic_earned, 2),
        ot_pay=round(ot_pay, 2),
        incentive=incentive,
        npl_fine=npl_fine,
        advance=req.advance,
        gross=round(gross, 2),
        net=round(net, 2),
        sunday_status=sunday_status,
        owner_name=req.owner_name,
    )


# ==========================================
# 2. Piece-Rate Billing
# ==========================================

def calculate_piece_rate(req: PieceRateRequest) -> PieceRateResponse:
    """
    Consolidates piece-rate entries by (item_name + rate) and calculates totals.
    Mirrors finance.js L304–335.
    """
    consolidated: dict[str, dict] = {}

    for entry in req.pcs_entries:
        raw_name = entry.item or "Unknown Item"
        clean_name = raw_name.lower().strip()
        rate = entry.rate or 0
        key = f"{clean_name}_{rate}"

        if key not in consolidated:
            consolidated[key] = {
                "display_name": raw_name,
                "rate": rate,
                "quantity": 0,
                "total": 0,
            }

        qty = entry.quantity or 0
        consolidated[key]["quantity"] += qty
        consolidated[key]["total"] += qty * rate

    items = [
        ConsolidatedItem(
            display_name=v["display_name"],
            rate=v["rate"],
            quantity=v["quantity"],
            total=v["total"],
        )
        for v in consolidated.values()
    ]

    total_quantity = sum(item.quantity for item in items)
    total_piece_earnings = sum(item.total for item in items)
    net = total_piece_earnings - req.advance
    if net < 0:
        net = 0

    return PieceRateResponse(
        employee_name=req.employee_name,
        employee_role=req.employee_role,
        date_label=req.date_label,
        owner_name=req.owner_name,
        consolidated_items=items,
        total_quantity=total_quantity,
        total_piece_earnings=total_piece_earnings,
        advance=req.advance,
        net=net,
    )


# ==========================================
# 3. Wage Summary
# ==========================================

def calculate_wage_summary(req: WageSummaryRequest) -> WageSummaryResponse:
    """
    Calculates earned/advance/net for every employee and groups them.
    Mirrors finance.js renderDetailsSummary() L540–680.
    """
    days_in_month = monthrange(req.year, req.month)[1]

    time_staff: list[EmployeeWageRow] = []
    front_back_staff: list[EmployeeWageRow] = []
    assembly_staff: list[EmployeeWageRow] = []

    for emp in req.employees:
        advance = emp.advance or 0
        earned = 0.0

        if emp.type == "timings":
            basic_salary = emp.salary or 0
            daily_wage = basic_salary / 30
            hourly_wage = daily_wage / 8

            full_days = 0.0
            partial_hours = 0.0
            total_ot_hours = 0.0
            npl_count = 0
            leave_count = 0
            absent_days = 0

            for i in range(1, days_in_month + 1):
                d = emp.days.get(str(i), DayData())
                d_obj = date(req.year, req.month, i)
                is_sun = d_obj.weekday() == 6 or d.status == "SUNDAY"
                is_hol = d.status == "HOLIDAY"
                is_paid_leave = d.status == "PAID_LEAVE"

                if is_sun or is_hol or is_paid_leave:
                    full_days += 1
                    if d.hours:
                        total_ot_hours += d.hours
                else:
                    if d.status == "NPL":
                        npl_count += 1
                        absent_days += 1
                    elif d.status == "LEAVE":
                        leave_count += 1
                        absent_days += 1
                    elif d.hours:
                        h = d.hours or 0
                        ot = d.ot or 0
                        total_ot_hours += ot
                        normal = h - ot
                        if normal >= 8:
                            full_days += 1
                        else:
                            partial_hours += normal
                    else:
                        if not d.in_time and not d.out_time and not d.status:
                            absent_days += 1

            incentive = req.rates.ATTENDANCE_BONUS if (
                absent_days == 0 and npl_count == 0 and leave_count == 0
            ) else 0

            earned = (
                (full_days * daily_wage) +
                (partial_hours * hourly_wage) +
                (total_ot_hours * req.rates.OT_PER_HOUR) +
                incentive -
                (npl_count * req.rates.NPL_FINE)
            )
        else:
            # Piece-rate: sum all entry totals
            for entry in emp.pcs_entries:
                earned += entry.total or 0

        net = earned - advance
        row = EmployeeWageRow(
            name=emp.name,
            role=emp.role,
            earned=round(earned),
            advance=round(advance),
            net=round(net),
        )

        # Group
        if emp.type == "timings":
            time_staff.append(row)
        else:
            role_lower = (emp.role or "").lower()
            if "front" in role_lower or "back" in role_lower:
                front_back_staff.append(row)
            else:
                assembly_staff.append(row)

    groups: list[StaffGroup] = []
    grand_total = 0

    if time_staff:
        subtotal = sum(e.net for e in time_staff)
        grand_total += subtotal
        groups.append(StaffGroup(
            title="Based on Timings",
            color_class="text-indigo-600",
            employees=time_staff,
            subtotal=subtotal,
            count=len(time_staff),
        ))

    if front_back_staff:
        subtotal = sum(e.net for e in front_back_staff)
        grand_total += subtotal
        groups.append(StaffGroup(
            title="Front & Back",
            color_class="text-emerald-600",
            employees=front_back_staff,
            subtotal=subtotal,
            count=len(front_back_staff),
        ))

    if assembly_staff:
        subtotal = sum(e.net for e in assembly_staff)
        grand_total += subtotal
        groups.append(StaffGroup(
            title="Assembly",
            color_class="text-blue-600",
            employees=assembly_staff,
            subtotal=subtotal,
            count=len(assembly_staff),
        ))

    return WageSummaryResponse(groups=groups, grand_total=grand_total)

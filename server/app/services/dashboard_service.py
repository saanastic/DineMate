from datetime import datetime, timedelta


def get_dashboard_summary(user):
    now = datetime.utcnow()
    return {
        "summary": {
            "today_revenue": 12840.75,
            "today_orders": 312,
            "active_tables": 19,
            "reservations": 12,
            "staff_on_shift": 24,
            "customer_satisfaction": 96,
        },
        "trend": [
            {"day": "Mon", "orders": 142, "revenue": 3200},
            {"day": "Tue", "orders": 188, "revenue": 3775},
            {"day": "Wed", "orders": 157, "revenue": 2900},
            {"day": "Thu", "orders": 223, "revenue": 4720},
            {"day": "Fri", "orders": 307, "revenue": 8730},
            {"day": "Sat", "orders": 346, "revenue": 10450},
            {"day": "Sun", "orders": 264, "revenue": 7120},
        ],
        "insights": [
            {"title": "AI forecast", "description": "Tomorrow's dinner service is expected to rise 18%.", "type": "forecast"},
            {"title": "Inventory alert", "description": "Low stock on Wagyu beef and saffron glaze.", "type": "inventory"},
            {"title": "Top performer", "description": "Sea Bass with lemon beurre blanc is trending tonight.", "type": "menu"},
        ],
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role,
        },
    }

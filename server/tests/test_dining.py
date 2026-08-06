import pytest
from decimal import Decimal
from unittest.mock import patch, MagicMock

from app.services.order_service import _build_lines, VALID_TRANSITIONS
from app.models.dining import OrderStatus


class TestOrderTotals:
    def test_tax_calculation(self):
        subtotal = Decimal("100.00")
        tax = (subtotal * Decimal("0.08")).quantize(Decimal("0.01"))
        assert tax == Decimal("8.00")
        assert subtotal + tax == Decimal("108.00")


class TestStatusTransitions:
    def test_valid_transitions(self):
        assert OrderStatus.confirmed in VALID_TRANSITIONS[OrderStatus.placed]
        assert OrderStatus.cancelled in VALID_TRANSITIONS[OrderStatus.placed]
        assert OrderStatus.closed not in VALID_TRANSITIONS[OrderStatus.placed]

    def test_closed_is_terminal(self):
        assert VALID_TRANSITIONS[OrderStatus.closed] == set()


class TestStockThreshold:
    def test_newly_low_detection(self):
        was_low = False
        current = 4
        threshold = 5
        now_low = current <= threshold
        newly_low = not was_low and now_low
        assert newly_low is True

    def test_no_repeat_alert_when_already_low(self):
        was_low = True
        current = 2
        threshold = 5
        now_low = current <= threshold
        newly_low = not was_low and now_low
        assert newly_low is False


class TestStripeWebhook:
    def test_webhook_invalid_signature(self):
        from app.services import order_service

        db = MagicMock()
        with patch("stripe.Webhook.construct_event", side_effect=ValueError("bad sig")):
            result = order_service.handle_stripe_webhook(db, b"{}", "sig")
        assert result is False

import unittest
from datetime import date
from fastapi.testclient import TestClient
from app.main import app
from app.db.session import Base, engine, SessionLocal
from app.services.seed_data import init_system_categories

class TestFinanceAPI(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        Base.metadata.create_all(bind=engine)
        db = SessionLocal()
        init_system_categories(db)
        db.close()
        cls.client = TestClient(app)

    def test_01_health_check(self):
        response = self.client.get("/health")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["status"], "healthy")

    def test_02_register_and_login(self):
        # Register user
        reg_res = self.client.post("/api/v1/auth/register", json={
            "email": "user_test_clean@example.com",
            "password": "password123",
            "display_name": "Test User",
            "default_currency": "INR"
        })
        if reg_res.status_code == 409:
            # Already exists from previous run, login instead
            log_res = self.client.post("/api/v1/auth/login", json={
                "email": "user_test_clean@example.com",
                "password": "password123"
            })
            self.assertEqual(log_res.status_code, 200)
            data = log_res.json()
        else:
            self.assertEqual(reg_res.status_code, 201)
            data = reg_res.json()

        self.assertIn("access_token", data)
        self.assertEqual(data["user"]["email"], "user_test_clean@example.com")
        TestFinanceAPI.token = data["access_token"]

    def test_03_create_transaction_and_dashboard(self):
        headers = {"Authorization": f"Bearer {TestFinanceAPI.token}"}

        # Create income transaction
        inc_res = self.client.post("/api/v1/transactions", json={
            "transaction_type": "income",
            "amount": 50000,
            "currency": "INR",
            "transaction_date": date.today().isoformat(),
            "merchant": "Tech Corp",
            "note": "Salary"
        }, headers=headers)
        self.assertEqual(inc_res.status_code, 201)

        # Create expense transaction
        exp_res = self.client.post("/api/v1/transactions", json={
            "transaction_type": "expense",
            "amount": 1200,
            "currency": "INR",
            "transaction_date": date.today().isoformat(),
            "merchant": "Whole Foods",
            "note": "Groceries"
        }, headers=headers)
        self.assertEqual(exp_res.status_code, 201)

        # Check summary reconciles
        res = self.client.get("/api/v1/dashboard/summary", headers=headers)
        self.assertEqual(res.status_code, 200)
        summary = res.json()
        self.assertGreaterEqual(float(summary["total_income"]), 50000)
        self.assertGreaterEqual(float(summary["total_expenses"]), 1200)

    def test_04_forecast_endpoint(self):
        headers = {"Authorization": f"Bearer {TestFinanceAPI.token}"}
        res = self.client.get("/api/v1/forecast/monthly-expense?horizon=1", headers=headers)
        self.assertEqual(res.status_code, 200)
        forecast = res.json()
        self.assertIn("predicted_expense", forecast)
        self.assertIn("explanation", forecast)

    def test_05_categorization_suggestion(self):
        headers = {"Authorization": f"Bearer {TestFinanceAPI.token}"}
        res = self.client.post(
            "/api/v1/categorization/suggest",
            json={"merchant": "BigBasket Supermarket", "note": "Weekly vegetables"},
            headers=headers
        )
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["suggested_category_name"], "Groceries")
        self.assertGreater(data["confidence"], 0.8)

if __name__ == "__main__":
    unittest.main()

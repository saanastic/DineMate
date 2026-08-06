import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "./layouts/AppLayout";
import AuthPage from "./pages/AuthPage";
import DashboardPage from "./pages/DashboardPage";
import OrdersPage from "./pages/OrdersPage";
import TablesPage from "./pages/TablesPage";
import KitchenPage from "./pages/KitchenPage";
import AiPage from "./pages/AiPage";
import InventoryPage from "./pages/InventoryPage";
import CustomersPage from "./pages/CustomersPage";
import SettingsPage from "./pages/SettingsPage";
import NotFoundPage from "./pages/NotFoundPage";
import ReservationsPage from "./pages/ReservationsPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import ReportsPage from "./pages/ReportsPage";
import BillingPage from "./pages/BillingPage";
import ProfilePage from "./pages/ProfilePage";
import NotificationsPage from "./pages/NotificationsPage";
import HelpPage from "./pages/HelpPage";
import MenuPage from "./pages/MenuPage";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AuthPage />} />
        <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/tables" element={<TablesPage />} />
          <Route path="/kitchen" element={<ProtectedRoute roles={["chef","waiter"]}><KitchenPage /></ProtectedRoute>} />
          <Route path="/inventory" element={<InventoryPage />} />
          <Route path="/customers" element={<CustomersPage />} />
          <Route path="/ai" element={<AiPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/reservations" element={<ReservationsPage />} />
          <Route path="/analytics" element={<ProtectedRoute roles={["manager","admin"]}><AnalyticsPage /></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute roles={["manager","admin"]}><ReportsPage /></ProtectedRoute>} />
          <Route path="/billing" element={<ProtectedRoute roles={["manager","admin"]}><BillingPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/help" element={<HelpPage />} />
          <Route path="/menu" element={<MenuPage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

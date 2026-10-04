import { BrowserRouter, Routes, Route } from "react-router-dom";

import Layout from "./components/Layout";

// Auth Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

// Student Pages
import StudentDashboard from "./pages/StudentDashboard";
import StudentRequestForm from "./pages/StudentRequestForm";
import StudentHistory from "./pages/StudentHistory";
import StudentNotifications from "./pages/StudentNotifications";

// Parent Pages
import ParentDashboard from "./pages/ParentDashboard";
import ParentHistory from "./pages/ParentHistory";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ================= AUTH ROUTES ================= */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/student/login" element={<Login />} />
        <Route path="/parent/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        <Route
          path="/student/dashboard"
          element={
            <Layout>
              <StudentDashboard />
            </Layout>
          }
        />

        <Route
          path="/student/request"
          element={
            <Layout>
              <StudentRequestForm />
            </Layout>
          }
        />

        <Route
          path="/student/history"
          element={
            <Layout>
              <StudentHistory />
            </Layout>
          }
        />

        <Route
          path="/student/notifications"
          element={
            <Layout>
              <StudentNotifications />
            </Layout>
          }
        />


        {/* ================= PARENT ROUTES ================= */}

        <Route
          path="/parent/dashboard"
          element={
            <Layout>
              <ParentDashboard />
            </Layout>
          }
        />

        <Route
          path="/parent/history"
          element={
            <Layout>
              <ParentHistory />
            </Layout>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
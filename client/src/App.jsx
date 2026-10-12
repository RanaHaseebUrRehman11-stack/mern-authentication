import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ToastProvider } from "./contexts/ToastContext";

import { roleHome } from "./utils/roles";
import { FullPageLoader } from "./components/ui/Feedback";

import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicOnlyRoute from "./components/PublicOnlyRoute";

import Landing from "./pages/Landing";
import Login from "./pages/login";
import Register from "./pages/Register";
import RegisterMechanic from "./pages/RegisterMechanic";
import RegisterAdmin from "./pages/RegisterAdmin";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Vehicles from "./pages/Vehicles";
import ServiceRequests from "./pages/ServiceRequests";
import ServiceHistory from "./pages/ServiceHistory";
import NotFound from "./pages/NotFound";

import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageUsers from "./pages/admin/ManageUsers";
import ManageMechanics from "./pages/admin/ManageMechanics";
import ManageRequests from "./pages/admin/ManageRequests";

import MechanicDashboard from "./pages/mechanic/MechanicDashboard";
import MyJobs from "./pages/mechanic/MyJobs";
import MechanicProfile from "./pages/mechanic/MechanicProfile";

function HomeRedirect() {
    const { initializing, isAuthenticated, user } = useAuth();

    if (initializing) {
        return <FullPageLoader label="Loading..." />;
    }

    if (!isAuthenticated) {
        return <Landing />;
    }

    return <Navigate to={roleHome(user?.role)} replace />;
}

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <ToastProvider>
                    <Routes>
                        <Route element={<Layout />}>
                            <Route path="/" element={<HomeRedirect />} />

                            <Route
                                path="/login"
                                element={
                                    <PublicOnlyRoute>
                                        <Login />
                                    </PublicOnlyRoute>
                                }
                            />
                            <Route
                                path="/login/mechanic"
                                element={
                                    <PublicOnlyRoute>
                                        <Login expectedRole="mechanic" />
                                    </PublicOnlyRoute>
                                }
                            />
                            <Route
                                path="/login/admin"
                                element={
                                    <PublicOnlyRoute>
                                        <Login expectedRole="admin" />
                                    </PublicOnlyRoute>
                                }
                            />
                            <Route
                                path="/register"
                                element={
                                    <PublicOnlyRoute>
                                        <Register />
                                    </PublicOnlyRoute>
                                }
                            />
                            <Route
                                path="/register/mechanic"
                                element={
                                    <PublicOnlyRoute>
                                        <RegisterMechanic />
                                    </PublicOnlyRoute>
                                }
                            />
                            <Route
                                path="/register/admin"
                                element={
                                    <PublicOnlyRoute>
                                        <RegisterAdmin />
                                    </PublicOnlyRoute>
                                }
                            />

                            <Route
                                path="/dashboard"
                                element={
                                    <ProtectedRoute role="user">
                                        <Dashboard />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/profile"
                                element={
                                    <ProtectedRoute role="user">
                                        <Profile />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/vehicles"
                                element={
                                    <ProtectedRoute role="user">
                                        <Vehicles />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/service-requests"
                                element={
                                    <ProtectedRoute role="user">
                                        <ServiceRequests />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/history"
                                element={
                                    <ProtectedRoute role="user">
                                        <ServiceHistory />
                                    </ProtectedRoute>
                                }
                            />

                            <Route
                                path="/admin"
                                element={
                                    <ProtectedRoute role="admin">
                                        <AdminDashboard />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/admin/users"
                                element={
                                    <ProtectedRoute role="admin">
                                        <ManageUsers />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/admin/mechanics"
                                element={
                                    <ProtectedRoute role="admin">
                                        <ManageMechanics />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/admin/requests"
                                element={
                                    <ProtectedRoute role="admin">
                                        <ManageRequests />
                                    </ProtectedRoute>
                                }
                            />

                            <Route
                                path="/mechanic"
                                element={
                                    <ProtectedRoute role="mechanic">
                                        <MechanicDashboard />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/mechanic/jobs"
                                element={
                                    <ProtectedRoute role="mechanic">
                                        <MyJobs />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/mechanic/profile"
                                element={
                                    <ProtectedRoute role="mechanic">
                                        <MechanicProfile />
                                    </ProtectedRoute>
                                }
                            />

                            <Route path="*" element={<NotFound />} />
                        </Route>
                    </Routes>
                </ToastProvider>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;


import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import TripDetailsPage from './pages/TripDetailsPage';
import CheckoutPage from './pages/CheckoutPage';
import ConfirmationPage from './pages/ConfirmationPage';
const RegionPageLazy = React.lazy(() => import('./pages/RegionPage'));
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import ToursByRegionPage from './pages/ToursByRegionPage';
import AdminPage from './pages/AdminPage';
import AdminLayout from './components/admin/AdminLayout';
import AdminTrekEditorPage from './pages/AdminTrekEditorPage';
import AdminBookingsPage from './pages/AdminBookingsPage';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminSettingsPage from './pages/AdminSettingsPage';
import AdminTourViewPage from './pages/AdminTourViewPage';
import AdminBookingViewPage from './pages/AdminBookingViewPage';
import AdminUserViewPage from './pages/AdminUserViewPage';
import AdminUserEditorPage from './pages/AdminUserEditorPage';
import AdminToursPage from './pages/AdminToursPage';
import AdminBookingEditorPage from './pages/AdminBookingEditorPage';
import AdminCustomersPage from './pages/AdminCustomersPage';
import AdminCustomerViewPage from './pages/AdminCustomerViewPage';
import AdminCustomerEditorPage from './pages/AdminCustomerEditorPage';
import AdminBlogCreatePage from './pages/AdminBlogCreatePage';
import AdminBlogListPage from './pages/AdminBlogListPage';
import AdminRegionsPage from './pages/AdminRegionsPage';
import AdminRegionEditorPage from './pages/AdminRegionEditorPage';
import AdminMediaPage from './pages/AdminMediaPage';
import AdminTeamPage from './pages/AdminTeamPage';
import AdminTeamEditorPage from './pages/AdminTeamEditorPage';
import AdminTeamTypesPage from './pages/AdminTeamTypesPage';
import NotificationProvider from './components/common/NotificationSystem';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminResetPasswordPage from './pages/AdminResetPasswordPage';
import RequireAuth from './components/auth/RequireAuth';


const PublicRoutes = () => (
    <Layout>
        <React.Suspense fallback={<div className="p-6 text-center text-white">Loading region...</div>}>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/tours" element={<ToursByRegionPage />} />
            <Route path="/region/:regionName" element={<RegionPageLazy />} />
                <Route path="/trip/:slug" element={<TripDetailsPage />} />
                <Route path="/trek/:slug" element={<TripDetailsPage />} />
                <Route path="/booking/checkout" element={<CheckoutPage />} />
                <Route path="/booking/confirmed" element={<ConfirmationPage />} />
            </Routes>
        </React.Suspense>
    </Layout>
);

const AdminRoutes = () => (
     <NotificationProvider>
         <AdminLayout>
            <Routes>
                <Route path="/" element={<AdminPage />} />
                <Route path="/tours" element={<AdminToursPage />} />
                <Route path="/booking/view/:bookingId" element={<AdminBookingViewPage />} />
                <Route path="/booking/new" element={<AdminBookingEditorPage />} />
                <Route path="/booking/edit/:bookingId" element={<AdminBookingEditorPage />} />
                <Route path="/users" element={<AdminUsersPage />} />
                <Route path="/user/view/:userId" element={<AdminUserViewPage />} />
                <Route path="/user/new" element={<AdminUserEditorPage />} />
                <Route path="/user/edit/:userId" element={<AdminUserEditorPage />} />
                <Route path="/customers" element={<AdminCustomersPage />} />
                <Route path="/customer/view/:customerId" element={<AdminCustomerViewPage />} />
                <Route path="/customer/new" element={<AdminCustomerEditorPage />} />
                <Route path="/customer/edit/:customerId" element={<AdminCustomerEditorPage />} />
                <Route path="/blog" element={<AdminBlogListPage />} />
                <Route path="/blog/new" element={<AdminBlogCreatePage />} />
                <Route path="/bookings" element={<AdminBookingsPage />} />
                <Route path="/regions" element={<AdminRegionsPage />} />
                <Route path="/region/new" element={<AdminRegionEditorPage />} />
                <Route path="/region/edit/:regionId" element={<AdminRegionEditorPage />} />
                <Route path="/media" element={<AdminMediaPage />} />
                <Route path="/team" element={<AdminTeamPage />} />
                <Route path="/team/new" element={<AdminTeamEditorPage />} />
                <Route path="/team/edit/:memberId" element={<AdminTeamEditorPage />} />
                <Route path="/team-types" element={<AdminTeamTypesPage />} />
                <Route path="/settings" element={<AdminSettingsPage />} />
                <Route path="/trek/new" element={<AdminTrekEditorPage />} />
                <Route path="/trek/edit/:trekId" element={<AdminTrekEditorPage />} />
                <Route path="/trek/view/:trekId" element={<AdminTourViewPage />} />
            </Routes>
        </AdminLayout>
    </NotificationProvider>
);


const App: React.FC = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/admin/login" element={<AdminLoginPage />} />
                <Route path="/admin/reset-password" element={<AdminResetPasswordPage />} />
                <Route path="/admin/*" element={
                    <RequireAuth>
                        <AdminRoutes />
                    </RequireAuth>
                } />
                <Route path="/*" element={<PublicRoutes />} />
            </Routes>
        </BrowserRouter>
    );
};

export default App;

import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Loader } from '../components/Loader';
import { AdminLayout } from '../layouts/AdminLayout';
import { PlaceholderPage } from '../pages/Placeholder';
import { ProtectedRoute } from './ProtectedRoute';
import { GuestRoute } from './GuestRoute';

const LoginPage = lazy(() => import('../pages/Login'));
const DashboardPage = lazy(() => import('../pages/Dashboard'));
const UsersPage = lazy(() => import('../pages/Users'));
const CategoriesPage = lazy(() => import('../pages/Categories'));
const BrandsPage = lazy(() => import('../pages/Brands'));
const ProductsPage = lazy(() => import('../pages/Products'));
const ProductBulkDetailsPage = lazy(() => import('../pages/ProductBulkDetails'));
const ProductExtraChargesPage = lazy(() => import('../pages/ProductExtraCharges'));
const ProductAddOnsPage = lazy(() => import('../pages/ProductAddOns'));
const ProductCouponsPage = lazy(() => import('../pages/ProductCoupons'));
const ProductDiscountsPage = lazy(() => import('../pages/ProductDiscounts'));
const ProductActionsPage = lazy(() => import('../pages/ProductActions'));
const ProductFeedbackPage = lazy(() => import('../pages/ProductFeedback'));
const ReviewRatingPage = lazy(() => import('../pages/ReviewRating'));
const ProductHistoryPage = lazy(() => import('../pages/ProductHistory'));
const OrdersPage = lazy(() => import('../pages/Orders'));
const OrderStatusPage = lazy(() => import('../pages/OrderStatus'));
const PaymentStatusPage = lazy(() => import('../pages/PaymentStatus'));
const PaymentOptionsPage = lazy(() => import('../pages/PaymentOptions'));
const PointDistributionPage = lazy(() => import('../pages/PointDistribution'));
const PointPoolsPage = lazy(() => import('../pages/PointPools'));
const PointPoolDetailsPage = lazy(() => import('../pages/PointPoolDetails'));
const PointTransactionsPage = lazy(() => import('../pages/PointTransactions'));
const PointWalletsPage = lazy(() => import('../pages/PointWallets'));
const WalletPage = lazy(() => import('../pages/Wallet'));
const RewardMallCategoriesPage = lazy(() => import('../pages/RewardMallCategories'));
const RewardMallProductsPage = lazy(() => import('../pages/RewardMallProducts'));
const RewardMallPurchaseStatusPage = lazy(() => import('../pages/RewardMallPurchaseStatus'));
const RewardMallPurchasesPage = lazy(() => import('../pages/RewardMallPurchases'));
const NotificationsPage = lazy(() => import('../pages/Notifications'));
const NotificationCategoriesPage = lazy(() => import('../pages/NotificationCategories'));
const NotificationTypesPage = lazy(() => import('../pages/NotificationTypes'));
const UserTypesPage = lazy(() => import('../pages/UserTypes'));
const MembershipTypesPage = lazy(() => import('../pages/MembershipTypes'));
const RegistrationTypesPage = lazy(() => import('../pages/RegistrationTypes'));
const ProfilePage = lazy(() => import('../pages/Profile'));
const NotFoundPage = lazy(() => import('../pages/NotFound'));
const ForbiddenPage = lazy(() => import('../pages/Forbidden'));
const ServerErrorPage = lazy(() => import('../pages/ServerError'));

// Reports and Settings have no backing Admin API — see navConfig.tsx's
// `placeholder` flag on those two entries. Everything else in the sidebar
// now has a real page.
const PLACEHOLDER_ROUTES: { path: string; title: string }[] = [
  { path: '/reports', title: 'Reports' },
  { path: '/settings', title: 'Settings' },
];

function SuspenseFallback() {
  return <Loader fullPage label="Loading..." />;
}

export function AppRouter() {
  return (
    <Suspense fallback={<SuspenseFallback />}>
      <Routes>
        <Route
          path="/login"
          element={
            <GuestRoute>
              <LoginPage />
            </GuestRoute>
          }
        />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="catalog/categories" element={<CategoriesPage />} />
          <Route path="catalog/brands" element={<BrandsPage />} />
          <Route path="catalog/products" element={<ProductsPage />} />
          <Route path="catalog/product-bulk-details" element={<ProductBulkDetailsPage />} />
          <Route path="catalog/product-extra-charges" element={<ProductExtraChargesPage />} />
          <Route path="catalog/product-add-ons" element={<ProductAddOnsPage />} />
          <Route path="catalog/product-coupons" element={<ProductCouponsPage />} />
          <Route path="catalog/product-discounts" element={<ProductDiscountsPage />} />
          <Route path="catalog/product-actions" element={<ProductActionsPage />} />
          <Route path="catalog/product-feedback" element={<ProductFeedbackPage />} />
          <Route path="catalog/review-rating" element={<ReviewRatingPage />} />
          <Route path="catalog/product-history" element={<ProductHistoryPage />} />
          <Route path="wallet" element={<WalletPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="orders/order-status" element={<OrderStatusPage />} />
          <Route path="orders/payment-status" element={<PaymentStatusPage />} />
          <Route path="orders/payment-options" element={<PaymentOptionsPage />} />
          <Route path="points/distribution" element={<PointDistributionPage />} />
          <Route path="points/pools" element={<PointPoolsPage />} />
          <Route path="points/pool-details" element={<PointPoolDetailsPage />} />
          <Route path="points/transactions" element={<PointTransactionsPage />} />
          <Route path="points/wallets" element={<PointWalletsPage />} />
          <Route path="reward-mall/categories" element={<RewardMallCategoriesPage />} />
          <Route path="reward-mall/products" element={<RewardMallProductsPage />} />
          <Route path="reward-mall/purchase-status" element={<RewardMallPurchaseStatusPage />} />
          <Route path="reward-mall/purchases" element={<RewardMallPurchasesPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="notifications/categories" element={<NotificationCategoriesPage />} />
          <Route path="notifications/types" element={<NotificationTypesPage />} />
          <Route path="configuration/user-types" element={<UserTypesPage />} />
          <Route path="configuration/membership-types" element={<MembershipTypesPage />} />
          <Route path="configuration/registration-types" element={<RegistrationTypesPage />} />
          <Route path="profile" element={<ProfilePage />} />

          {PLACEHOLDER_ROUTES.map(({ path, title }) => (
            <Route key={path} path={path.slice(1)} element={<PlaceholderPage title={title} />} />
          ))}

          <Route path="403" element={<ForbiddenPage />} />
          <Route path="500" element={<ServerErrorPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}

import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { LanguageProvider } from './contexts/LanguageContext.jsx'
import ProtectedRoute from './components/ProtectedRoute'
import MainLayout from './layouts/MainLayout'
import AdminLayout from './layouts/AdminLayout'

import Welcome from './pages/welcome.jsx'
import Ebooks from './pages/Ebooks.jsx'
import Audiobooks from './pages/Audiobooks.jsx'
import Paperbacks from './pages/Paperbacks.jsx'
import Products from './pages/products.jsx'
import ProductDetails from './pages/product-details.jsx'
import CategoryBooks from './pages/category-books.jsx'

import CategoriesIndex from './pages/categories/index.jsx'
import CategoriesFilter from './pages/categories/filter.jsx'

import AuthorsIndex from './pages/authors/index.jsx'
import AuthorsShow from './pages/authors/show.jsx'

import CartIndex from './pages/cart/index.jsx'

import CheckoutAddress from './pages/checkout/address.jsx'
import CheckoutPayment from './pages/checkout/payment.jsx'
import CheckoutPaypal from './pages/checkout/paypal.jsx'
import CheckoutSuccess from './pages/checkout/success.jsx'
import SubscriptionsIndex from './pages/subscriptions/index.jsx'

import OrdersIndex from './pages/orders/index.jsx'
import OrdersShow from './pages/orders/show.jsx'

import WishlistIndex from './pages/wishlist/index.jsx'
import LibraryIndex from './pages/library/index.jsx'
import FaqIndex from './pages/faq/index.jsx'

import ProfileIndex from './pages/profile/index.jsx'
import ProfileEdit from './pages/profile/edit.jsx'

import AuthLogin from './pages/auth/login.jsx'
import AuthRegister from './pages/auth/register.jsx'
import AuthForgot from './pages/auth/forgot-password.jsx'
import AuthReset from './pages/auth/reset-password.jsx'
import Maintenance from './pages/maintenance.jsx'

import Dashboard from './pages/dashboard.jsx'
import AdminDashboard from './pages/admin/dashboard.jsx'
import AdminAuthorsIndex from './pages/admin/authors/index.jsx'
import AdminAuthorsCreate from './pages/admin/authors/create.jsx'
import AdminAuthorsEdit from './pages/admin/authors/edit.jsx'
import AdminAuthorsShow from './pages/admin/authors/show.jsx'
import AdminOrdersIndex from './pages/admin/orders/index.jsx'
import AdminOrdersShow from './pages/admin/orders/show.jsx'
import AdminUsersIndex from './pages/admin/users/index.jsx'
import AdminUsersCreate from './pages/admin/users/create.jsx'
import AdminUsersEdit from './pages/admin/users/edit.jsx'
import AdminUsersShow from './pages/admin/users/show.jsx'
import AdminPaymentsIndex from './pages/admin/payments/index.jsx'
import AdminReviewsIndex from './pages/admin/reviews/index.jsx'
import AdminNotificationsIndex from './pages/admin/notifications/index.jsx'
import AdminRolesIndex from './pages/admin/roles_permissions/index.jsx'
import AdminSettingsIndex from './pages/admin/settings/index.jsx'

import BooksIndex from './pages/admin/books/BooksIndex.jsx'
import BookCreate from './pages/admin/books/BookCreate.jsx'
import BookEdit from './pages/admin/books/BookEdit.jsx'
import BookShow from './pages/admin/books/BookShow.jsx'

const App = () => {
  return (
    <LanguageProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Welcome />} />
            <Route path="ebooks" element={<Ebooks />} />
            <Route path="audiobooks" element={<Audiobooks />} />
            <Route path="paperbacks" element={<Paperbacks />} />
            <Route path="products" element={<Products />} />
            <Route path="products/:id" element={<ProductDetails />} />
            <Route path="category/:slug" element={<CategoryBooks />} />
            <Route path="categories" element={<CategoriesIndex />} />
            <Route path="categories/filter" element={<CategoriesFilter />} />
            <Route path="authors" element={<AuthorsIndex />} />
            <Route path="authors/:id" element={<AuthorsShow />} />
            
            {/* Protected Routes */}
            <Route path="cart" element={
              <ProtectedRoute>
                <CartIndex />
              </ProtectedRoute>
            } />
            <Route path="checkout" element={
              <ProtectedRoute>
                <CheckoutAddress />
              </ProtectedRoute>
            } />
            <Route path="checkout/payment" element={
              <ProtectedRoute>
                <CheckoutPayment />
              </ProtectedRoute>
            } />
            <Route path="checkout/paypal" element={
              <ProtectedRoute>
                <CheckoutPaypal />
              </ProtectedRoute>
            } />
            <Route path="checkout/success" element={
              <ProtectedRoute>
                <CheckoutSuccess />
              </ProtectedRoute>
            } />
            <Route path="orders" element={
              <ProtectedRoute>
                <OrdersIndex />
              </ProtectedRoute>
            } />
            <Route path="orders/:id" element={
              <ProtectedRoute>
                <OrdersShow />
              </ProtectedRoute>
            } />
            <Route path="wishlist" element={
              <ProtectedRoute>
                <WishlistIndex />
              </ProtectedRoute>
            } />
            <Route path="my-library" element={
              <ProtectedRoute>
                <LibraryIndex />
              </ProtectedRoute>
            } />
            <Route path="profile" element={
              <ProtectedRoute>
                <ProfileIndex />
              </ProtectedRoute>
            } />
            <Route path="profile/edit" element={
              <ProtectedRoute>
                <ProfileEdit />
              </ProtectedRoute>
            } />
            <Route path="plans" element={
              <ProtectedRoute>
                <SubscriptionsIndex />
              </ProtectedRoute>
            } />
          </Route>
          
          {/* Public Auth Routes - Standalone (no header/footer) */}
          <Route path="login" element={<AuthLogin />} />
          <Route path="register" element={<AuthRegister />} />
          <Route path="forgot-password" element={<AuthForgot />} />
          <Route path="reset-password" element={<AuthReset />} />
          <Route path="maintenance" element={<Maintenance />} />
          <Route path="faq" element={<FaqIndex />} />
          
          {/* Standalone Protected Routes (no header/footer) */}
          <Route path="dashboard" element={
            <ProtectedRoute requiredPermission="access_dashboard">
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="orders" element={<ProtectedRoute requiredPermission="manage_orders"><AdminOrdersIndex /></ProtectedRoute>} />
            <Route path="orders/:id" element={<ProtectedRoute requiredPermission="manage_orders"><AdminOrdersShow /></ProtectedRoute>} />
            <Route path="payments" element={<ProtectedRoute requiredPermission="manage_payments"><AdminPaymentsIndex /></ProtectedRoute>} />
            <Route path="books" element={<ProtectedRoute requiredPermission="books.view"><BooksIndex /></ProtectedRoute>} />
            <Route path="books/create" element={<ProtectedRoute requiredPermission="books.create"><BookCreate /></ProtectedRoute>} />
            <Route path="books/:id" element={<ProtectedRoute requiredPermission="books.view"><BookShow /></ProtectedRoute>} />
            <Route path="books/:id/edit" element={<ProtectedRoute requiredPermission="books.edit"><BookEdit /></ProtectedRoute>} />
            <Route path="authors" element={<ProtectedRoute requiredPermission="authors.view"><AdminAuthorsIndex /></ProtectedRoute>} />
            <Route path="authors/create" element={<ProtectedRoute requiredPermission="authors.create"><AdminAuthorsCreate /></ProtectedRoute>} />
            <Route path="authors/:id" element={<ProtectedRoute requiredPermission="authors.view"><AdminAuthorsShow /></ProtectedRoute>} />
            <Route path="authors/:id/edit" element={<ProtectedRoute requiredPermission="authors.edit"><AdminAuthorsEdit /></ProtectedRoute>} />
            <Route path="reviews" element={<ProtectedRoute requiredPermission="manage_reviews"><AdminReviewsIndex /></ProtectedRoute>} />
            <Route path="users" element={<ProtectedRoute requiredPermission="users.view"><AdminUsersIndex /></ProtectedRoute>} />
            <Route path="users/create" element={<ProtectedRoute requiredPermission="users.create"><AdminUsersCreate /></ProtectedRoute>} />
            <Route path="users/:id" element={<ProtectedRoute requiredPermission="users.view"><AdminUsersShow /></ProtectedRoute>} />
            <Route path="users/:id/edit" element={<ProtectedRoute requiredPermission="users.edit"><AdminUsersEdit /></ProtectedRoute>} />
            <Route path="notifications" element={<ProtectedRoute requiredPermission="manage_notifications"><AdminNotificationsIndex /></ProtectedRoute>} />
            <Route path="roles-permissions" element={<ProtectedRoute requiredPermission="manage_roles_permissions"><AdminRolesIndex /></ProtectedRoute>} />
            <Route path="settings" element={<ProtectedRoute requiredRole="admin"><AdminSettingsIndex /></ProtectedRoute>} />
          </Route>

          {/* Admin Routes */}
          <Route path="/admin" element={
            <ProtectedRoute adminOnly={true}>
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route index element={<AdminDashboard />} />
            <Route path="books" element={<BooksIndex />} />
            <Route path="books/create" element={<BookCreate />} />
            <Route path="books/:id" element={<BookShow />} />
            <Route path="books/:id/edit" element={<BookEdit />} />
            <Route path="authors" element={<AdminAuthorsIndex />} />
            <Route path="authors/create" element={<AdminAuthorsCreate />} />
            <Route path="authors/:id" element={<AdminAuthorsShow />} />
            <Route path="authors/:id/edit" element={<AdminAuthorsEdit />} />
            <Route path="orders" element={<AdminOrdersIndex />} />
            <Route path="orders/:id" element={<AdminOrdersShow />} />
            <Route path="users" element={<AdminUsersIndex />} />
            <Route path="users/create" element={<AdminUsersCreate />} />
            <Route path="users/:id" element={<AdminUsersShow />} />
            <Route path="users/:id/edit" element={<AdminUsersEdit />} />
            <Route path="payments" element={<AdminPaymentsIndex />} />
            <Route path="reviews" element={<AdminReviewsIndex />} />
            <Route path="roles-permissions" element={<AdminRolesIndex />} />
            <Route path="settings" element={<AdminSettingsIndex />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
    </LanguageProvider>
  )
}

export default App

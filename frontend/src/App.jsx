import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import AdminLayout from './layouts/AdminLayout'

import Welcome from './pages/welcome.jsx'
import Home from './pages/home.jsx'
import About from './pages/about.jsx'
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

import AdminDashboard from './pages/admin/dashboard.jsx'
import AdminAuthorsIndex from './pages/admin/authors/index.jsx'
import AdminOrdersIndex from './pages/admin/orders/index.jsx'
import AdminOrdersShow from './pages/admin/orders/show.jsx'
import AdminUsersIndex from './pages/admin/users/index.jsx'
import AdminUsersCreate from './pages/admin/users/create.jsx'
import AdminUsersEdit from './pages/admin/users/edit.jsx'
import AdminPaymentsIndex from './pages/admin/payments/index.jsx'
import AdminReviewsIndex from './pages/admin/reviews/index.jsx'
import AdminRolesIndex from './pages/admin/roles_permissions/index.jsx'
import AdminSettingsIndex from './pages/admin/settings/index.jsx'

import BooksIndex from './pages/admin/books/BooksIndex.jsx'
import BookCreate from './pages/admin/books/BookCreate.jsx'
import BookEdit from './pages/admin/books/BookEdit.jsx'
import BookShow from './pages/admin/books/BookShow.jsx'

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Welcome />} />
          <Route path="home" element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="products" element={<Products />} />
          <Route path="products/:id" element={<ProductDetails />} />
          <Route path="category/:slug" element={<CategoryBooks />} />
          <Route path="categories" element={<CategoriesIndex />} />
          <Route path="categories/filter" element={<CategoriesFilter />} />
          <Route path="authors" element={<AuthorsIndex />} />
          <Route path="authors/:id" element={<AuthorsShow />} />
          <Route path="cart" element={<CartIndex />} />
          <Route path="checkout" element={<CheckoutAddress />} />
          <Route path="checkout/payment" element={<CheckoutPayment />} />
          <Route path="checkout/paypal" element={<CheckoutPaypal />} />
          <Route path="checkout/success" element={<CheckoutSuccess />} />
          <Route path="orders" element={<OrdersIndex />} />
          <Route path="orders/:id" element={<OrdersShow />} />
          <Route path="wishlist" element={<WishlistIndex />} />
          <Route path="my-library" element={<LibraryIndex />} />
          <Route path="faq" element={<FaqIndex />} />
          <Route path="profile" element={<ProfileIndex />} />
          <Route path="profile/edit" element={<ProfileEdit />} />
          <Route path="login" element={<AuthLogin />} />
          <Route path="register" element={<AuthRegister />} />
          <Route path="forgot-password" element={<AuthForgot />} />
          <Route path="reset-password" element={<AuthReset />} />
        </Route>

        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="books" element={<BooksIndex />} />
          <Route path="books/create" element={<BookCreate />} />
          <Route path="books/:id" element={<BookShow />} />
          <Route path="books/:id/edit" element={<BookEdit />} />
          <Route path="authors" element={<AdminAuthorsIndex />} />
          <Route path="orders" element={<AdminOrdersIndex />} />
          <Route path="orders/:id" element={<AdminOrdersShow />} />
          <Route path="users" element={<AdminUsersIndex />} />
          <Route path="users/create" element={<AdminUsersCreate />} />
          <Route path="users/:id/edit" element={<AdminUsersEdit />} />
          <Route path="payments" element={<AdminPaymentsIndex />} />
          <Route path="reviews" element={<AdminReviewsIndex />} />
          <Route path="roles-permissions" element={<AdminRolesIndex />} />
          <Route path="settings" element={<AdminSettingsIndex />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App

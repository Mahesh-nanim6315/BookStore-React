## Node Backend Migration Status

### Schema Foundation
- Knex migration setup added in `node-server` using Laravel migrations as schema reference.
- Migration files now cover core auth, catalog, commerce, engagement/admin, subscriptions/documents, and Laravel system tables.

### Completed
- Auth module
  - `POST /login`
  - `POST /register`
  - `POST /forgot-password`
  - `POST /reset-password`
  - `GET /user`
  - `POST /logout`
- Wishlist module
  - `GET /wishlist`
  - `POST /wishlist/toggle`
  - `DELETE /wishlist/:wishlistId`
- Subscription module
  - `POST /subscription/checkout`
  - `GET /subscription/success`
  - `POST /subscription/cancel`
  - `POST /subscription/resume`
- Payment module
  - `POST /payments/:orderId/process`
  - `GET /payments/stripe/checkout/:orderId`
  - `GET /payments/stripe/success/:orderId`
  - `GET /payments/stripe/cancel`
  - `GET /payments/paypal/:orderId/pay`
  - `GET /payments/paypal/:orderId/success`
  - `GET /payments/paypal/:orderId/cancel`

### In Progress
- Public catalog module
  - `GET /settings/public`
  - `GET /home`
  - `GET /products`
  - `GET /books`
  - `GET /books/:bookId`
  - `GET /books/:bookId/details`
  - `GET /ebooks`
  - `GET /audiobooks`
  - `GET /paperbacks`
  - `GET /categories`
  - `GET /category/:slug/books`
  - `GET /authors`
  - `GET /authors/:authorId`
  - `GET /faq`
  - `GET /plans`
  - `GET /about`

### Pending
- Profile
- Library
- Reviews
- Cart
- Orders
- Checkout
- Notifications
- Admin dashboard
- Admin books
- Admin authors
- Admin users
- Admin orders and payments
- Admin reviews
- Roles and permissions
- Admin settings
- Admin subscriptions

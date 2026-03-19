<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Session\Middleware\StartSession;
use App\Http\Controllers\Api\BookController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\AuthorController;
use App\Http\Controllers\Api\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Api\Admin\AuthorControllers as AdminAuthorController;
use App\Http\Controllers\Api\Admin\ReviewControllers as AdminReviewController;
use App\Http\Controllers\Api\Admin\RolePermissionController;
use App\Http\Controllers\Api\Admin\SettingsController as AdminSettingsController;
use App\Http\Controllers\Api\Admin\UserController as AdminUserController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\CheckoutController;
use App\Http\Controllers\Api\FaqController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\PayPalController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\StripeController;
use App\Http\Controllers\Api\RentController;
use App\Http\Controllers\Api\LibraryController;
use App\Http\Controllers\Api\WishlistController;
use App\Http\Controllers\Api\NewsletterController;
use App\Http\Controllers\Api\SubscriptionController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\SettingsController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\Admin\BookControllers as AdminBookController;
use App\Http\Controllers\Api\Admin\OrderControllers as AdminOrderController;

/* ================= PUBLIC ROUTES ================= */
Route::prefix('v1')->group(function () {
    
    // Authentication
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('/reset-password', [AuthController::class, 'resetPassword']);
    
    // Protected Routes
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/user', [AuthController::class, 'user']);
        Route::post('/logout', [AuthController::class, 'logout']);
    });
    
    // Home & Books
    Route::middleware(StartSession::class)->group(function () {
        Route::get('/home', [BookController::class, 'home']);
        Route::get('/books/{book}', [BookController::class, 'show']);
        Route::get('/books/{book}/details', [BookController::class, 'details']);
    });
    Route::get('/products', [ProductController::class, 'home']);
    Route::get('/books', [BookController::class, 'index']);
    
    // Format-based books
    Route::get('/ebooks', [ProductController::class, 'ebooks']);
    Route::get('/audiobooks', [ProductController::class, 'audiobooks']);
    Route::get('/paperbacks', [ProductController::class, 'paperbacks']);
    Route::get('/ebooks/category/{category:slug}', [BookController::class, 'categoryBooks']);
    
    // Categories
    Route::get('/categories', [BookController::class, 'categoriesIndex']);
    Route::get('/category/{category:slug}/books', [ProductController::class, 'categoryBooks']);
    
    // Authors
    Route::get('/authors', [AuthorController::class, 'index']);
    Route::get('/authors/{id}', [AuthorController::class, 'show']);
    
    // FAQ
    Route::get('/faq', [FaqController::class, 'index']);
    
    // Newsletter (public subscribe)
    Route::post('/newsletter/subscribe', [NewsletterController::class, 'subscribe']);
    
    // Subscription Plans
    Route::get('/plans', [SubscriptionController::class, 'index']);
    
    // About page data
    Route::get('/about', function () {
        return response()->json([
            'success' => true,
            'data' => [
                'content' => 'About page content here',
                'features' => [] // Add your about page data here
            ]
        ]);
    });
});

/* ================= AUTHENTICATED USER ROUTES ================= */
Route::prefix('v1')->middleware('auth:sanctum')->group(function () {
    
    // Profile
    Route::prefix('profile')->group(function () {
        Route::get('/', [ProfileController::class, 'index']);
        Route::put('/update', [ProfileController::class, 'update']);
        Route::post('/cover', [ProfileController::class, 'updateCover']);
        Route::post('/avatar', [ProfileController::class, 'updateAvatar']);
    });
    
    // Cart
    Route::middleware(StartSession::class)->prefix('cart')->group(function () {
        Route::post('/add/{book}', [CartController::class, 'add']);
        Route::get('/', [CartController::class, 'view']);
        Route::delete('/item/{item}', [CartController::class, 'remove']);
        Route::patch('/item/{item}', [CartController::class, 'update']);
        Route::post('/coupon', [CartController::class, 'applyCoupon']);
        Route::delete('/coupon', [CartController::class, 'removeCoupon']);
    });
    
    // Orders
    Route::prefix('orders')->group(function () {
        Route::get('/', [OrderController::class, 'index']);
        Route::post('/', [OrderController::class, 'store']);
        Route::get('/{order}', [OrderController::class, 'show']);
        Route::get('/{order}/success', [OrderController::class, 'success']);
        Route::get('/{order}/invoice', [OrderController::class, 'downloadInvoice']);
    });
    
    // Checkout
    Route::middleware(StartSession::class)->prefix('checkout')->group(function () {
        Route::get('/', [CheckoutController::class, 'index']);
        Route::post('/process', [CheckoutController::class, 'process']);
        Route::get('/payment/{order}', [CheckoutController::class, 'paymentPage']);
        Route::post('/payment/{order}', [CheckoutController::class, 'processPayment']);
        Route::post('/buy-now/{book}', [CheckoutController::class, 'buyNow']);
        Route::get('/{order}/address', [CheckoutController::class, 'addressBuyNow']);
        Route::post('/{order}/address', [CheckoutController::class, 'storeBuyNowAddress']);
    });
    
    // Reviews
    Route::prefix('reviews')->group(function () {
        Route::post('/books/{book}', [ReviewController::class, 'store']);
        Route::get('/{review}/edit', [ReviewController::class, 'edit']);
        Route::put('/{review}', [ReviewController::class, 'update']);
        Route::delete('/{review}', [ReviewController::class, 'destroy']);
    });
    
    // Rent
    Route::post('/ebook/rent/{book}', [RentController::class, 'rentEbook']);
    Route::post('/audio/rent/{book}', [RentController::class, 'rentAudio']);
    
    // Wishlist
    Route::prefix('wishlist')->group(function () {
        Route::get('/', [WishlistController::class, 'index']);
        Route::post('/toggle', [WishlistController::class, 'toggle']);
        Route::delete('/{wishlist}', [WishlistController::class, 'destroy']);
    });
    
    // Library
    Route::prefix('library')->group(function () {
        Route::get('/', [LibraryController::class, 'index']);
        Route::post('/add/{book}', [LibraryController::class, 'add']);
    });
    
    // Notifications
    Route::prefix('notifications')->group(function () {
        Route::get('/', [NotificationController::class, 'index']);
        Route::post('/{id}/read', [NotificationController::class, 'markAsRead']);
    });
    
    // Language preference
    Route::post('/lang/{locale}', function ($locale) {
        if (in_array($locale, ['en', 'hi', 'ta', 'te'])) {
            session(['locale' => $locale]);
            return response()->json(['success' => true, 'locale' => $locale]);
        }
        return response()->json(['success' => false, 'message' => 'Invalid locale'], 400);
    });
});

/* ================= PAYMENT ROUTES ================= */
Route::prefix('v1/payments')->middleware('auth:sanctum')->group(function () {
    
    // Stripe
    Route::prefix('stripe')->group(function () {
        Route::get('/checkout/{order}', [StripeController::class, 'checkout']);
        Route::get('/success/{order}', [StripeController::class, 'success']);
        Route::get('/cancel', [StripeController::class, 'cancel']);
    });
    
    // PayPal
    Route::prefix('paypal')->group(function () {
        Route::get('/{order}/pay', [PayPalController::class, 'pay']);
        Route::get('/{order}/success', [PayPalController::class, 'success']);
        Route::get('/{order}/cancel', [PayPalController::class, 'cancel']);
    });
    
    // General payment processing
    Route::post('/{order}/process', [PaymentController::class, 'process']);
});

/* ================= SUBSCRIPTION ROUTES ================= */
Route::prefix('v1/subscription')->middleware('auth:sanctum')->group(function () {
    Route::post('/checkout', [SubscriptionController::class, 'checkout']);
    Route::get('/success', [SubscriptionController::class, 'success']);
    Route::post('/cancel', [SubscriptionController::class, 'cancel']);
    Route::post('/resume', [SubscriptionController::class, 'resume']);
});

/* ================= ADMIN ROUTES ================= */
Route::prefix('v1/admin')->middleware(['auth:sanctum'])->group(function () {
    
    // Dashboard
    Route::get('/dashboard/stats', [AdminDashboardController::class, 'index'])->middleware('permission:access_dashboard');
    Route::get('/dashboard', [AdminDashboardController::class, 'dashboard'])->middleware('permission:access_dashboard');
    
    // Books Management
    Route::prefix('books')->group(function () {
        Route::get('/', [AdminBookController::class, 'index'])->middleware('permission:books.view');
        Route::get('/create', [AdminBookController::class, 'create'])->middleware('permission:books.create');
        Route::post('/', [AdminBookController::class, 'store'])->middleware('permission:books.create');
        Route::get('/{book}/edit', [AdminBookController::class, 'edit'])->middleware('permission:books.edit');
        Route::get('/{book}', [AdminBookController::class, 'show'])->middleware('permission:books.view');
        Route::put('/{book}', [AdminBookController::class, 'update'])->middleware('permission:books.edit');
        Route::delete('/{book}', [AdminBookController::class, 'destroy'])->middleware('permission:books.delete');
    });

    // Orders Management
    Route::prefix('orders')->group(function () {
        Route::get('/', [AdminOrderController::class, 'index'])->middleware('permission:manage_orders');
        Route::get('/export/csv', [AdminOrderController::class, 'exportCsv'])->middleware('permission:manage_orders');
        Route::get('/{id}', [AdminOrderController::class, 'show'])->middleware('permission:manage_orders');
        Route::put('/{order}', [AdminOrderController::class, 'update'])->middleware('permission:manage_orders');
        Route::put('/{id}/status', [AdminOrderController::class, 'updateStatus'])->middleware('permission:manage_orders');
        Route::put('/{id}/payment-status', [AdminOrderController::class, 'updatePaymentStatus'])->middleware('permission:manage_payments');
    });

    Route::get('/payments', [AdminOrderController::class, 'payments'])->middleware('permission:manage_payments');
    
    // Authors Management
    Route::prefix('authors')->group(function () {
        Route::get('/', [AdminAuthorController::class, 'index'])->middleware('permission:authors.view');
        Route::get('/create', [AdminAuthorController::class, 'create'])->middleware('permission:authors.create');
        Route::post('/', [AdminAuthorController::class, 'store'])->middleware('permission:authors.create');
        Route::get('/{author}/edit', [AdminAuthorController::class, 'edit'])->middleware('permission:authors.edit');
        Route::get('/{author}', [AdminAuthorController::class, 'show'])->middleware('permission:authors.view');
        Route::put('/{author}', [AdminAuthorController::class, 'update'])->middleware('permission:authors.edit');
        Route::delete('/{author}', [AdminAuthorController::class, 'destroy'])->middleware('permission:authors.delete');
    });
    
    // Users Management
    Route::prefix('users')->group(function () {
        Route::get('/', [AdminUserController::class, 'index'])->middleware('permission:users.view');
        Route::get('/create', [AdminUserController::class, 'create'])->middleware('permission:users.create');
        Route::post('/', [AdminUserController::class, 'store'])->middleware('permission:users.create');
        Route::get('/{user}/edit', [AdminUserController::class, 'edit'])->middleware('permission:users.edit');
        Route::get('/{user}', [AdminUserController::class, 'show'])->middleware('permission:users.view');
        Route::put('/{user}', [AdminUserController::class, 'update'])->middleware('permission:users.edit');
        Route::delete('/{user}', [AdminUserController::class, 'destroy'])->middleware('permission:users.delete');
    });
    
    // Orders Management
    /* Route::prefix('orders')->group(function () {
        Route::get('/', [AdminOrderController::class, 'index'])->middleware('permission:manage_orders');
        Route::get('/{id}', [AdminOrderController::class, 'show'])->middleware('permission:manage_orders');
        Route::put('/{order}', [AdminOrderController::class, 'update'])->middleware('permission:manage_orders');
        Route::put('/{id}/status', [AdminOrderController::class, 'updateStatus'])->middleware('permission:manage_orders');
        Route::put('/{id}/payment-status', [AdminOrderController::class, 'updatePaymentStatus'])->middleware('permission:manage_payments');
        Route::get('/export/csv', [AdminOrderController::class, 'exportCsv'])->middleware('permission:manage_orders');
    });
    
    // Payments Management
    Route::get('/payments', [AdminOrderController::class, 'payments'])->middleware('permission:manage_payments'); */
    
    // Reviews Management
    Route::prefix('reviews')->group(function () {
        Route::get('/', [AdminReviewController::class, 'index'])->middleware('permission:manage_reviews');
        Route::delete('/{review}', [AdminReviewController::class, 'destroy'])->middleware('permission:manage_reviews');
        Route::patch('/{review}/approve', [AdminReviewController::class, 'approve'])->middleware('permission:manage_reviews');
    });

    // Roles & Permissions
    Route::prefix('roles-permissions')->group(function () {
        Route::get('/', [RolePermissionController::class, 'index'])->middleware('permission:manage_roles_permissions');
        Route::put('/', [RolePermissionController::class, 'update'])->middleware('permission:manage_roles_permissions');
    });
    
    // Settings
    Route::prefix('settings')->group(function () {
        Route::get('/', [AdminSettingsController::class, 'index'])->middleware('role:admin');
        Route::post('/', [AdminSettingsController::class, 'update'])->middleware('role:admin');
    });
});

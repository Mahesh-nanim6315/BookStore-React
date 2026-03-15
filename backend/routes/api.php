<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\BookController;
use App\Http\Controllers\Api\AuthorController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\CheckoutController;
use App\Http\Controllers\Api\FaqController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\PayPalController;
use App\Http\Controllers\Api\ProductController;
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
use App\Http\Controllers\Api\Admin\DashboardController;
use App\Http\Controllers\Api\Admin\OrderController as AdminOrderController;
use App\Http\Controllers\Api\Admin\UserController;
use App\Http\Controllers\Api\Admin\BookController as AdminBookController;
use App\Http\Controllers\Api\Admin\AuthorController as AdminAuthorController;
use App\Http\Controllers\Api\Admin\ReviewController as AdminReviewController;
use App\Http\Controllers\Api\Admin\RolePermissionController;
use App\Http\Controllers\Api\Admin\SettingsController as AdminSettingsController;

/* ================= PUBLIC ROUTES ================= */
Route::prefix('v1')->group(function () {
    
    // Home & Books
    Route::get('/home', [BookController::class, 'home']);
    Route::get('/books', [BookController::class, 'index']);
    Route::get('/books/{book}', [BookController::class, 'show']);
    Route::get('/books/{book}/details', [BookController::class, 'details']);
    
    // Format-based books
    Route::get('/ebooks', [BookController::class, 'ebooks']);
    Route::get('/audiobooks', [BookController::class, 'audiobooks']);
    Route::get('/paperbacks', [BookController::class, 'paperbacks']);
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
    Route::prefix('cart')->group(function () {
        Route::get('/', [CartController::class, 'view']);
        Route::post('/add/{book}', [CartController::class, 'add']);
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
    Route::prefix('checkout')->group(function () {
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
        Route::get('/checkout/{order}', [PayPalController::class, 'checkout']);
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
Route::prefix('v1/admin')->middleware(['auth:sanctum', 'admin'])->group(function () {
    
    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index']);
    
    // Books Management
    Route::prefix('books')->group(function () {
        Route::get('/', [AdminBookController::class, 'index'])->middleware('permission:books.view');
        Route::post('/', [AdminBookController::class, 'store'])->middleware('permission:books.create');
        Route::get('/{book}', [AdminBookController::class, 'show'])->middleware('permission:books.view');
        Route::put('/{book}', [AdminBookController::class, 'update'])->middleware('permission:books.edit');
        Route::delete('/{book}', [AdminBookController::class, 'destroy'])->middleware('permission:books.delete');
    });
    
    // Authors Management
    Route::prefix('authors')->group(function () {
        Route::get('/', [AdminAuthorController::class, 'index'])->middleware('permission:authors.view');
        Route::post('/', [AdminAuthorController::class, 'store'])->middleware('permission:authors.create');
        Route::get('/{author}', [AdminAuthorController::class, 'show'])->middleware('permission:authors.view');
        Route::put('/{author}', [AdminAuthorController::class, 'update'])->middleware('permission:authors.edit');
        Route::delete('/{author}', [AdminAuthorController::class, 'destroy'])->middleware('permission:authors.delete');
    });
    
    // Users Management
    Route::prefix('users')->group(function () {
        Route::get('/', [UserController::class, 'index'])->middleware('permission:users.view');
        Route::post('/', [UserController::class, 'store'])->middleware('permission:users.create');
        Route::get('/{user}/edit', [UserController::class, 'edit'])->middleware('permission:users.edit');
        Route::put('/{user}', [UserController::class, 'update'])->middleware('permission:users.edit');
        Route::delete('/{user}', [UserController::class, 'destroy'])->middleware('permission:users.delete');
    });
    
    // Orders Management
    Route::prefix('orders')->group(function () {
        Route::get('/', [AdminOrderController::class, 'index'])->middleware('permission:manage_orders');
        Route::get('/{id}', [AdminOrderController::class, 'show'])->middleware('permission:manage_orders');
        Route::put('/{order}', [AdminOrderController::class, 'update'])->middleware('permission:manage_orders');
        Route::put('/{id}/status', [AdminOrderController::class, 'updateStatus'])->middleware('permission:manage_orders');
        Route::put('/{id}/payment-status', [AdminOrderController::class, 'updatePaymentStatus'])->middleware('permission:manage_payments');
        Route::get('/export/csv', [AdminOrderController::class, 'exportCsv'])->middleware('permission:manage_orders');
    });
    
    // Payments Management
    Route::get('/payments', [AdminOrderController::class, 'payments'])->middleware('permission:manage_payments');
    
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
        Route::get('/', [AdminSettingsController::class, 'index']);
        Route::post('/', [AdminSettingsController::class, 'update']);
    });
});
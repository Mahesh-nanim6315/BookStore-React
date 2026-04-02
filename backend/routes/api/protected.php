<?php

use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\CheckoutController;
use App\Http\Controllers\Api\LibraryController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\PayPalController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\RentController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\StripeController;
use App\Http\Controllers\Api\SubscriptionController;
use App\Http\Controllers\Api\WishlistController;
use Illuminate\Session\Middleware\StartSession;
use Illuminate\Support\Facades\Route;

// Profile
Route::prefix('profile')->group(function () {
    Route::get('/', [ProfileController::class, 'index']);
    Route::put('/update', [ProfileController::class, 'update']);
    Route::post('/cover', [ProfileController::class, 'updateCover']);
    Route::post('/avatar', [ProfileController::class, 'updateAvatar']);
});

// Rentals
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

        return response()->json([
            'success' => true,
            'locale' => $locale,
        ]);
    }

    return response()->json([
        'success' => false,
        'message' => 'Invalid locale',
    ], 400);
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

// Payments
Route::prefix('payments')->group(function () {
    Route::prefix('stripe')->group(function () {
        Route::get('/checkout/{order}', [StripeController::class, 'checkout']);
        Route::get('/success/{order}', [StripeController::class, 'success']);
        Route::get('/cancel', [StripeController::class, 'cancel']);
    });

    Route::prefix('paypal')->group(function () {
        Route::get('/{order}/pay', [PayPalController::class, 'pay']);
        Route::get('/{order}/success', [PayPalController::class, 'success']);
        Route::get('/{order}/cancel', [PayPalController::class, 'cancel']);
    });

    Route::post('/{order}/process', [PaymentController::class, 'process']);
});

// Subscription
Route::prefix('subscription')->group(function () {
    Route::post('/checkout', [SubscriptionController::class, 'checkout']);
    Route::get('/success', [SubscriptionController::class, 'success']);
    Route::post('/cancel', [SubscriptionController::class, 'cancel']);
    Route::post('/resume', [SubscriptionController::class, 'resume']);
});
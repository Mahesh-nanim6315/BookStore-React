<?php

use App\Http\Controllers\Api\AuthorController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BookController;
use App\Http\Controllers\Api\FaqController;
use App\Http\Controllers\Api\NewsletterController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\PublicSettingsController;
use App\Http\Controllers\Api\SubscriptionController;
use Illuminate\Session\Middleware\StartSession;
use Illuminate\Support\Facades\Route;

// Public settings
Route::get('/settings/public', [PublicSettingsController::class, 'index']);

// Catalog
Route::middleware(StartSession::class)->group(function () {
    Route::get('/home', [BookController::class, 'home']);
    Route::get('/books/{book}', [BookController::class, 'show']);
    Route::get('/books/{book}/details', [BookController::class, 'details']);
});

Route::get('/products', [ProductController::class, 'home']);
Route::get('/books', [BookController::class, 'index']);
Route::get('/ebooks', [ProductController::class, 'ebooks']);
Route::get('/audiobooks', [ProductController::class, 'audiobooks']);
Route::get('/paperbacks', [ProductController::class, 'paperbacks']);
Route::get('/ebooks/category/{category:slug}', [BookController::class, 'categoryBooks']);

// Categories and authors
Route::get('/categories', [BookController::class, 'categoriesIndex']);
Route::get('/category/{category:slug}/books', [ProductController::class, 'categoryBooks']);
Route::get('/authors', [AuthorController::class, 'index']);
Route::get('/authors/{id}', [AuthorController::class, 'show']);

// Support and marketing
Route::get('/faq', [FaqController::class, 'index']);
Route::post('/newsletter/subscribe', [NewsletterController::class, 'subscribe']);
Route::get('/plans', [SubscriptionController::class, 'index']);


Route::get('/about', function () {
    return response()->json([
        'success' => true,
        'data' => [
            'content' => 'About page content here',
            'features' => [], // Add your about page data here
        ],
    ]);
});

// Authentication
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);
});

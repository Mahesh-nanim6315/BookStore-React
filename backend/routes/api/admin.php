<?php

use App\Http\Controllers\Api\Admin\AuthorControllers as AdminAuthorController;
use App\Http\Controllers\Api\Admin\BookControllers as AdminBookController;
use App\Http\Controllers\Api\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Api\Admin\OrderControllers as AdminOrderController;
use App\Http\Controllers\Api\Admin\ReviewControllers as AdminReviewController;
use App\Http\Controllers\Api\Admin\RolePermissionController;
use App\Http\Controllers\Api\Admin\SettingsController as AdminSettingsController;
use App\Http\Controllers\Api\Admin\SubscriptionController as AdminSubscriptionController;
use App\Http\Controllers\Api\Admin\UserController as AdminUserController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1/admin')->middleware(['auth:sanctum', 'maintenance'])->group(function () {
    // Dashboard
    Route::get('/dashboard/stats', [AdminDashboardController::class, 'index'])
        ->middleware('permission:access_dashboard');
    Route::get('/dashboard', [AdminDashboardController::class, 'dashboard'])
        ->middleware('permission:access_dashboard');

    // Books
    Route::prefix('books')->group(function () {
        Route::get('/', [AdminBookController::class, 'index'])->middleware('permission:books.view');
        Route::get('/create', [AdminBookController::class, 'create'])->middleware('permission:books.create');
        Route::post('/', [AdminBookController::class, 'store'])->middleware('permission:books.create');
        Route::get('/{book}/edit', [AdminBookController::class, 'edit'])->middleware('permission:books.edit');
        Route::get('/{book}', [AdminBookController::class, 'show'])->middleware('permission:books.view');
        Route::put('/{book}', [AdminBookController::class, 'update'])->middleware('permission:books.edit');
        Route::delete('/{book}', [AdminBookController::class, 'destroy'])->middleware('permission:books.delete');
    });

    // Orders
    Route::prefix('orders')->group(function () {
        Route::get('/', [AdminOrderController::class, 'index'])->middleware('permission:manage_orders');
        Route::get('/export/csv', [AdminOrderController::class, 'exportCsv'])->middleware('permission:manage_orders');
        Route::get('/{id}', [AdminOrderController::class, 'show'])->middleware('permission:manage_orders');
        Route::put('/{order}', [AdminOrderController::class, 'update'])->middleware('permission:manage_orders');
        Route::put('/{id}/status', [AdminOrderController::class, 'updateStatus'])->middleware('permission:manage_orders');
        Route::put('/{id}/payment-status', [AdminOrderController::class, 'updatePaymentStatus'])
            ->middleware('permission:manage_payments');
    });

    Route::get('/payments', [AdminOrderController::class, 'payments'])
        ->middleware('permission:manage_payments');

    // Authors
    Route::prefix('authors')->group(function () {
        Route::get('/', [AdminAuthorController::class, 'index'])->middleware('permission:authors.view');
        Route::get('/create', [AdminAuthorController::class, 'create'])->middleware('permission:authors.create');
        Route::post('/', [AdminAuthorController::class, 'store'])->middleware('permission:authors.create');
        Route::get('/{author}/edit', [AdminAuthorController::class, 'edit'])->middleware('permission:authors.edit');
        Route::get('/{author}', [AdminAuthorController::class, 'show'])->middleware('permission:authors.view');
        Route::put('/{author}', [AdminAuthorController::class, 'update'])->middleware('permission:authors.edit');
        Route::delete('/{author}', [AdminAuthorController::class, 'destroy'])->middleware('permission:authors.delete');
    });

    // Users
    Route::prefix('users')->group(function () {
        Route::get('/', [AdminUserController::class, 'index'])->middleware('permission:users.view');
        Route::get('/create', [AdminUserController::class, 'create'])->middleware('permission:users.create');
        Route::post('/', [AdminUserController::class, 'store'])->middleware('permission:users.create');
        Route::get('/{user}/edit', [AdminUserController::class, 'edit'])->middleware('permission:users.edit');
        Route::get('/{user}', [AdminUserController::class, 'show'])->middleware('permission:users.view');
        Route::put('/{user}', [AdminUserController::class, 'update'])->middleware('permission:users.edit');
        Route::delete('/{user}', [AdminUserController::class, 'destroy'])->middleware('permission:users.delete');
    });

    // Reviews
    Route::prefix('reviews')->group(function () {
        Route::get('/', [AdminReviewController::class, 'index'])->middleware('permission:manage_reviews');
        Route::delete('/{review}', [AdminReviewController::class, 'destroy'])->middleware('permission:manage_reviews');
        Route::patch('/{review}/approve', [AdminReviewController::class, 'approve'])
            ->middleware('permission:manage_reviews');
    });

    // Subscriptions
    Route::prefix('subscriptions')->group(function () {
        Route::get('/', [AdminSubscriptionController::class, 'index'])->middleware('permission:access_dashboard');
        Route::post('/{user}/cancel', [AdminSubscriptionController::class, 'cancel'])->middleware('permission:access_dashboard');
        Route::post('/{user}/resume', [AdminSubscriptionController::class, 'resume'])->middleware('permission:access_dashboard');
        Route::delete('/{user}', [AdminSubscriptionController::class, 'destroy'])->middleware('permission:access_dashboard');
    });

    // Roles and permissions
    Route::prefix('roles-permissions')->group(function () {
        Route::get('/', [RolePermissionController::class, 'index'])
            ->middleware('permission:manage_roles_permissions');
        Route::put('/', [RolePermissionController::class, 'update'])
            ->middleware('permission:manage_roles_permissions');
    });

    // Settings
    Route::prefix('settings')->group(function () {
        Route::get('/', [AdminSettingsController::class, 'index'])->middleware('role:admin');
        Route::post('/', [AdminSettingsController::class, 'update'])->middleware('role:admin');
    });
});
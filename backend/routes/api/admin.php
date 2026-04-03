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

const ACCESS_DASHBOARD_PERMISSION = 'permission:access_dashboard';
const MANAGE_ORDERS_PERMISSION = 'permission:manage_orders';
const MANAGE_PAYMENTS_PERMISSION = 'permission:manage_payments';
const BOOKS_VIEW_PERMISSION = 'permission:books.view';
const BOOKS_CREATE_PERMISSION = 'permission:books.create';
const BOOKS_EDIT_PERMISSION = 'permission:books.edit';
const BOOKS_DELETE_PERMISSION = 'permission:books.delete';
const AUTHORS_VIEW_PERMISSION = 'permission:authors.view';
const AUTHORS_CREATE_PERMISSION = 'permission:authors.create';
const AUTHORS_EDIT_PERMISSION = 'permission:authors.edit';
const AUTHORS_DELETE_PERMISSION = 'permission:authors.delete';
const USERS_VIEW_PERMISSION = 'permission:users.view';
const USERS_CREATE_PERMISSION = 'permission:users.create';
const USERS_EDIT_PERMISSION = 'permission:users.edit';
const USERS_DELETE_PERMISSION = 'permission:users.delete';
const MANAGE_REVIEWS_PERMISSION = 'permission:manage_reviews';
const MANAGE_ROLES_PERMISSIONS = 'permission:manage_roles_permissions';
const ADMIN_ROLE_MIDDLEWARE = 'role:admin';
const CREATE_ROUTE = '/create';
const BOOK_RESOURCE_ROUTE = '/{book}';
const AUTHOR_RESOURCE_ROUTE = '/{author}';
const USER_RESOURCE_ROUTE = '/{user}';

Route::prefix('v1/admin')->middleware(['auth:sanctum', 'maintenance'])->group(function () {
    // Dashboard
    Route::get('/dashboard/stats', [AdminDashboardController::class, 'index'])
        ->middleware(ACCESS_DASHBOARD_PERMISSION);
    Route::get('/dashboard', [AdminDashboardController::class, 'dashboard'])
        ->middleware(ACCESS_DASHBOARD_PERMISSION);

    // Books
    Route::prefix('books')->group(function () {
        Route::get('/', [AdminBookController::class, 'index'])->middleware(BOOKS_VIEW_PERMISSION);
        Route::get(CREATE_ROUTE, [AdminBookController::class, 'create'])->middleware(BOOKS_CREATE_PERMISSION);
        Route::post('/', [AdminBookController::class, 'store'])->middleware(BOOKS_CREATE_PERMISSION);
        Route::get('/{book}/edit', [AdminBookController::class, 'edit'])->middleware(BOOKS_EDIT_PERMISSION);
        Route::get(BOOK_RESOURCE_ROUTE, [AdminBookController::class, 'show'])->middleware(BOOKS_VIEW_PERMISSION);
        Route::put(BOOK_RESOURCE_ROUTE, [AdminBookController::class, 'update'])->middleware(BOOKS_EDIT_PERMISSION);
        Route::delete(BOOK_RESOURCE_ROUTE, [AdminBookController::class, 'destroy'])->middleware(BOOKS_DELETE_PERMISSION);
    });

    // Orders
    Route::prefix('orders')->group(function () {
        Route::get('/', [AdminOrderController::class, 'index'])->middleware(MANAGE_ORDERS_PERMISSION);
        Route::get('/export/csv', [AdminOrderController::class, 'exportCsv'])->middleware(MANAGE_ORDERS_PERMISSION);
        Route::get('/{id}', [AdminOrderController::class, 'show'])->middleware(MANAGE_ORDERS_PERMISSION);
        Route::put('/{order}', [AdminOrderController::class, 'update'])->middleware(MANAGE_ORDERS_PERMISSION);
        Route::put('/{id}/status', [AdminOrderController::class, 'updateStatus'])->middleware(MANAGE_ORDERS_PERMISSION);
        Route::put('/{id}/payment-status', [AdminOrderController::class, 'updatePaymentStatus'])
            ->middleware(MANAGE_PAYMENTS_PERMISSION);
    });

    Route::get('/payments', [AdminOrderController::class, 'payments'])
        ->middleware(MANAGE_PAYMENTS_PERMISSION);

    // Authors
    Route::prefix('authors')->group(function () {
        Route::get('/', [AdminAuthorController::class, 'index'])->middleware(AUTHORS_VIEW_PERMISSION);
        Route::get(CREATE_ROUTE, [AdminAuthorController::class, 'create'])->middleware(AUTHORS_CREATE_PERMISSION);
        Route::post('/', [AdminAuthorController::class, 'store'])->middleware(AUTHORS_CREATE_PERMISSION);
        Route::get('/{author}/edit', [AdminAuthorController::class, 'edit'])->middleware(AUTHORS_EDIT_PERMISSION);
        Route::get(AUTHOR_RESOURCE_ROUTE, [AdminAuthorController::class, 'show'])->middleware(AUTHORS_VIEW_PERMISSION);
        Route::put(AUTHOR_RESOURCE_ROUTE, [AdminAuthorController::class, 'update'])->middleware(AUTHORS_EDIT_PERMISSION);
        Route::delete(AUTHOR_RESOURCE_ROUTE, [AdminAuthorController::class, 'destroy'])->middleware(AUTHORS_DELETE_PERMISSION);
    });

    // Users
    Route::prefix('users')->group(function () {
        Route::get('/', [AdminUserController::class, 'index'])->middleware(USERS_VIEW_PERMISSION);
        Route::get(CREATE_ROUTE, [AdminUserController::class, 'create'])->middleware(USERS_CREATE_PERMISSION);
        Route::post('/', [AdminUserController::class, 'store'])->middleware(USERS_CREATE_PERMISSION);
        Route::get('/{user}/edit', [AdminUserController::class, 'edit'])->middleware(USERS_EDIT_PERMISSION);
        Route::get(USER_RESOURCE_ROUTE, [AdminUserController::class, 'show'])->middleware(USERS_VIEW_PERMISSION);
        Route::put(USER_RESOURCE_ROUTE, [AdminUserController::class, 'update'])->middleware(USERS_EDIT_PERMISSION);
        Route::delete(USER_RESOURCE_ROUTE, [AdminUserController::class, 'destroy'])->middleware(USERS_DELETE_PERMISSION);
    });

    // Reviews
    Route::prefix('reviews')->group(function () {
        Route::get('/', [AdminReviewController::class, 'index'])->middleware(MANAGE_REVIEWS_PERMISSION);
        Route::delete('/{review}', [AdminReviewController::class, 'destroy'])->middleware(MANAGE_REVIEWS_PERMISSION);
        Route::patch('/{review}/approve', [AdminReviewController::class, 'approve'])
            ->middleware(MANAGE_REVIEWS_PERMISSION);
    });

    // Subscriptions
    Route::prefix('subscriptions')->group(function () {
        Route::get('/', [AdminSubscriptionController::class, 'index'])->middleware(ACCESS_DASHBOARD_PERMISSION);
        Route::post(USER_RESOURCE_ROUTE . '/cancel', [AdminSubscriptionController::class, 'cancel'])->middleware(ACCESS_DASHBOARD_PERMISSION);
        Route::post(USER_RESOURCE_ROUTE . '/resume', [AdminSubscriptionController::class, 'resume'])->middleware(ACCESS_DASHBOARD_PERMISSION);
        Route::delete(USER_RESOURCE_ROUTE, [AdminSubscriptionController::class, 'destroy'])->middleware(ACCESS_DASHBOARD_PERMISSION);
    });

    // Roles and permissions
    Route::prefix('roles-permissions')->group(function () {
        Route::get('/', [RolePermissionController::class, 'index'])
            ->middleware(MANAGE_ROLES_PERMISSIONS);
        Route::put('/', [RolePermissionController::class, 'update'])
            ->middleware(MANAGE_ROLES_PERMISSIONS);
    });

    // Settings
    Route::prefix('settings')->group(function () {
        Route::get('/', [AdminSettingsController::class, 'index'])->middleware(ADMIN_ROLE_MIDDLEWARE);
        Route::post('/', [AdminSettingsController::class, 'update'])->middleware(ADMIN_ROLE_MIDDLEWARE);
    });
});

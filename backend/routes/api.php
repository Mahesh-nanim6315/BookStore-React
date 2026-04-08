<?php

use Illuminate\Support\Facades\Route;

Route::prefix('v1')->middleware('maintenance')->group(function () {
    require_once __DIR__.'/api/public.php';
});

Route::prefix('v1')->middleware(['auth:sanctum', 'maintenance'])->group(function () {
    require_once __DIR__.'/api/protected.php';
});
require_once __DIR__.'/api/admin.php'; 

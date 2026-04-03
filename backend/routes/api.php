<?php

use Illuminate\Support\Facades\Route;

Route::prefix('v1')->middleware('maintenance')->group(function () {
    Route::group(__DIR__.'/api/public.php');
});


Route::prefix('v1')->middleware(['auth:sanctum', 'maintenance'])->group(function () {
    Route::group(__DIR__.'/api/protected.php');
});

Route::group(__DIR__.'/api/admin.php');

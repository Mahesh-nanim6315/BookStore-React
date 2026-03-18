<?php

use Illuminate\Support\Facades\Route;

/* Authentication Routes */
Route::get('/login', function () {
    return view('auth.login');
})->name('login');

/* Handle audio files from storage */
Route::get('/storage/{path}', function ($path) {
    $fullPath = storage_path('app/public/' . $path);
    
    if (!file_exists($fullPath)) {
        return response()->json(['error' => 'Audio file not found'], 404);
    }
    
    // Check if it's an audio file
    $allowedExtensions = ['mp3', 'wav', 'm4a', 'aac'];
    $extension = strtolower(pathinfo($fullPath, PATHINFO_EXTENSION));
    
    if (!in_array($extension, $allowedExtensions)) {
        return response()->json(['error' => 'File type not allowed'], 403);
    }
    
    $fileContents = file_get_contents($fullPath);
    $mimeType = mime_content_type($fullPath);
    
    return response($fileContents)
        ->header('Content-Type', $mimeType)
        ->header('Content-Length', strlen($fileContents));
})->where('path', '.*');

// Add other essential web routes as needed
Route::get('/', function () {
    return view('welcome');
})->name('home');

// web.php

<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Author;
use Illuminate\Http\Request;

class AuthorController extends Controller
{
    public function index()
    {
        try {
            $authors = Author::all();
            
            return response()->json([
                'success' => true,
                'data' => $authors
            ]);
            } catch (\Throwable $e) {
                $this->logRequestErrorAuto($e);

                return response()->json([
                'success' => false,
                'message' => 'An error occurred while loading authors.'
            ], 500);
        }
    }

    public function show($id)
    {
        try {
            $author = Author::with('books')->findOrFail($id);
            
            return response()->json([
                'success' => true,
                'data' => $author
            ]);
            } catch (\Throwable $e) {
                $this->logRequestErrorAuto($e);

                return response()->json([
                'success' => false,
                'message' => 'An error occurred while loading author details.'
            ], 500);
        }
    }
}
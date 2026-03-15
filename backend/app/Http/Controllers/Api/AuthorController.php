<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Author;
use Illuminate\Http\Request;

class AuthorController extends Controller
{
    public function index()
    {
        $authors = Author::all();
        
        return response()->json([
            'success' => true,
            'data' => $authors
        ]);
    }

    public function show($id)
    {
        $author = Author::with('books')->findOrFail($id);
        
        return response()->json([
            'success' => true,
            'data' => $author
        ]);
    }
}
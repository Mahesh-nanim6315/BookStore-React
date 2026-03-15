<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Author;
use Illuminate\Http\Request;

class AuthorControllers extends Controller
{
    public function index(Request $request)
    {
        $query = Author::withCount('books');

        // 🔍 Search by name
        if ($request->filled('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        // 🎯 Filter by minimum books
        if ($request->filled('min_books')) {
            $query->having('books_count', '>=', $request->min_books);
        }

        $authors = $query->latest()->paginate(10);

        return response()->json([
            'success' => true,
            'data' => $authors
        ]);
    }

    public function create()
    {
        return response()->json([
            'success' => true,
            'data' => [
                'message' => 'Author creation form data'
            ]
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'image' => 'nullable|url',
            'bio' => 'nullable|string',
        ]);

        $author = Author::create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Author created successfully',
            'data' => [
                'author' => $author
            ]
        ]);
    }

    public function show(Author $author)
    {
        $author->loadCount('books');
        
        return response()->json([
            'success' => true,
            'data' => [
                'author' => $author
            ]
        ]);
    }

    public function edit(Author $author)
    {
        return response()->json([
            'success' => true,
            'data' => [
                'author' => $author
            ]
        ]);
    }

    public function update(Request $request, Author $author)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'image' => 'nullable|url',
            'bio' => 'nullable|string',
        ]);

        $author->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Author updated successfully',
            'data' => [
                'author' => $author->fresh()
            ]
        ]);
    }

    public function destroy(Author $author)
    {
        $author->delete();

        return response()->json([
            'success' => true,
            'message' => 'Author deleted successfully'
        ]);
    }
}
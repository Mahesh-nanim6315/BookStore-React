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
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'image' => 'nullable|url',
            'bio' => 'nullable|string',
        ]);

        $validated['name'] = trim((string) $validated['name']);
        $validated['image'] = isset($validated['image']) ? trim((string) $validated['image']) : null;
        $validated['bio'] = isset($validated['bio']) ? trim((string) $validated['bio']) : null;

        $author = Author::create($validated);

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
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'image' => 'nullable|url',
            'bio' => 'nullable|string',
        ]);

        $validated['name'] = trim((string) $validated['name']);
        $validated['image'] = isset($validated['image']) ? trim((string) $validated['image']) : null;
        $validated['bio'] = isset($validated['bio']) ? trim((string) $validated['bio']) : null;

        $author->update($validated);

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

<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Author;
use Illuminate\Http\Request;

class AuthorControllers extends Controller
{
    public function index(Request $request)
    {
        try {
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
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('AuthorControllers.index: ' . $e->getMessage() . ' on line ' . $e->getLine());
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while loading authors.'
            ], 500);
        }
    }

    public function create()
    {
        try {
            return response()->json([
                'success' => true,
                'data' => [
                    'message' => 'Author creation form data'
                ]
            ]);
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('AuthorControllers.create: ' . $e->getMessage() . ' on line ' . $e->getLine());
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while loading create form.'
            ], 500);
        }
    }

    public function store(Request $request)
    {
        try {
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
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('AuthorControllers.store: ' . $e->getMessage() . ' on line ' . $e->getLine());
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while creating the author.'
            ], 500);
        }
    }

    public function show(Author $author)
    {
        try {
            $author->loadCount('books');

            return response()->json([
                'success' => true,
                'data' => [
                    'author' => $author
                ]
            ]);
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('AuthorControllers.show: ' . $e->getMessage() . ' on line ' . $e->getLine());
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while loading the author.'
            ], 500);
        }
    }

    public function edit(Author $author)
    {
        try {
            return response()->json([
                'success' => true,
                'data' => [
                    'author' => $author
                ]
            ]);
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('AuthorControllers.edit: ' . $e->getMessage() . ' on line ' . $e->getLine());
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while loading edit form.'
            ], 500);
        }
    }

    public function update(Request $request, Author $author)
    {
        try {
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
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('AuthorControllers.update: ' . $e->getMessage() . ' on line ' . $e->getLine());
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while updating the author.'
            ], 500);
        }
    }

    public function destroy(Author $author)
    {
        try {
            $author->delete();

            return response()->json([
                'success' => true,
                'message' => 'Author deleted successfully'
            ]);
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('AuthorControllers.destroy: ' . $e->getMessage() . ' on line ' . $e->getLine());
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while deleting the author.'
            ], 500);
        }
    }
}

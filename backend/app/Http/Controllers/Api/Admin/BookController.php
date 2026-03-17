<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Book;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class BookController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Book::with(['author', 'category', 'genre']);

        if ($request->has('search')) {
            $search = $request->search;
            $query->where('name', 'like', "%{$search}%");
        }

        $books = $query->latest()->paginate(15);
        
        return response()->json($books);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'author_id' => 'required|exists:authors,id',
            'category_id' => 'required|exists:categories,id',
            'genre_id' => 'required|exists:genres,id',
            'language' => 'nullable|string|max:50',
            'price' => 'required|numeric|min:0',
            'stock' => 'nullable|integer|min:0',
            'image' => 'nullable|image|max:2048',
            
            // Format specifics
            'has_ebook' => 'boolean',
            'ebook_price' => 'nullable|numeric|min:0',
            'ebook_pages' => 'nullable|integer|min:0',
            
            'has_audio' => 'boolean',
            'audio_price' => 'nullable|numeric|min:0',
            'audio_minutes' => 'nullable|integer|min:0',
            
            'has_paperback' => 'boolean',
            'paperback_price' => 'nullable|numeric|min:0',
            'paperback_pages' => 'nullable|integer|min:0',
            
            'is_premium' => 'boolean',
        ]);

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('books', 'public');
            $validated['image'] = $path;
        }

        $book = Book::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Book created successfully',
            'data' => $book
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $book = Book::with(['author', 'category', 'genre'])->findOrFail($id);
        
        return response()->json([
            'success' => true,
            'data' => $book
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $book = Book::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'description' => 'sometimes|required|string',
            'author_id' => 'sometimes|required|exists:authors,id',
            'category_id' => 'sometimes|required|exists:categories,id',
            'genre_id' => 'sometimes|required|exists:genres,id',
            'language' => 'nullable|string|max:50',
            'price' => 'sometimes|required|numeric|min:0',
            'stock' => 'nullable|integer|min:0',
            'image' => 'nullable|image|max:2048',
            
            // Format specifics
            'has_ebook' => 'boolean',
            'ebook_price' => 'nullable|numeric|min:0',
            'ebook_pages' => 'nullable|integer|min:0',
            
            'has_audio' => 'boolean',
            'audio_price' => 'nullable|numeric|min:0',
            'audio_minutes' => 'nullable|integer|min:0',
            
            'has_paperback' => 'boolean',
            'paperback_price' => 'nullable|numeric|min:0',
            'paperback_pages' => 'nullable|integer|min:0',
            
            'is_premium' => 'boolean',
        ]);

        if ($request->hasFile('image')) {
            if ($book->image) {
                Storage::disk('public')->delete($book->image);
            }
            $path = $request->file('image')->store('books', 'public');
            $validated['image'] = $path;
        }

        $book->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Book updated successfully',
            'data' => $book
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $book = Book::findOrFail($id);
        
        if ($book->image) {
            Storage::disk('public')->delete($book->image);
        }
        
        $book->delete();

        return response()->json([
            'success' => true,
            'message' => 'Book deleted successfully'
        ]);
    }
}

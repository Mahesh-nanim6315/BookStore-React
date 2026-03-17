<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Author;
use App\Models\Book;
use App\Models\Category;
use App\Models\Genre;
use App\Models\Setting;
use Illuminate\Http\Request;

class BookControllers extends Controller
{
    public function index(Request $request)
    {
        $query = Book::with(['author', 'category', 'genre']);

        if ($request->filled('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        if ($request->filled('author')) {
            $query->where('author_id', $request->author);
        }

        if ($request->filled('category')) {
            $query->where('category_id', $request->category);
        }

        if ($request->filled('genre')) {
            $query->where('genre_id', $request->genre);
        }

        if ($request->filled('format')) {
            $format = $request->format;

            if ($format === 'ebook') {
                $query->where('has_ebook', true);
            } elseif ($format === 'audio') {
                $query->where('has_audio', true);
            } elseif ($format === 'paperback') {
                $query->where('has_paperback', true);
            }
        }

        if ($request->filled('premium')) {
            $query->where('is_premium', $request->boolean('premium'));
        }

        $books = $query->latest()->paginate(Setting::get('books_per_page', 12));

        return response()->json([
            'success' => true,
            'data' => [
                'books' => $books,
                'filters' => [
                    'authors' => Author::orderBy('name')->get(),
                    'categories' => Category::orderBy('name')->get(),
                    'genres' => Genre::orderBy('name')->get(),
                ],
            ],
        ]);
    }

    public function create()
    {
        return response()->json([
            'success' => true,
            'data' => [
                'authors' => Author::orderBy('name')->get(),
                'categories' => Category::orderBy('name')->get(),
                'genres' => Genre::orderBy('name')->get(),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'language' => 'required|string|max:255',
            'author_id' => 'required|exists:authors,id',
            'category_id' => 'required|exists:categories,id',
            'genre_id' => 'required|exists:genres,id',
            'image' => 'required|url',
            'price' => 'required|numeric|min:0',
            'ebook_price' => 'nullable|numeric|min:0',
            'ebook_pdf' => 'nullable|url',
            'ebook_pages' => 'nullable|integer|min:0',
            'audio_price' => 'nullable|numeric|min:0',
            'audio_file' => 'nullable|url',
            'audio_minutes' => 'nullable|integer|min:0',
            'paperback_price' => 'nullable|numeric|min:0',
            'paperback_pages' => 'nullable|integer|min:0',
            'stock' => 'nullable|integer|min:0',
            'is_premium' => 'nullable|boolean',
            'has_ebook' => 'nullable|boolean',
            'has_audio' => 'nullable|boolean',
            'has_paperback' => 'nullable|boolean',
        ]);

        $book = Book::create($this->normalizePayload($validated, $request));

        return response()->json([
            'success' => true,
            'message' => 'Book created successfully',
            'data' => [
                'book' => $book->load(['author', 'category', 'genre']),
            ],
        ], 201);
    }

    public function show(Book $book)
    {
        return response()->json([
            'success' => true,
            'data' => [
                'book' => $book->load(['author', 'category', 'genre']),
            ],
        ]);
    }

    public function edit(Book $book)
    {
        return response()->json([
            'success' => true,
            'data' => [
                'book' => $book->load(['author', 'category', 'genre']),
                'authors' => Author::orderBy('name')->get(),
                'categories' => Category::orderBy('name')->get(),
                'genres' => Genre::orderBy('name')->get(),
            ],
        ]);
    }

    public function update(Request $request, Book $book)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'language' => 'required|string|max:255',
            'author_id' => 'required|exists:authors,id',
            'category_id' => 'required|exists:categories,id',
            'genre_id' => 'required|exists:genres,id',
            'image' => 'required|url',
            'price' => 'required|numeric|min:0',
            'ebook_price' => 'nullable|numeric|min:0',
            'ebook_pdf' => 'nullable|url',
            'ebook_pages' => 'nullable|integer|min:0',
            'audio_price' => 'nullable|numeric|min:0',
            'audio_file' => 'nullable|url',
            'audio_minutes' => 'nullable|integer|min:0',
            'paperback_price' => 'nullable|numeric|min:0',
            'paperback_pages' => 'nullable|integer|min:0',
            'stock' => 'nullable|integer|min:0',
            'is_premium' => 'nullable|boolean',
            'has_ebook' => 'nullable|boolean',
            'has_audio' => 'nullable|boolean',
            'has_paperback' => 'nullable|boolean',
        ]);

        $book->update($this->normalizePayload($validated, $request));

        return response()->json([
            'success' => true,
            'message' => 'Book updated successfully',
            'data' => [
                'book' => $book->fresh(['author', 'category', 'genre']),
            ],
        ]);
    }

    public function destroy(Book $book)
    {
        $book->delete();

        return response()->json([
            'success' => true,
            'message' => 'Book deleted successfully',
        ]);
    }

    private function normalizePayload(array $validated, Request $request): array
    {
        $validated['is_premium'] = $request->boolean('is_premium');
        $validated['has_ebook'] = $request->boolean('has_ebook');
        $validated['has_audio'] = $request->boolean('has_audio');
        $validated['has_paperback'] = $request->boolean('has_paperback');
        $validated['stock'] = $validated['stock'] ?? 0;

        return $validated;
    }
}

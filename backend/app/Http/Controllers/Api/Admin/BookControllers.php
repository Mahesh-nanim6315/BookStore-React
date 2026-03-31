<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Author;
use App\Models\Book;
use App\Models\Category;
use App\Models\Genre;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

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

        $this->validateFormatRequirements($request);

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

        $this->validateFormatRequirements($request);

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
        $validated['name'] = trim((string) $validated['name']);
        $validated['description'] = trim((string) $validated['description']);
        $validated['language'] = trim((string) $validated['language']);
        $validated['image'] = trim((string) $validated['image']);
        $validated['is_premium'] = $request->boolean('is_premium');
        $validated['has_ebook'] = $request->boolean('has_ebook');
        $validated['has_audio'] = $request->boolean('has_audio');
        $validated['has_paperback'] = $request->boolean('has_paperback');
        $validated['stock'] = $validated['stock'] ?? 0;

        foreach (['ebook_pdf', 'audio_file'] as $urlField) {
            if (array_key_exists($urlField, $validated) && $validated[$urlField] !== null) {
                $validated[$urlField] = trim((string) $validated[$urlField]);
            }
        }

        return $validated;
    }

    private function validateFormatRequirements(Request $request): void
    {
        $errors = [];

        if (
            ! $request->boolean('has_ebook')
            && ! $request->boolean('has_audio')
            && ! $request->boolean('has_paperback')
        ) {
            $errors['formats'] = ['Enable at least one format before saving a book.'];
        }

        if ($request->boolean('has_ebook')) {
            if ($this->isBlank($request->input('ebook_price'))) {
                $errors['ebook_price'] = ['eBook price is required when eBook is enabled.'];
            }
            if ($this->isBlank($request->input('ebook_pdf'))) {
                $errors['ebook_pdf'] = ['eBook PDF URL is required when eBook is enabled.'];
            }
            if ($this->isBlank($request->input('ebook_pages'))) {
                $errors['ebook_pages'] = ['eBook pages are required when eBook is enabled.'];
            }
        }

        if ($request->boolean('has_audio')) {
            if ($this->isBlank($request->input('audio_price'))) {
                $errors['audio_price'] = ['Audio price is required when audio is enabled.'];
            }
            if ($this->isBlank($request->input('audio_file'))) {
                $errors['audio_file'] = ['Audio file URL is required when audio is enabled.'];
            }
            if ($this->isBlank($request->input('audio_minutes'))) {
                $errors['audio_minutes'] = ['Audio minutes are required when audio is enabled.'];
            }
        }

        if ($request->boolean('has_paperback')) {
            if ($this->isBlank($request->input('paperback_price'))) {
                $errors['paperback_price'] = ['Paperback price is required when paperback is enabled.'];
            }
            if ($this->isBlank($request->input('paperback_pages'))) {
                $errors['paperback_pages'] = ['Paperback pages are required when paperback is enabled.'];
            }
            if ($this->isBlank($request->input('stock'))) {
                $errors['stock'] = ['Paperback stock is required when paperback is enabled.'];
            }
        }

        if ($errors !== []) {
            throw ValidationException::withMessages($errors);
        }
    }

    private function isBlank(mixed $value): bool
    {
        return $value === null || (is_string($value) && trim($value) === '');
    }
}

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
    private const NULLABLE_NON_NEGATIVE_NUMBER = 'nullable|numeric|min:0';
    private const NULLABLE_NON_NEGATIVE_INTEGER = 'nullable|integer|min:0';
    private const NULLABLE_URL = 'nullable|url';
    private const NULLABLE_BOOLEAN = 'nullable|boolean';
    private const REQUIRED_STRING_MAX_255 = 'required|string|max:255';

    public function index(Request $request)
    {
        try {
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
            } catch (\Throwable $e) {
                $this->logRequestErrorAuto($e);

                return response()->json([
                'success' => false,
                'message' => 'An error occurred while loading books.'
            ], 500);
        }
    }

    public function create()
    {
        try {
            return response()->json([
                'success' => true,
                'data' => [
                    'authors' => Author::orderBy('name')->get(),
                    'categories' => Category::orderBy('name')->get(),
                    'genres' => Genre::orderBy('name')->get(),
                ],
            ]);
            } catch (\Throwable $e) {
                $this->logRequestErrorAuto($e);

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
                'name' => self::REQUIRED_STRING_MAX_255,
                'description' => 'required|string',
                'language' => self::REQUIRED_STRING_MAX_255,
                'author_id' => 'required|exists:authors,id',
                'category_id' => 'required|exists:categories,id',
                'genre_id' => 'required|exists:genres,id',
                'image' => 'required|url',
                'price' => 'required|numeric|min:0',
                'ebook_price' => self::NULLABLE_NON_NEGATIVE_NUMBER,
                'ebook_pdf' => self::NULLABLE_URL,
                'ebook_pages' => self::NULLABLE_NON_NEGATIVE_INTEGER,
                'audio_price' => self::NULLABLE_NON_NEGATIVE_NUMBER,
                'audio_file' => self::NULLABLE_URL,
                'audio_minutes' => self::NULLABLE_NON_NEGATIVE_INTEGER,
                'paperback_price' => self::NULLABLE_NON_NEGATIVE_NUMBER,
                'paperback_pages' => self::NULLABLE_NON_NEGATIVE_INTEGER,
                'stock' => self::NULLABLE_NON_NEGATIVE_INTEGER,
                'is_premium' => self::NULLABLE_BOOLEAN,
                'has_ebook' => self::NULLABLE_BOOLEAN,
                'has_audio' => self::NULLABLE_BOOLEAN,
                'has_paperback' => self::NULLABLE_BOOLEAN,
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
            } catch (\Throwable $e) {
                $this->logRequestErrorAuto($e);

                return response()->json([
                'success' => false,
                'message' => 'An error occurred while creating the book.'
            ], 500);
        }
    }

    public function show(Book $book)
    {
        try {
            return response()->json([
                'success' => true,
                'data' => [
                    'book' => $book->load(['author', 'category', 'genre']),
                ],
            ]);
            } catch (\Throwable $e) {
                $this->logRequestErrorAuto($e);

                return response()->json([
                'success' => false,
                'message' => 'An error occurred while loading the book.'
            ], 500);
        }
    }

    public function edit(Book $book)
    {
        try {
            return response()->json([
                'success' => true,
                'data' => [
                    'book' => $book->load(['author', 'category', 'genre']),
                    'authors' => Author::orderBy('name')->get(),
                    'categories' => Category::orderBy('name')->get(),
                    'genres' => Genre::orderBy('name')->get(),
                ],
            ]);
            } catch (\Throwable $e) {
                $this->logRequestErrorAuto($e);

                return response()->json([
                'success' => false,
                'message' => 'An error occurred while loading edit form.'
            ], 500);
        }
    }

    public function update(Request $request, Book $book)
    {
        try {
            $validated = $request->validate([
                'name' => self::REQUIRED_STRING_MAX_255,
                'description' => 'required|string',
                'language' => self::REQUIRED_STRING_MAX_255,
                'author_id' => 'required|exists:authors,id',
                'category_id' => 'required|exists:categories,id',
                'genre_id' => 'required|exists:genres,id',
                'image' => 'required|url',
                'price' => 'required|numeric|min:0',
                'ebook_price' => self::NULLABLE_NON_NEGATIVE_NUMBER,
                'ebook_pdf' => self::NULLABLE_URL,
                'ebook_pages' => self::NULLABLE_NON_NEGATIVE_INTEGER,
                'audio_price' => self::NULLABLE_NON_NEGATIVE_NUMBER,
                'audio_file' => self::NULLABLE_URL,
                'audio_minutes' => self::NULLABLE_NON_NEGATIVE_INTEGER,
                'paperback_price' => self::NULLABLE_NON_NEGATIVE_NUMBER,
                'paperback_pages' => self::NULLABLE_NON_NEGATIVE_INTEGER,
                'stock' => self::NULLABLE_NON_NEGATIVE_INTEGER,
                'is_premium' => self::NULLABLE_BOOLEAN,
                'has_ebook' => self::NULLABLE_BOOLEAN,
                'has_audio' => self::NULLABLE_BOOLEAN,
                'has_paperback' => self::NULLABLE_BOOLEAN,
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
            } catch (\Throwable $e) {
                $this->logRequestErrorAuto($e);

                return response()->json([
                'success' => false,
                'message' => 'An error occurred while updating the book.'
            ], 500);
        }
    }

    public function destroy(Book $book)
    {
        try {
            $book->delete();

            return response()->json([
                'success' => true,
                'message' => 'Book deleted successfully',
            ]);
            } catch (\Throwable $e) {
                $this->logRequestErrorAuto($e);

                return response()->json([
                'success' => false,
                'message' => 'An error occurred while deleting the book.'
            ], 500);
        }
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

        $formatRequirements = [
            'ebook' => [
                'price' => 'eBook price is required when eBook is enabled.',
                'pdf' => 'eBook PDF URL is required when eBook is enabled.',
                'pages' => 'eBook pages are required when eBook is enabled.',
            ],
            'audio' => [
                'price' => 'Audio price is required when audio is enabled.',
                'file' => 'Audio file URL is required when audio is enabled.',
                'minutes' => 'Audio minutes are required when audio is enabled.',
            ],
            'paperback' => [
                'price' => 'Paperback price is required when paperback is enabled.',
                'pages' => 'Paperback pages are required when paperback is enabled.',
                'stock' => 'Paperback stock is required when paperback is enabled.',
            ],
        ];

        if (! $this->hasEnabledFormat($request, array_keys($formatRequirements))) {
            $errors['formats'] = ['Enable at least one format before saving a book.'];
        }

        foreach ($formatRequirements as $format => $fields) {
            if (! $request->boolean("has_{$format}")) {
                continue;
            }

            foreach ($fields as $field => $message) {
                $inputKey = $format === 'paperback' && $field === 'stock'
                    ? 'stock'
                    : "{$format}_{$field}";

                if ($this->isBlank($request->input($inputKey))) {
                    $errors[$inputKey] = [$message];
                }
            }
        }

        if ($errors !== []) {
            throw ValidationException::withMessages($errors);
        }
    }

    private function hasEnabledFormat(Request $request, array $formats): bool
    {
        foreach ($formats as $format) {
            if ($request->boolean("has_{$format}")) {
                return true;
            }
        }

        return false;
    }

    private function isBlank(mixed $value): bool
    {
        return $value === null || (is_string($value) && trim($value) === '');
    }
}

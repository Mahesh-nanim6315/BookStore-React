<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\UserLibrary;
use App\Models\Book;
use App\Models\OrderItem;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class LibraryController extends Controller
{
    public function add(Request $request, Book $book)
    {
        try {
            $request->validate([
                'format' => 'nullable|in:ebook,audio,paperback'
            ]);

            $user = $request->user();
            $userId = $user->id;
            $format = $request->input('format') ?: $this->resolveDefaultLibraryFormat($book, $userId);

            $this->ensureLibraryAccess($book, $format, $user);

            // Prevent duplicate per format
            $alreadyAdded = UserLibrary::where('user_id', $userId)
                ->where('book_id', $book->id)
                ->where('format', $format)
                ->exists();

            if ($alreadyAdded) {
                return response()->json([
                    'success' => false,
                    'message' => ucfirst($format) . ' already in your library'
                ], 422);
            }

            $library = UserLibrary::create([
                'user_id'    => $userId,
                'book_id'    => $book->id,
                'format'     => $format,
                'expires_at' => in_array($format, ['ebook', 'audio'])
                                ? now()->addDays(30)
                                : null
            ]);

            // Load the book relationship for response
            $library->load('book');

            return response()->json([
                'success' => true,
                'message' => ucfirst($format) . ' added to your library',
                'data' => [
                    'library_item' => $library
                ]
            ]);
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('LibraryController.add: ' . $e->getMessage() . ' on line ' . $e->getLine());
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while adding to library.'
            ], 500);
        }
    }

    public function index()
    {
        try {
            $libraries = UserLibrary::with(['book.author', 'book.category'])
                ->where('user_id', Auth::id())
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => [
                    'libraries' => $libraries
                ]
            ]);
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('LibraryController.index: ' . $e->getMessage() . ' on line ' . $e->getLine());
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while loading library.'
            ], 500);
        }
    }

    private function ensureLibraryAccess(Book $book, string $format, $user): void
    {
        $format = strtolower($format);

        if ($format === 'ebook') {
            if (! $book->has_ebook) {
                throw ValidationException::withMessages([
                    'format' => ['This book is not available as an ebook.'],
                ]);
            }

            if (! $user->canAccessBook($book) && ! $this->userOwnsFormat($user->id, $book->id, $format)) {
                throw ValidationException::withMessages([
                    'format' => ['You must purchase or unlock this ebook before adding it to your library.'],
                ]);
            }

            return;
        }

        if ($format === 'audio') {
            if (! $book->has_audio) {
                throw ValidationException::withMessages([
                    'format' => ['This book is not available as an audio title.'],
                ]);
            }

            if (! $user->canAccessBook($book) && ! $this->userOwnsFormat($user->id, $book->id, $format)) {
                throw ValidationException::withMessages([
                    'format' => ['You must purchase or unlock this audio title before adding it to your library.'],
                ]);
            }

            return;
        }

        if (! $book->has_paperback) {
            throw ValidationException::withMessages([
                'format' => ['This book is not available as a paperback.'],
            ]);
        }

        if (! $this->userOwnsFormat($user->id, $book->id, $format)) {
            throw ValidationException::withMessages([
                'format' => ['You can add a paperback to your library only after purchasing it.'],
            ]);
        }
    }

    private function resolveDefaultLibraryFormat(Book $book, int $userId): string
    {
        foreach (['ebook', 'audio', 'paperback'] as $format) {
            if ($this->bookSupportsFormat($book, $format) && $this->userOwnsFormat($userId, $book->id, $format)) {
                return $format;
            }
        }

        if ($book->has_ebook) {
            return 'ebook';
        }

        if ($book->has_audio) {
            return 'audio';
        }

        if ($book->has_paperback) {
            return 'paperback';
        }

        throw ValidationException::withMessages([
            'format' => ['This book does not have a library-ready format.'],
        ]);
    }

    private function bookSupportsFormat(Book $book, string $format): bool
    {
        return match ($format) {
            'ebook' => (bool) $book->has_ebook,
            'audio' => (bool) $book->has_audio,
            'paperback' => (bool) $book->has_paperback,
            default => false,
        };
    }

    private function userOwnsFormat(int $userId, int $bookId, string $format): bool
    {
        return OrderItem::where('book_id', $bookId)
            ->where('format', $format)
            ->whereHas('order', function ($query) use ($userId) {
                $query->where('user_id', $userId)
                    ->whereIn('status', ['pending', 'placed', 'completed']);
            })
            ->exists();
    }
}

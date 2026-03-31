<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Book;
use App\Models\UserLibrary;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class RentController extends Controller
{
    public function rentEbook(Book $book)
    {
        $libraryItem = $this->rentFormat($book, 'ebook');

        return response()->json([
            'success' => true,
            'message' => 'E-Book rented successfully!',
            'data' => [
                'book' => $book,
                'format' => 'ebook',
                'library_item' => $libraryItem,
            ]
        ]);
    }

    public function rentAudio(Book $book)
    {
        $libraryItem = $this->rentFormat($book, 'audio');

        return response()->json([
            'success' => true,
            'message' => 'Audio book rented successfully!',
            'data' => [
                'book' => $book,
                'format' => 'audio',
                'library_item' => $libraryItem,
            ]
        ]);
    }

    private function rentFormat(Book $book, string $format): UserLibrary
    {
        $user = Auth::user();

        if ($format === 'ebook' && ! $book->has_ebook) {
            throw ValidationException::withMessages([
                'format' => ['This book is not available as an ebook.'],
            ]);
        }

        if ($format === 'audio' && ! $book->has_audio) {
            throw ValidationException::withMessages([
                'format' => ['This book is not available as an audio title.'],
            ]);
        }

        if ($book->is_premium && ! $user->canAccessBook($book)) {
            return throw ValidationException::withMessages([
                'book' => ['This title requires a premium subscription before it can be rented.'],
            ]);
        }

        $existing = UserLibrary::where('user_id', $user->id)
            ->where('book_id', $book->id)
            ->where('format', $format)
            ->first();

        if ($existing && ! $existing->isExpired()) {
            throw ValidationException::withMessages([
                'format' => ['This title is already active in your library.'],
            ]);
        }

        if ($existing) {
            $existing->update([
                'expires_at' => now()->addDays(30),
            ]);

            return $existing->fresh('book');
        }

        return UserLibrary::create([
            'user_id' => $user->id,
            'book_id' => $book->id,
            'format' => $format,
            'expires_at' => now()->addDays(30),
        ])->load('book');
    }
}

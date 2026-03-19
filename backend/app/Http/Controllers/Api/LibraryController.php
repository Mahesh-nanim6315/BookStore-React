<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\UserLibrary;
use App\Models\Book;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;

class LibraryController extends Controller
{
    public function add(Request $request, Book $book)
    {
        $request->validate([
            'format' => 'required|in:ebook,audio,paperback'
        ]);

        $userId = Auth::id();
        $format = $request->format;

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
    }

    public function index()
    {
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
    }
}

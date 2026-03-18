<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Book;
use App\Models\Wishlist;
use Illuminate\Http\Request;

class WishlistController extends Controller
{
    public function index(Request $request)
    {
        $wishlist = $request->user()
            ->wishlist()
            ->with(['book.author', 'book.category', 'book.genre'])
            ->latest('id')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $wishlist,
        ]);
    }

    public function toggle(Request $request)
    {
        $validated = $request->validate([
            'book_id' => ['required', 'integer', 'exists:books,id'],
        ]);

        $user = $request->user();
        $existing = $user->wishlist()->where('book_id', $validated['book_id'])->first();

        if ($existing) {
            $existing->delete();

            return response()->json([
                'success' => true,
                'action' => 'removed',
                'message' => 'Book removed from wishlist.',
            ]);
        }

        $book = Book::with(['author', 'category', 'genre'])->findOrFail($validated['book_id']);

        $wishlist = Wishlist::create([
            'user_id' => $user->id,
            'book_id' => $book->id,
        ])->load(['book.author', 'book.category', 'book.genre']);

        return response()->json([
            'success' => true,
            'action' => 'added',
            'message' => 'Book added to wishlist.',
            'data' => $wishlist,
        ]);
    }

    public function destroy(Request $request, Wishlist $wishlist)
    {
        if ((int) $wishlist->user_id !== (int) $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'You are not allowed to remove this wishlist item.',
            ], 403);
        }

        $wishlist->delete();

        return response()->json([
            'success' => true,
            'message' => 'Wishlist item removed.',
        ]);
    }
}

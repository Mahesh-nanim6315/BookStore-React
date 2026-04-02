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
        try {
            $wishlist = $request->user()
                ->wishlist()
                ->with(['book.author', 'book.category', 'book.genre'])
                ->latest('id')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $wishlist,
            ]);
            } catch (\Throwable $e) {
                $this->logRequestErrorAuto($e);

                return response()->json([
                'success' => false,
                'message' => 'An error occurred while loading wishlist.'
            ], 500);
        }
    }

    public function toggle(Request $request)
    {
        try {
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
            } catch (\Throwable $e) {
                $this->logRequestErrorAuto($e);

                return response()->json([
                'success' => false,
                'message' => 'An error occurred while toggling wishlist.'
            ], 500);
        }
    }

    public function destroy(Request $request, Wishlist $wishlist)
    {
        try {
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
            } catch (\Throwable $e) {
                $this->logRequestErrorAuto($e);

                return response()->json([
                'success' => false,
                'message' => 'An error occurred while removing wishlist item.'
            ], 500);
        }
    }
}

<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Review;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Book;

class ReviewController extends Controller
{
    public function store(Request $request, Book $book)
    {
        $userId = Auth::id();

        $request->validate([
            'rating'  => 'required|integer|min:1|max:5',
            'comment' => 'required|string|max:1000',
        ]);

        $alreadyReviewed = Review::where('book_id', $book->id)
            ->where('user_id', $userId)
            ->exists();

        if ($alreadyReviewed) {
            return response()->json([
                'success' => false,
                'message' => 'You have already reviewed this book.'
            ], 422);
        }

        $autoApprove = (bool) Setting::get('auto_approve_reviews', 0);

        $review = Review::create([
            'book_id' => $book->id,
            'user_id' => Auth::id(),
            'rating'  => $request->rating,
            'comment' => $request->comment,
            'is_approved' => $autoApprove,
        ]);

        // Load user relationship for response
        $review->load('user');

        return response()->json([
            'success' => true,
            'message' => 'Review added successfully!',
            'data' => [
                'review' => $review
            ]
        ]);
    }

    public function edit(Review $review)
    {
        // Security check
        if ($review->user_id !== Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access'
            ], 403);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'review' => $review
            ]
        ]);
    }

    public function update(Request $request, Review $review)
    {
        if ($review->user_id !== Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access'
            ], 403);
        }

        $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'required|string'
        ]);

        $review->update([
            'rating' => $request->rating,
            'comment' => $request->comment
        ]);

        $review->load('user');

        return response()->json([
            'success' => true,
            'message' => 'Review updated successfully',
            'data' => [
                'review' => $review->fresh()->load('user')
            ]
        ]);
    }

    public function destroy(Review $review)
    {
        if ($review->user_id !== Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access'
            ], 403);
        }

        $bookId = $review->book_id;
        $review->delete();

        return response()->json([
            'success' => true,
            'message' => 'Review deleted',
            'data' => [
                'book_id' => $bookId
            ]
        ]);
    }
}

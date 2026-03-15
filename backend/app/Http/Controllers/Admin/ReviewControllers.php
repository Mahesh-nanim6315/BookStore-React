<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Review;
use Illuminate\Http\Request;

class ReviewControllers extends Controller
{
    public function index(Request $request)
    {
        $query = Review::with(['user', 'book']);

        // Filter by approval
        if ($request->filled('status')) {
            $query->where('is_approved', $request->status);
        }

        // Search by book or user
        if ($request->filled('search')) {
            $query->where(function($q) use ($request) {
                $q->whereHas('book', function($q) use ($request) {
                    $q->where('name', 'like', '%' . $request->search . '%');
                })->orWhereHas('user', function($q) use ($request) {
                    $q->where('name', 'like', '%' . $request->search . '%');
                });
            });
        }

        $reviews = $query->latest()->paginate(10);

        return response()->json([
            'success' => true,
            'data' => $reviews
        ]);
    }

    public function approve(Review $review)
    {
        $review->update([
            'is_approved' => !$review->is_approved
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Review status updated',
            'data' => [
                'review' => $review->fresh(['user', 'book'])
            ]
        ]);
    }

    public function destroy(Review $review)
    {
        $review->delete();

        return response()->json([
            'success' => true,
            'message' => 'Review deleted'
        ]);
    }
}
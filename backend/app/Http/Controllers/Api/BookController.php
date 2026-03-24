<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Support\Facades\Auth;
use App\Models\Book;
use App\Models\Review;
use App\Models\Setting;
use App\Models\OrderItem;
use Illuminate\Http\Request;

class BookController extends Controller
{
    public function categoriesIndex()
    {
        $categories = Category::withCount([
                'books',
                'books as ebooks_count' => function ($query) {
                    $query->where('has_ebook', true);
                },
                'books as audiobooks_count' => function ($query) {
                    $query->where('has_audio', true);
                },
                'books as paperbacks_count' => function ($query) {
                    $query->where('has_paperback', true);
                },
            ])
            ->orderBy('name')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $categories
        ]);
    }

    public function home()
    {
        // Load first 6 categories only for homepage
        $categories = Category::with(['books' => function ($query) {
            $query->latest()->take(15);
        }])->take(6)->get();

        // Recently Added
        $recentBooks = Book::latest()->take(12)->get();

        // Top Trending (example logic)
        $trendingBooks = Book::withCount('reviews')
            ->orderByDesc('reviews_count')
            ->take(12)
            ->get();

        $recentlyViewedIds = session()->get('recently_viewed', []);

        $recentlyViewedBooks = Book::whereIn('id', $recentlyViewedIds)
            ->get()
            ->sortBy(function ($book) use ($recentlyViewedIds) {
                return array_search($book->id, $recentlyViewedIds);
            })->values();

        return response()->json([
            'success' => true,
            'data' => [
                'recent_books' => $recentBooks,
                'trending_books' => $trendingBooks,
                'categories' => $categories,
                'recently_viewed_books' => $recentlyViewedBooks
            ]
        ]);
    }

    public function show(Request $request, $id)
    {
        $book = Book::with([
            'author',
            'category',
            'genre',
            'reviews.user',
        ])->findOrFail($id);

        $user = $request->user('sanctum');

        if ($book->is_premium && (! $user || ! $user->canAccessBook($book))) {
            return response()->json([
                'success' => false,
                'message' => 'This book requires a premium subscription.',
                'redirect' => '/plans'
            ], 403);
        }

        $reviews = Review::with('user')
            ->where('book_id', $book->id)
            ->when($user && $user->role !== 'admin', function ($query) use ($user) {
                $query->where(function ($q) use ($user) {
                    $q->where('is_approved', true)
                      ->orWhere('user_id', $user->id);
                });
            })
            ->when(! $user, function ($query) {
                $query->where('is_approved', true);
            })
            ->latest()
            ->get();

        $recommendedBooks = collect();

        if ($user) {
            // Get category IDs of books user purchased
            $purchasedCategoryIds = OrderItem::whereHas('order', function ($q) use ($user) {
                $q->where('user_id', $user->id);
            })
            ->with('book')
            ->get()
            ->pluck('book.category_id')
            ->unique();

            // Recommend books from same categories
            $recommendedBooks = Book::whereIn('category_id', $purchasedCategoryIds)
                ->where('id', '!=', $book->id)
                ->with(['author', 'category', 'genre'])
                ->take(5)
                ->get();
        } else {
            $recommendedBooks = Book::with(['author', 'category', 'genre'])
                ->where('id', '!=', $book->id)
                ->where(function ($query) use ($book) {
                    $query->where('category_id', $book->category_id)
                        ->orWhere('genre_id', $book->genre_id);
                })
                ->take(5)
                ->get();
        }

        // Track recently viewed books in session
        $recentlyViewed = session()->get('recently_viewed', []);

        if (!in_array($id, $recentlyViewed)) {
            array_unshift($recentlyViewed, $id);
        }

        $recentlyViewed = array_slice($recentlyViewed, 0, 10);
        session()->put('recently_viewed', $recentlyViewed);

        return response()->json([
            'success' => true,
            'data' => [
                'book' => $book,
                'reviews' => $reviews,
                'recommended_books' => $recommendedBooks,
                'recently_viewed' => $recentlyViewed
            ]
        ]);
    }

    public function categoryBooks(Category $category)
    {
        $books = Book::where('category_id', $category->id)
            ->paginate(Setting::get('books_per_page', 12));

        return response()->json([
            'success' => true,
            'data' => [
                'category' => $category->name,
                'books' => $books
            ]
        ]);
    }
}

<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Book;
use App\Models\Category;
use App\Models\Author;
use App\Models\Genre;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Review;
use App\Models\Setting;

class ProductController extends Controller
{
    public function home(Request $request)
    {
        try {
            $query = Book::query()->with(['category', 'author']);

            if ($request->filled('search')) {
                $query->where('name', 'like', '%' . $request->search . '%');
            }

            if ($request->filled('category_id')) {
                $query->where('category_id', $request->category_id);
            }

            if ($request->filled('language')) {
                $query->where('language', $request->language);
            }

            if ($request->filled('author_id')) {
                $query->where('author_id', $request->author_id);
            }

            if ($request->filled('genre_id')) {
                $query->where('genre_id', $request->genre_id);
            }

            if ($request->sort === 'price_asc') {
                $query->orderBy('price', 'asc');
            } elseif ($request->sort === 'price_desc') {
                $query->orderBy('price', 'desc');
            } else {
                $query->latest();
            }

            $books = $query->paginate((int) Setting::get('books_per_page', 12));
            $categories = Category::orderBy('name')->get();
            $authors = Author::orderBy('name')->get();
            $genres = Genre::orderBy('name')->get();
            $languages = Book::distinct()->orderBy('language')->pluck('language');

            return response()->json([
                'success' => true,
                'data' => [
                    'books' => $books,
                    'filters' => [
                        'categories' => $categories,
                        'authors' => $authors,
                        'genres' => $genres,
                        'languages' => $languages
                    ]
                ]
            ]);
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('ProductController.home: ' . $e->getMessage() . ' on line ' . $e->getLine());
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while loading products.'
            ], 500);
        }
    }

    public function show($id)
    {
        try {
            $book = Book::with(['reviews.user', 'category', 'author'])->findOrFail($id);

            if ($book->is_premium && (!Auth::check() || !Auth::user()->canAccessBook($book))) {
                return response()->json([
                    'success' => false,
                    'message' => 'This book requires a premium subscription.',
                    'redirect' => '/plans'
                ], 403);
            }

            $reviews = Review::where('book_id', $book->id)
                ->when(Auth::check() && Auth::user()->role !== 'admin', function ($query) {
                    $query->where(function ($q) {
                        $q->where('is_approved', true)
                            ->orWhere('user_id', Auth::id());
                    });
                })
                ->when(!Auth::check(), function ($query) {
                    $query->where('is_approved', true);
                })
                ->with('user')
                ->latest()
                ->get();

            return response()->json([
                'success' => true,
                'data' => [
                    'book' => $book,
                    'reviews' => $reviews
                ]
            ]);
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('ProductController.show: ' . $e->getMessage() . ' on line ' . $e->getLine());
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while loading product details.'
            ], 500);
        }
    }

    // Show Add Book Form
    public function create()
    {
        try {
            $categories = Category::all();
            $authors = Author::all();
            $genres = Genre::all();
            
            return response()->json([
                'success' => true,
                'data' => [
                    'categories' => $categories,
                    'authors' => $authors,
                    'genres' => $genres
                ]
            ]);
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('ProductController.create: ' . $e->getMessage() . ' on line ' . $e->getLine());
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while loading create form.'
            ], 500);
        }
    }

    public function audiobooks()
    {
        try {
            $categories = Category::whereIn('name', [
                'Drama', 'Thriller', 'Social', 'Fantasy', 'Family', 
                'Romance', 'Humor', 'Horror', 'Historical'
            ])->get()->keyBy('name');

            $drama = Book::where('category_id', $categories['Drama']->id ?? null)
                         ->where('has_audio', true)
                         ->latest()->take(10)->get();

            $thriller = Book::where('category_id', $categories['Thriller']->id ?? null)
                            ->where('has_audio', true)
                            ->latest()->take(10)->get();

            $fantasy = Book::where('category_id', $categories['Fantasy']->id ?? null)
                            ->where('has_audio', true)
                            ->latest()->take(10)->get();

            $social = Book::where('category_id', $categories['Social']->id ?? null)
                          ->where('has_audio', true)
                          ->latest()->take(10)->get();

            $family = Book::where('category_id', $categories['Family']->id ?? null)
                          ->where('has_audio', true)
                          ->latest()->take(10)->get();

            $romance = Book::where('category_id', $categories['Romance']->id ?? null)
                           ->where('has_audio', true)
                           ->latest()->take(10)->get();

            $humor = Book::where('category_id', $categories['Humor']->id ?? null)
                           ->where('has_audio', true)
                           ->latest()->take(10)->get();

            $horror = Book::where('category_id', $categories['Horror']->id ?? null)
                           ->where('has_audio', true)
                           ->latest()->take(10)->get();
                           
            $historical = Book::where('category_id', $categories['Historical']->id ?? null)
                           ->where('has_audio', true)
                           ->latest()->take(10)->get();

            return response()->json([
                'success' => true,
                'data' => [
                    'drama' => $drama,
                    'thriller' => $thriller,
                    'fantasy' => $fantasy,
                    'social' => $social,
                    'family' => $family,
                    'romance' => $romance,
                    'humor' => $humor,
                    'horror' => $horror,
                    'historical' => $historical,
                    'categories' => $categories
                ]
            ]);
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('ProductController.audiobooks: ' . $e->getMessage() . ' on line ' . $e->getLine());
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while loading audiobooks.'
            ], 500);
        }
    }

    public function ebooks()
    {
        try {
            $categories = Category::whereIn('name', [
                'Drama', 'Thriller', 'Social', 'Family', 'Romance',
                'Humor', 'Horror', 'Historical'
            ])->get()->keyBy('name');

            $drama = Book::where('category_id', $categories['Drama']->id ?? null)
                         ->where('has_ebook', true)
                         ->latest()->take(10)->get();

            $thriller = Book::where('category_id', $categories['Thriller']->id ?? null)
                            ->where('has_ebook', true)
                            ->latest()->take(10)->get();

            $social = Book::where('category_id', $categories['Social']->id ?? null)
                          ->where('has_ebook', true)
                          ->latest()->take(10)->get();

            $family = Book::where('category_id', $categories['Family']->id ?? null)
                          ->where('has_ebook', true)
                          ->latest()->take(10)->get();

            $romance = Book::where('category_id', $categories['Romance']->id ?? null)
                           ->where('has_ebook', true)
                           ->latest()->take(10)->get();
                           
            $humor = Book::where('category_id', $categories['Humor']->id ?? null)
                           ->where('has_ebook', true)
                           ->latest()->take(10)->get();
                           
            $horror = Book::where('category_id', $categories['Horror']->id ?? null)
                           ->where('has_ebook', true)
                           ->latest()->take(10)->get();
                           
            $historical = Book::where('category_id', $categories['Historical']->id ?? null)
                           ->where('has_ebook', true)
                           ->latest()->take(10)->get();

            return response()->json([
                'success' => true,
                'data' => [
                    'drama' => $drama,
                    'thriller' => $thriller,
                    'social' => $social,
                    'family' => $family,
                    'romance' => $romance,
                    'humor' => $humor,
                    'horror' => $horror,
                    'historical' => $historical,
                    'categories' => $categories
                ]
            ]);
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('ProductController.ebooks: ' . $e->getMessage() . ' on line ' . $e->getLine());
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while loading ebooks.'
            ], 500);
        }
    }

    public function paperbacks()
    {
        try {
            $categories = Category::whereIn('name', [
                'Drama', 'Thriller', 'Social', 'Family', 'Romance',
                'Humor', 'Horror', 'Historical'
            ])->get()->keyBy('name');

            $drama = Book::where('category_id', $categories['Drama']->id ?? null)
                         ->where('has_paperback', true)
                         ->latest()->take(10)->get();

            $thriller = Book::where('category_id', $categories['Thriller']->id ?? null)
                            ->where('has_paperback', true)
                            ->latest()->take(10)->get();

            $social = Book::where('category_id', $categories['Social']->id ?? null)
                          ->where('has_paperback', true)
                          ->latest()->take(10)->get();

            $family = Book::where('category_id', $categories['Family']->id ?? null)
                          ->where('has_paperback', true)
                          ->latest()->take(10)->get();

            $romance = Book::where('category_id', $categories['Romance']->id ?? null)
                           ->where('has_paperback', true)
                           ->latest()->take(10)->get();

            $humor = Book::where('category_id', $categories['Humor']->id ?? null)
                           ->where('has_paperback', true)
                           ->latest()->take(10)->get();
                           
            $horror = Book::where('category_id', $categories['Horror']->id ?? null)
                           ->where('has_paperback', true)
                           ->latest()->take(10)->get();
                           
            $historical = Book::where('category_id', $categories['Historical']->id ?? null)
                           ->where('has_paperback', true)
                           ->latest()->take(10)->get();

            return response()->json([
                'success' => true,
                'data' => [
                    'drama' => $drama,
                    'thriller' => $thriller,
                    'social' => $social,
                    'family' => $family,
                    'romance' => $romance,
                    'humor' => $humor,
                    'horror' => $horror,
                    'historical' => $historical,
                    'categories' => $categories
                ]
            ]);
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('ProductController.paperbacks: ' . $e->getMessage() . ' on line ' . $e->getLine());
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while loading paperbacks.'
            ], 500);
        }
    }

    /* carousel View all button */
    public function categoryBooks(Category $category)
    {
        try {
            $books = Book::where('category_id', $category->id)
                         ->with(['category', 'author'])
                         ->paginate(Setting::get('books_per_page', 12));

            return response()->json([
                'success' => true,
                'data' => [
                    'category' => $category->name,
                    'books' => $books
                ]
            ]);
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('ProductController.categoryBooks: ' . $e->getMessage() . ' on line ' . $e->getLine());
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while loading category books.'
            ], 500);
        }
    }
}

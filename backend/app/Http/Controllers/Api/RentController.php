<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Book;
use Illuminate\Http\Request;

class RentController extends Controller
{
    public function rentEbook(Book $book)
    {
        return response()->json([
            'success' => true,
            'message' => 'E-Book rented successfully!',
            'data' => [
                'book' => $book,
                'format' => 'ebook'
            ]
        ]);
    }

    public function rentAudio(Book $book)
    {
        return response()->json([
            'success' => true,
            'message' => 'Audio book rented successfully!',
            'data' => [
                'book' => $book,
                'format' => 'audio'
            ]
        ]);
    }
}
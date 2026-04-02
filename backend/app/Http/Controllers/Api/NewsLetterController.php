<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Newsletter;

class NewsletterController extends Controller
{
    public function index()
    {
        try {
            return response()->json([
                'success' => true,
                'data' => [
                    'message' => 'Newsletter subscription page'
                ]
            ]);
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('NewsletterController.index: ' . $e->getMessage() . ' on line ' . $e->getLine());
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while loading newsletter page.'
            ], 500);
        }
    }

    public function subscribe(Request $request)
    {
        try {
            $request->validate([
                'email' => 'required|email|unique:newsletters,email'
            ]);

            $newsletter = Newsletter::create([
                'email' => $request->email
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Thanks for subscribing!',
                'data' => [
                    'subscriber' => $newsletter
                ]
            ]);
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('NewsletterController.subscribe: ' . $e->getMessage() . ' on line ' . $e->getLine());
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while subscribing to newsletter.'
            ], 500);
        }
    }
}
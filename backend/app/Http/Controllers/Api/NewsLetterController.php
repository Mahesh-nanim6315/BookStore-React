<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Newsletter;

class NewsletterController extends Controller
{
    public function index()
    {
        return response()->json([
            'success' => true,
            'data' => [
                'message' => 'Newsletter subscription page'
            ]
        ]);
    }

    public function subscribe(Request $request)
    {
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
    }
}
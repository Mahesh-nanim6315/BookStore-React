<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\View;

class UserController extends Controller
{
    public function getUser()
    {
        try {
            return response()->json([
                'success' => true,
                'data' => [
                    'message' => 'User data retrieved',
                    'user' => auth()->user() ?? null
                ]
            ]);
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('UserController.getUser: ' . $e->getMessage() . ' on line ' . $e->getLine());
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while retrieving user data.'
            ], 500);
        }
    }

    public function homeComman()
    {
        try {
            return response()->json([
                'success' => true,
                'data' => [
                    'message' => 'Home page data'
                ]
            ]);
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('UserController.homeComman: ' . $e->getMessage() . ' on line ' . $e->getLine());
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while loading home page data.'
            ], 500);
        }
    }

    public function aboutUser()
    {
        try {
            return response()->json([
                'success' => true,
                'data' => [
                    'message' => 'This is James from USA'
                ]
            ]);
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('UserController.aboutUser: ' . $e->getMessage() . ' on line ' . $e->getLine());
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while loading about user data.'
            ], 500);
        }
    }

    public function getUserName($name)
    {
        try {
            return response()->json([
                'success' => true,
                'data' => [
                    'name' => $name,
                    'message' => "User name retrieved successfully"
                ]
            ]);
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('UserController.getUserName: ' . $e->getMessage() . ' on line ' . $e->getLine());
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while retrieving user name.'
            ], 500);
        }
    }

    public function adminLogin()
    {
        try {
            if (View::exists('admin.login')) {
                return response()->json([
                    'success' => true,
                    'data' => [
                        'view_exists' => true,
                        'message' => 'Admin login page data'
                    ]
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'View not found'
                ], 404);
            }
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('UserController.adminLogin: ' . $e->getMessage() . ' on line ' . $e->getLine());
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while loading admin login.'
            ], 500);
        }
    }
}
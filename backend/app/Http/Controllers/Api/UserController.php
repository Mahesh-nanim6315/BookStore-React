<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\View;

class UserController extends Controller
{
    public function getUser()
    {
        return response()->json([
            'success' => true,
            'data' => [
                'message' => 'User data retrieved',
                'user' => auth()->user() ?? null
            ]
        ]);
    }

    public function homeComman()
    {
        return response()->json([
            'success' => true,
            'data' => [
                'message' => 'Home page data'
            ]
        ]);
    }

    public function aboutUser()
    {
        return response()->json([
            'success' => true,
            'data' => [
                'message' => 'This is James from USA'
            ]
        ]);
    }

    public function getUserName($name)
    {
        return response()->json([
            'success' => true,
            'data' => [
                'name' => $name,
                'message' => "User name retrieved successfully"
            ]
        ]);
    }

    public function adminLogin()
    {
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
    }
}
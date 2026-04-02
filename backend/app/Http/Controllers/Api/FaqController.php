<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class FaqController extends Controller
{
    public function index()
    {
        try {
            return response()->json([
                'success' => true,
                'data' => []
            ]);
            } catch (\Throwable $e) {
                $this->logRequestErrorAuto($e);

                return response()->json([
                'success' => false,
                'message' => 'An error occurred while loading FAQs.'
            ], 500);
        }
    }
}

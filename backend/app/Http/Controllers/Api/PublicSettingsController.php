<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Admin\SettingsController as AdminSettingsController;
use App\Http\Controllers\Controller;

class PublicSettingsController extends Controller
{
    public function index()
    {
        try {
            return response()->json([
                'success' => true,
                'data' => AdminSettingsController::publicSettingsPayload(),
            ]);
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('PublicSettingsController.index: ' . $e->getMessage() . ' on line ' . $e->getLine());
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while loading public settings.'
            ], 500);
        }
    }
}

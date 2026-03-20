<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Admin\SettingsController as AdminSettingsController;
use App\Http\Controllers\Controller;

class PublicSettingsController extends Controller
{
    public function index()
    {
        return response()->json([
            'success' => true,
            'data' => AdminSettingsController::publicSettingsPayload(),
        ]);
    }
}

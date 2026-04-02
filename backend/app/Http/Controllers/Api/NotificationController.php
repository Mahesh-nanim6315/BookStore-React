<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        try {
            $notifications = $request->user()
                ? $request->user()->notifications()->latest()->paginate(10)
                : collect();

            return response()->json([
                'success' => true,
                'data' => $notifications,
            ]);
            } catch (\Throwable $e) {
                $this->logRequestErrorAuto($e);

                return response()->json([
                'success' => false,
                'message' => 'An error occurred while loading notifications.'
            ], 500);
        }
    }

    public function markAsRead(Request $request, string $id)
    {
        try {
            $notification = $request->user()
                ? $request->user()->notifications()->where('id', $id)->firstOrFail()
                : null;

            if ($notification) {
                $notification->markAsRead();
            }

            return response()->json([
                'success' => true,
                'message' => 'Notification marked as read.',
            ]);
            } catch (\Throwable $e) {
                $this->logRequestErrorAuto($e);

                return response()->json([
                'success' => false,
                'message' => 'An error occurred while marking notification as read.'
            ], 500);
        }
    }
}

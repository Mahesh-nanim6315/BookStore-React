<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ProfileController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        $totalOrders = $user->orders()->count();
        $wishlistCount = $user->wishlist()->count();
        $reviewCount = $user->reviews()->count();

        $completion = 0;

        if ($user->name) $completion += 25;
        if ($user->email) $completion += 25;
        if ($user->avatar) $completion += 25;
        if ($user->cover) $completion += 25;

        // Get recent purchased books
        $recentBooks = \App\Models\OrderItem::whereHas('order', function ($q) use ($user) {
                $q->where('user_id', $user->id);
            })
            ->with('book')
            ->latest()
            ->take(7)
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'user' => $user,
                'total_orders' => $totalOrders,
                'wishlist_count' => $wishlistCount,
                'review_count' => $reviewCount,
                'profile_completion' => $completion,
                'recent_books' => $recentBooks
            ]
        ]);
    }

    public function edit(Request $request)
    {
        return response()->json([
            'success' => true,
            'data' => [
                'user' => $request->user()
            ]
        ]);
    }

    public function update(Request $request)
    {
        $user = Auth::user();

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email,' . $user->id,
            'password' => 'nullable|min:6|confirmed'
        ]);

        $data = [
            'name' => $request->name,
            'email' => $request->email,
        ];

        if ($request->filled('password')) {
            $data['password'] = Hash::make($request->password);
        }

        $user->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Profile updated successfully.',
            'data' => [
                'user' => $user->fresh()
            ]
        ]);
    }

    public function updateAvatar(Request $request)
    {
        $request->validate([
            'avatar' => 'required|image|mimes:jpg,jpeg,png|max:2048',
        ]);

        $user = Auth::user();

        // Delete old avatar if exists
        $this->deleteProfileImage($user->avatar);

        // Store new avatar
        $path = $this->storePublicImage($request->file('avatar'), 'avatars');

        $user->update([
            'avatar' => $path
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Avatar updated successfully.',
            'data' => [
                'avatar_url' => asset($path)
            ]
        ]);
    }

    public function updateCover(Request $request)
    {
        $request->validate([
            'cover' => 'required|image|mimes:jpg,jpeg,png|max:4096',
        ]);

        $user = Auth::user();

        // Delete old cover
        $this->deleteProfileImage($user->cover);

        // Store new cover
        $path = $this->storePublicImage($request->file('cover'), 'covers');

        $user->update([
            'cover' => $path
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Cover updated successfully.',
            'data' => [
                'cover_url' => asset($path)
            ]
        ]);
    }

    private function storePublicImage($file, string $folder): string
    {
        $extension = $file->getClientOriginalExtension() ?: 'jpg';
        $filename = Str::uuid()->toString() . '.' . $extension;
        $directory = public_path('uploads/' . $folder);

        if (! File::exists($directory)) {
            File::makeDirectory($directory, 0755, true);
        }

        $file->move($directory, $filename);

        return 'uploads/' . $folder . '/' . $filename;
    }

    private function deleteProfileImage(?string $path): void
    {
        if (! $path) {
            return;
        }

        $normalized = ltrim($path, '/');

        if (str_starts_with($normalized, 'storage/')) {
            $relative = substr($normalized, strlen('storage/'));
            if (Storage::disk('public')->exists($relative)) {
                Storage::disk('public')->delete($relative);
            }
            return;
        }

        $publicFile = public_path($normalized);
        if (File::exists($publicFile)) {
            File::delete($publicFile);
        }
    }

    public function destroy(Request $request)
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json([
            'success' => true,
            'message' => 'Account deleted successfully.',
            'data' => [
                'redirect' => '/'
            ]
        ]);
    }
}
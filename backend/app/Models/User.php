<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Storage;
use Laravel\Cashier\Billable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    private const STORAGE_PREFIX = 'storage/';

    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, HasApiTokens, Notifiable, Billable;

    private const DEFAULT_ROLE_PERMISSIONS = [
        'admin' => [
            'access_dashboard',
            'manage_orders',
            'manage_payments',
            'books.view',
            'books.create',
            'books.edit',
            'books.delete',
            'authors.view',
            'authors.create',
            'authors.edit',
            'authors.delete',
            'users.view',
            'users.create',
            'users.edit',
            'users.delete',
            'manage_reviews',
            'manage_notifications',
            'manage_roles_permissions',
        ],
        'manager' => [
            'access_dashboard',
            'manage_orders',
            'books.view',
            'books.create',
            'books.edit',
            'books.delete',
            'authors.view',
            'authors.create',
            'authors.edit',
            'authors.delete',
            'manage_reviews',
            'manage_notifications',
        ],
        'staff' => [
            'access_dashboard',
            'manage_orders',
            'manage_reviews',
        ],
        'user' => [],
    ];

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'is_active',
        'plan',
        'avatar',
        'cover',
        'billing_cycle',
        'plan_expires_at',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $appends = [
        'avatar_url',
        'cover_url',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'plan_expires_at' => 'datetime',
        ];
    }

    public function orders()
    {
        return $this->hasMany(Order::class);
    }

    public function wishlist()
    {
        return $this->hasMany(Wishlist::class);
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

public function isAdmin()
{
    return strtolower((string) $this->role) === 'admin';
}

public function isManager()
{
    return strtolower((string) $this->role) === 'manager';
}

public function isStaff()
{
    return strtolower((string) $this->role) === 'staff';
}

public function hasRole(string $role): bool
{
    return strtolower((string) $this->role) === strtolower($role);
}

public function permissions(): array
{
    $role = strtolower((string) ($this->role ?? 'user'));

    if ($role === 'admin') {
        return self::DEFAULT_ROLE_PERMISSIONS['admin'];
    }

    $saved = RolePermission::query()
        ->whereRaw('LOWER(role) = ?', [$role])
        ->value('permissions');

    if (is_array($saved)) {
        return array_values(array_unique($saved));
    }

    return self::DEFAULT_ROLE_PERMISSIONS[$role] ?? [];
}

public function hasPermission(string $permission): bool
{
    if ($this->hasRole('admin')) {
        return true;
    }

    return in_array($permission, $this->permissions(), true);
}

public function hasActiveSubscription()
{
    return $this->subscribed('default') || (
        $this->plan !== 'free' &&
        $this->plan_expires_at &&
        now()->lt($this->plan_expires_at)
    );
}

public function canAccessBook(Book $book): bool
{
    if (! $book->is_premium) {
        return true;
    }

    return $this->hasActiveSubscription();
}

public function getAvatarUrlAttribute(): string
{
    return $this->resolveImageUrl($this->avatar, 'images/default-avatar.png');
}

public function getCoverUrlAttribute(): string
{
    return $this->resolveImageUrl($this->cover, 'images/default-cover.jpg');
}

private function resolveImageUrl(?string $path, string $fallback): string
{
    $resolvedPath = asset($fallback);

    if (! $path) {
        return $resolvedPath;
    }

    if ($this->isExternalImageUrl($path)) {
        $resolvedPath = $path;
    } else {
        $normalized = ltrim($path, '/');

        $resolvedPath = $this->isUploadedImagePath($normalized)
            ? $this->resolveUploadedImageUrl($normalized, $fallback)
            : $this->resolveStoredImageUrl($normalized, $fallback);
    }

    return $resolvedPath;
}

private function isExternalImageUrl(string $path): bool
{
    return str_starts_with($path, 'http://') || str_starts_with($path, 'https://');
}

private function isUploadedImagePath(string $path): bool
{
    return str_starts_with($path, 'uploads/');
}

private function resolveUploadedImageUrl(string $path, string $fallback): string
{
    if (file_exists(public_path($path))) {
        return asset($path);
    }

    return asset($fallback);
}

private function resolveStoredImageUrl(string $path, string $fallback): string
{
    $normalized = $this->normalizeStoredImagePath($path);
    $publicFile = public_path(self::STORAGE_PREFIX . $normalized);

    if (Storage::disk('public')->exists($normalized) && file_exists($publicFile)) {
        return asset(self::STORAGE_PREFIX . $normalized);
    }

    return asset($fallback);
}

private function normalizeStoredImagePath(string $path): string
{
    if (str_starts_with($path, self::STORAGE_PREFIX)) {
        return substr($path, strlen(self::STORAGE_PREFIX));
    }

    return $path;
}
}

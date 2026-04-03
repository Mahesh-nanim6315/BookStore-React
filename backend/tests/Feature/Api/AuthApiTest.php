<?php

namespace Tests\Feature\Api;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AuthApiTest extends TestCase
{
    use RefreshDatabase;

    private const LOGIN_ENDPOINT = '/api/v1/login';
    private const PROFILE_UPDATE_ENDPOINT = '/api/v1/profile/update';
    private const DEFAULT_STRONG_PASSWORD = 'StrongPass1!';
    private const DEFAULT_USER_EMAIL = 'user@example.com';
    private const UPDATED_USER_NAME = 'Updated User';
    private const UPDATED_USER_EMAIL = 'Updated@Example.com';
    private const NEW_STRONG_PASSWORD = 'NewStrong1!';

    public function test_registration_normalizes_email_and_rejects_weak_passwords(): void
    {
        $weakResponse = $this->postJson('/api/v1/register', [
            'name' => 'Test User',
            'email' => 'Test@Example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
        ]);

        $weakResponse
            ->assertStatus(422)
            ->assertJsonValidationErrors(['password']);

        $strongResponse = $this->postJson('/api/v1/register', [
            'name' => 'Test User',
            'email' => 'Test@Example.com',
            'password' => self::DEFAULT_STRONG_PASSWORD,
            'password_confirmation' => self::DEFAULT_STRONG_PASSWORD,
        ]);

        $strongResponse
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('user.email', 'test@example.com');

        $this->assertDatabaseHas('users', [
            'email' => 'test@example.com',
        ]);
    }

    public function test_inactive_users_cannot_log_in(): void
    {
        $user = User::factory()->create([
            'email' => 'inactive@example.com',
            'password' => self::DEFAULT_STRONG_PASSWORD,
            'is_active' => false,
        ]);

        $response = $this->postJson(self::LOGIN_ENDPOINT, [
            'email' => 'inactive@example.com',
            'password' => self::DEFAULT_STRONG_PASSWORD,
        ]);

        $response
            ->assertStatus(422)
            ->assertJsonValidationErrors(['email']);

        $this->assertNull($user->tokens()->first());
    }

    public function test_login_is_rate_limited_after_repeated_failures(): void
    {
        User::factory()->create([
            'email' => self::DEFAULT_USER_EMAIL,
            'password' => self::DEFAULT_STRONG_PASSWORD,
        ]);

        for ($attempt = 0; $attempt < 5; $attempt++) {
            $this->postJson(self::LOGIN_ENDPOINT, [
                'email' => self::DEFAULT_USER_EMAIL,
                'password' => 'WrongPass1!',
            ])->assertStatus(422);
        }

        $response = $this->postJson(self::LOGIN_ENDPOINT, [
            'email' => self::DEFAULT_USER_EMAIL,
            'password' => 'WrongPass1!',
        ]);

        $response
            ->assertStatus(422)
            ->assertJsonValidationErrors(['email']);

        $this->assertStringContainsString('Too many login attempts', $response->json('errors.email.0'));
    }

    public function test_profile_password_change_requires_current_password_and_strong_new_password(): void
    {
        $user = User::factory()->create([
            'password' => self::DEFAULT_STRONG_PASSWORD,
        ]);

        Sanctum::actingAs($user);

        $missingCurrentPassword = $this->putJson(self::PROFILE_UPDATE_ENDPOINT, [
            'name' => self::UPDATED_USER_NAME,
            'email' => self::UPDATED_USER_EMAIL,
            'password' => self::NEW_STRONG_PASSWORD,
            'password_confirmation' => self::NEW_STRONG_PASSWORD,
        ]);

        $missingCurrentPassword
            ->assertStatus(422)
            ->assertJsonValidationErrors(['current_password']);

        $weakPassword = $this->putJson(self::PROFILE_UPDATE_ENDPOINT, [
            'name' => self::UPDATED_USER_NAME,
            'email' => self::UPDATED_USER_EMAIL,
            'current_password' => self::DEFAULT_STRONG_PASSWORD,
            'password' => 'weakpass',
            'password_confirmation' => 'weakpass',
        ]);

        $weakPassword
            ->assertStatus(422)
            ->assertJsonValidationErrors(['password']);

        $success = $this->putJson(self::PROFILE_UPDATE_ENDPOINT, [
            'name' => self::UPDATED_USER_NAME,
            'email' => self::UPDATED_USER_EMAIL,
            'current_password' => self::DEFAULT_STRONG_PASSWORD,
            'password' => self::NEW_STRONG_PASSWORD,
            'password_confirmation' => self::NEW_STRONG_PASSWORD,
        ]);

        $success
            ->assertOk()
            ->assertJsonPath('data.user.email', 'updated@example.com');

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'email' => 'updated@example.com',
            'name' => self::UPDATED_USER_NAME,
        ]);
    }
}

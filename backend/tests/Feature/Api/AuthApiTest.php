<?php

namespace Tests\Feature\Api;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AuthApiTest extends TestCase
{
    use RefreshDatabase;

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
            'password' => 'StrongPass1!',
            'password_confirmation' => 'StrongPass1!',
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
            'password' => 'StrongPass1!',
            'is_active' => false,
        ]);

        $response = $this->postJson('/api/v1/login', [
            'email' => 'inactive@example.com',
            'password' => 'StrongPass1!',
        ]);

        $response
            ->assertStatus(422)
            ->assertJsonValidationErrors(['email']);

        $this->assertNull($user->tokens()->first());
    }

    public function test_login_is_rate_limited_after_repeated_failures(): void
    {
        User::factory()->create([
            'email' => 'user@example.com',
            'password' => 'StrongPass1!',
        ]);

        for ($attempt = 0; $attempt < 5; $attempt++) {
            $this->postJson('/api/v1/login', [
                'email' => 'user@example.com',
                'password' => 'WrongPass1!',
            ])->assertStatus(422);
        }

        $response = $this->postJson('/api/v1/login', [
            'email' => 'user@example.com',
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
            'password' => 'StrongPass1!',
        ]);

        Sanctum::actingAs($user);

        $missingCurrentPassword = $this->putJson('/api/v1/profile/update', [
            'name' => 'Updated User',
            'email' => 'Updated@Example.com',
            'password' => 'NewStrong1!',
            'password_confirmation' => 'NewStrong1!',
        ]);

        $missingCurrentPassword
            ->assertStatus(422)
            ->assertJsonValidationErrors(['current_password']);

        $weakPassword = $this->putJson('/api/v1/profile/update', [
            'name' => 'Updated User',
            'email' => 'Updated@Example.com',
            'current_password' => 'StrongPass1!',
            'password' => 'weakpass',
            'password_confirmation' => 'weakpass',
        ]);

        $weakPassword
            ->assertStatus(422)
            ->assertJsonValidationErrors(['password']);

        $success = $this->putJson('/api/v1/profile/update', [
            'name' => 'Updated User',
            'email' => 'Updated@Example.com',
            'current_password' => 'StrongPass1!',
            'password' => 'NewStrong1!',
            'password_confirmation' => 'NewStrong1!',
        ]);

        $success
            ->assertOk()
            ->assertJsonPath('data.user.email', 'updated@example.com');

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'email' => 'updated@example.com',
            'name' => 'Updated User',
        ]);
    }
}

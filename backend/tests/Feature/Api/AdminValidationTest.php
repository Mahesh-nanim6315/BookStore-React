<?php

namespace Tests\Feature\Api;

use App\Models\Author;
use App\Models\Category;
use App\Models\Genre;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AdminValidationTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_user_creation_requires_confirmed_strong_password(): void
    {
        $admin = User::factory()->create([
            'role' => 'admin',
        ]);

        Sanctum::actingAs($admin);

        $response = $this->postJson('/api/v1/admin/users', [
            'name' => 'Staff User',
            'email' => 'Staff@Example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
            'role' => 'staff',
        ]);

        $response
            ->assertStatus(422)
            ->assertJsonValidationErrors(['password']);

        $success = $this->postJson('/api/v1/admin/users', [
            'name' => 'Staff User',
            'email' => 'Staff@Example.com',
            'password' => 'StrongPass1!',
            'password_confirmation' => 'StrongPass1!',
            'role' => 'staff',
        ]);

        $success
            ->assertOk()
            ->assertJsonPath('data.user.email', 'staff@example.com');
    }

    public function test_book_formats_require_dependent_fields_when_enabled(): void
    {
        $admin = User::factory()->create([
            'role' => 'admin',
        ]);

        $author = Author::create([
            'name' => 'Author One',
        ]);

        $category = Category::create([
            'name' => 'Category One',
            'slug' => 'category-one',
        ]);

        $genre = Genre::create([
            'name' => 'Genre One',
        ]);

        Sanctum::actingAs($admin);

        $response = $this->postJson('/api/v1/admin/books', [
            'name' => 'Book One',
            'description' => 'A valid description',
            'language' => 'English',
            'author_id' => $author->id,
            'category_id' => $category->id,
            'genre_id' => $genre->id,
            'image' => 'https://example.com/book.jpg',
            'price' => 199,
            'has_ebook' => true,
        ]);

        $response
            ->assertStatus(422)
            ->assertJsonValidationErrors(['ebook_price', 'ebook_pdf', 'ebook_pages']);
    }
}

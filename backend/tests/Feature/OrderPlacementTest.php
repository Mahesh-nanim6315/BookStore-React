<?php

namespace Tests\Feature;

use App\Models\Author;
use App\Models\Book;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Category;
use App\Models\Genre;
use App\Models\Order;
use App\Models\User;
use App\Models\UserLibrary;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OrderPlacementTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_can_place_order_from_cart_with_pricing_fields(): void
    {
        $user = User::factory()->create();
        $author = Author::create([
            'name' => 'Test Author',
            'image' => 'author.jpg',
            'bio' => 'Bio',
        ]);
        $category = Category::create([
            'name' => 'Fiction',
            'slug' => 'fiction',
        ]);
        $genre = Genre::create([
            'name' => 'Fantasy',
        ]);
        $book = Book::create([
            'name' => 'Test Book',
            'description' => 'Book description',
            'language' => 'en',
            'image' => 'book.jpg',
            'author_id' => $author->id,
            'category_id' => $category->id,
            'genre_id' => $genre->id,
            'has_ebook' => true,
            'ebook_price' => 200,
            'price' => 200,
        ]);
        $cart = Cart::create([
            'user_id' => $user->id,
        ]);

        CartItem::create([
            'cart_id' => $cart->id,
            'book_id' => $book->id,
            'format' => 'ebook',
            'price' => 200,
            'quantity' => 2,
        ]);

        $response = $this
            ->actingAs($user)
            ->withSession([
                'coupon' => [
                    'code' => 'SAVE10',
                    'discount' => 40,
                ],
            ])
            ->postJson('/api/v1/orders', [
                'payment_id' => 'pay_test_123',
            ]);

        $response
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.order.subtotal', '400.00')
            ->assertJsonPath('data.order.tax_amount', '20.00')
            ->assertJsonPath('data.order.discount_amount', '40.00')
            ->assertJsonPath('data.order.coupon_code', 'SAVE10')
            ->assertJsonPath('data.order.total_amount', '380.00')
            ->assertJsonPath('data.redirect', '/orders/1');

        $this->assertDatabaseHas('orders', [
            'user_id' => $user->id,
            'subtotal' => 400,
            'tax_amount' => 20,
            'discount_amount' => 40,
            'coupon_code' => 'SAVE10',
            'total_amount' => 380,
            'payment_id' => 'pay_test_123',
        ]);

        $this->assertDatabaseCount('order_items', 1);
        $this->assertDatabaseMissing('carts', [
            'id' => $cart->id,
        ]);
        $this->assertDatabaseHas('user_library', [
            'user_id' => $user->id,
            'book_id' => $book->id,
            'format' => 'ebook',
        ]);

        $order = Order::firstOrFail();
        $libraryEntry = UserLibrary::firstOrFail();

        $this->assertSame('completed', $order->status);
        $this->assertSame('paid', $order->payment_status);
        $this->assertSame($order->id, $response->json('data.order.id'));
        $this->assertNotNull($libraryEntry->expires_at);
    }
}

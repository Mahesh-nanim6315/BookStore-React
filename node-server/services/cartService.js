const cartModel = require("../models/cartModel");
const settingsModel = require("../models/settingsModel");

async function getCart(user) {
  const cart = await cartModel.findCartByUserId(user.id);
  const items = cart ? await cartModel.getCartItemsByCartId(cart.id) : [];
  const mappedItems = items.map(mapCartItem);
  const subtotal = mappedItems.reduce(
    (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0),
    0,
  );
  const taxRate = await settingsModel.getTaxRate();
  const tax = await settingsModel.calculateTax(subtotal);
  const discount = 0;
  const total = Math.max(0, subtotal + tax - discount);

  return {
    success: true,
    data: {
      cart: cart
        ? {
            ...cart,
            items: mappedItems,
          }
        : null,
      subtotal,
      tax,
      tax_rate: taxRate,
      items_count: mappedItems.length,
      coupon: null,
      discount,
      total,
    },
  };
}

function mapCartItem(row) {
  return {
    id: row.id,
    cart_id: row.cart_id,
    book_id: row.book_id,
    format: row.format,
    quantity: Number(row.quantity || 0),
    price: Number(row.price || 0),
    created_at: row.created_at,
    updated_at: row.updated_at,
    book: mapBook(row),
  };
}

function mapBook(row) {
  return {
    id: row.book_join_id,
    name: row.book_name,
    description: row.book_description,
    language: row.book_language,
    image: row.book_image,
    author_id: row.book_author_id,
    category_id: row.book_category_id,
    genre_id: row.book_genre_id,
    has_ebook: Boolean(row.book_has_ebook),
    ebook_price: row.book_ebook_price,
    ebook_pdf: row.book_ebook_pdf,
    ebook_pages: row.book_ebook_pages,
    has_audio: Boolean(row.book_has_audio),
    audio_price: row.book_audio_price,
    audio_file: row.book_audio_file,
    audio_minutes: row.book_audio_minutes,
    has_paperback: Boolean(row.book_has_paperback),
    paperback_price: row.book_paperback_price,
    paperback_pages: row.book_paperback_pages,
    stock: row.book_stock,
    is_premium: Boolean(row.book_is_premium),
    price: row.book_price,
    author: row.author_join_id
      ? {
          id: row.author_join_id,
          name: row.author_name,
          bio: row.author_bio,
          image: row.author_image,
        }
      : null,
    category: row.category_join_id
      ? {
          id: row.category_join_id,
          name: row.category_name,
          slug: row.category_slug,
        }
      : null,
    genre: row.genre_join_id
      ? {
          id: row.genre_join_id,
          name: row.genre_name,
        }
      : null,
  };
}

module.exports = {
  getCart,
};

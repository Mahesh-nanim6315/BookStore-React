const knex = require("../config/knex");

async function query(sql, bindings = []) {
  const [rows] = await knex.raw(sql, bindings);
  return rows;
}

async function queryOne(sql, bindings = []) {
  const rows = await query(sql, bindings);
  return rows[0] || null;
}

async function getHomeCategories(limit = 6) {
  return query(
    "SELECT id, name, slug, created_at, updated_at FROM categories ORDER BY id ASC LIMIT ?",
    [Number(limit)],
  );
}

async function getBooksByCategoryIds(categoryIds) {
  if (!Array.isArray(categoryIds) || categoryIds.length === 0) {
    return [];
  }

  return query(
    `SELECT *
     FROM books
     WHERE category_id IN (${categoryIds.map(() => "?").join(", ")})
     ORDER BY id DESC`,
    categoryIds,
  );
}

async function getRecentBooks(limit = 12) {
  return query("SELECT * FROM books ORDER BY id DESC LIMIT ?", [Number(limit)]);
}

async function getTrendingBooks(limit = 12) {
  return query(
    `SELECT b.*, COUNT(r.id) AS reviews_count
     FROM books b
     LEFT JOIN reviews r ON r.book_id = b.id
     GROUP BY b.id
     ORDER BY reviews_count DESC, b.id DESC
     LIMIT ?`,
    [Number(limit)],
  );
}

async function getBooksByIds(ids) {
  if (!Array.isArray(ids) || ids.length === 0) {
    return [];
  }

  return query(
    `SELECT *
     FROM books
     WHERE id IN (${ids.map(() => "?").join(", ")})`,
    ids,
  );
}

async function countProducts(whereClause, params) {
  return queryOne(
    `SELECT COUNT(*) AS total
     FROM books b
     ${whereClause}`,
    params,
  );
}

async function findProducts(whereClause, orderClause, perPage, offset, params) {
  return query(
    `SELECT
       b.*,
       c.id AS category_join_id,
       c.name AS category_name,
       c.slug AS category_slug,
       a.id AS author_join_id,
       a.name AS author_name
     FROM books b
     LEFT JOIN categories c ON c.id = b.category_id
     LEFT JOIN authors a ON a.id = b.author_id
     ${whereClause}
     ${orderClause}
     LIMIT ${Number(perPage)} OFFSET ${Number(offset)}`,
    params,
  );
}

async function getAllCategories() {
  return query("SELECT id, name, slug, created_at, updated_at FROM categories ORDER BY name ASC");
}

async function getAllAuthors() {
  return query("SELECT id, name, bio, image, created_at, updated_at FROM authors ORDER BY name ASC");
}

async function getAllGenres() {
  return query("SELECT id, name, created_at, updated_at FROM genres ORDER BY name ASC");
}

async function getDistinctLanguages() {
  return query(
    "SELECT DISTINCT language FROM books WHERE language IS NOT NULL AND language != '' ORDER BY language ASC",
  );
}

async function findBookWithRelations(bookId) {
  return queryOne(
    `SELECT
       b.*,
       a.id AS author_join_id,
       a.name AS author_name,
       a.bio AS author_bio,
       a.image AS author_image,
       c.id AS category_join_id,
       c.name AS category_name,
       c.slug AS category_slug,
       g.id AS genre_join_id,
       g.name AS genre_name
     FROM books b
     LEFT JOIN authors a ON a.id = b.author_id
     LEFT JOIN categories c ON c.id = b.category_id
     LEFT JOIN genres g ON g.id = b.genre_id
     WHERE b.id = :bookId
     LIMIT 1`,
    { bookId: Number(bookId) },
  );
}

async function getBookReviews({ bookId, user }) {
  let whereClause = "WHERE r.book_id = :bookId";
  const params = {
    bookId,
  };

  if (user && String(user.role || "").toLowerCase() !== "admin") {
    whereClause += " AND (r.is_approved = 1 OR r.user_id = :userId)";
    params.userId = Number(user.id);
  } else if (!user) {
    whereClause += " AND r.is_approved = 1";
  }

  return query(
    `SELECT
       r.*,
       u.id AS user_join_id,
       u.name AS user_name,
       u.email AS user_email
     FROM reviews r
     LEFT JOIN users u ON u.id = r.user_id
     ${whereClause}
     ORDER BY r.id DESC`,
    params,
  );
}

async function getRecommendedBooksForUser({ userId, bookId }) {
  return query(
    `SELECT DISTINCT b.*
     FROM order_items oi
     INNER JOIN orders o ON o.id = oi.order_id
     INNER JOIN books purchased_book ON purchased_book.id = oi.book_id
     INNER JOIN books b ON b.category_id = purchased_book.category_id
     WHERE o.user_id = :userId
       AND b.id != :bookId
     ORDER BY b.id DESC
     LIMIT 5`,
    {
      userId: Number(userId),
      bookId: Number(bookId),
    },
  );
}

async function getRecommendedBooksForGuest({ bookId, categoryId, genreId }) {
  return query(
    `SELECT *
     FROM books
     WHERE id != :bookId
       AND (category_id = :categoryId OR genre_id = :genreId)
     ORDER BY id DESC
     LIMIT 5`,
    {
      bookId: Number(bookId),
      categoryId: Number(categoryId),
      genreId: Number(genreId),
    },
  );
}

async function getCategoriesWithCounts() {
  return query(
    `SELECT
       c.*,
       COUNT(b.id) AS books_count,
       SUM(CASE WHEN b.has_ebook = 1 THEN 1 ELSE 0 END) AS ebooks_count,
       SUM(CASE WHEN b.has_audio = 1 THEN 1 ELSE 0 END) AS audiobooks_count,
       SUM(CASE WHEN b.has_paperback = 1 THEN 1 ELSE 0 END) AS paperbacks_count
     FROM categories c
     LEFT JOIN books b ON b.category_id = c.id
     GROUP BY c.id
     ORDER BY c.name ASC`,
  );
}

async function findCategoryBySlug(slug) {
  return queryOne(
    "SELECT id, name, slug FROM categories WHERE slug = :slug LIMIT 1",
    { slug: String(slug) },
  );
}

async function countBooksByCategoryId(categoryId) {
  return queryOne(
    "SELECT COUNT(*) AS total FROM books WHERE category_id = :categoryId",
    { categoryId: Number(categoryId) },
  );
}

async function getBooksByCategoryId(categoryId, perPage, offset) {
  return query(
    `SELECT *
     FROM books
     WHERE category_id = :categoryId
     ORDER BY id DESC
     LIMIT ${Number(perPage)} OFFSET ${Number(offset)}`,
    { categoryId: Number(categoryId) },
  );
}

async function getAuthorsOrderedById() {
  return query(
    "SELECT id, name, bio, image, created_at, updated_at FROM authors ORDER BY id ASC",
  );
}

async function findAuthorById(authorId) {
  return queryOne(
    "SELECT id, name, bio, image, created_at, updated_at FROM authors WHERE id = :authorId LIMIT 1",
    { authorId: Number(authorId) },
  );
}

async function getBooksByAuthorId(authorId) {
  return query(
    "SELECT * FROM books WHERE author_id = :authorId ORDER BY id DESC",
    { authorId: Number(authorId) },
  );
}

async function getCategoriesByNames(categoryNames) {
  if (!Array.isArray(categoryNames) || categoryNames.length === 0) {
    return [];
  }

  return query(
    `SELECT id, name, slug, created_at, updated_at
     FROM categories
     WHERE name IN (${categoryNames.map(() => "?").join(", ")})`,
    categoryNames,
  );
}

async function getBooksByCategoryAndFormat({ categoryId, flagColumn }) {
  return query(
    `SELECT *
     FROM books
     WHERE category_id = :categoryId
       AND ${flagColumn} = 1
     ORDER BY id DESC
     LIMIT 10`,
    { categoryId: Number(categoryId) },
  );
}

module.exports = {
  getHomeCategories,
  getBooksByCategoryIds,
  getRecentBooks,
  getTrendingBooks,
  getBooksByIds,
  countProducts,
  findProducts,
  getAllCategories,
  getAllAuthors,
  getAllGenres,
  getDistinctLanguages,
  findBookWithRelations,
  getBookReviews,
  getRecommendedBooksForUser,
  getRecommendedBooksForGuest,
  getCategoriesWithCounts,
  findCategoryBySlug,
  countBooksByCategoryId,
  getBooksByCategoryId,
  getAuthorsOrderedById,
  findAuthorById,
  getBooksByAuthorId,
  getCategoriesByNames,
  getBooksByCategoryAndFormat,
};

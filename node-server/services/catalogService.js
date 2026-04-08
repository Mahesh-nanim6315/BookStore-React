const catalogModel = require("../models/catalogModel");
const settingsModel = require("../models/settingsModel");
const { AppError } = require("../utils/helpers");

const FORMAT_SHELF_NAMES = {
  ebook: ["Drama", "Thriller", "Social", "Family", "Romance", "Humor", "Horror", "Historical"],
  audio: ["Drama", "Thriller", "Social", "Fantasy", "Family", "Romance", "Humor", "Horror", "Historical"],
  paperback: ["Drama", "Thriller", "Social", "Family", "Romance", "Humor", "Horror", "Historical"],
};

async function getHomeData(recentlyViewedIds = []) {
  const categories = await catalogModel.getHomeCategories(6);

  const categoryIds = categories.map((category) => category.id);
  const categoryBooks = await catalogModel.getBooksByCategoryIds(categoryIds);

  const categoriesWithBooks = categories.map((category) => ({
    ...category,
    books: categoryBooks.filter((book) => Number(book.category_id) === Number(category.id)).slice(0, 15),
  }));

  const recentBooks = await catalogModel.getRecentBooks(12);
  const trendingBooks = await catalogModel.getTrendingBooks(12);

  const recentlyViewedBooks = recentlyViewedIds.length
    ? await fetchBooksByIdsInOrder(recentlyViewedIds)
    : [];

  return {
    success: true,
    data: {
      recent_books: recentBooks,
      trending_books: trendingBooks,
      categories: categoriesWithBooks,
      recently_viewed_books: recentlyViewedBooks,
    },
  };
}

async function getProducts(query) {
  const page = parsePositiveInteger(query.page, 1);
  const perPage = await getBooksPerPage();
  const offset = (page - 1) * perPage;

  const filters = [];
  const params = {};

  if (query.search) {
    filters.push("b.name LIKE :search");
    params.search = `%${String(query.search).trim()}%`;
  }

  if (query.category_id) {
    filters.push("b.category_id = :categoryId");
    params.categoryId = Number(query.category_id);
  }

  if (query.language) {
    filters.push("b.language = :language");
    params.language = String(query.language).trim();
  }

  if (query.author_id) {
    filters.push("b.author_id = :authorId");
    params.authorId = Number(query.author_id);
  }

  if (query.genre_id) {
    filters.push("b.genre_id = :genreId");
    params.genreId = Number(query.genre_id);
  }

  const whereClause = filters.length ? `WHERE ${filters.join(" AND ")}` : "";
  const orderClause =
    query.sort === "price_asc"
      ? "ORDER BY b.price ASC, b.id DESC"
      : query.sort === "price_desc"
        ? "ORDER BY b.price DESC, b.id DESC"
        : "ORDER BY b.id DESC";

  const countRow = await catalogModel.countProducts(whereClause, params);

  const books = await catalogModel.findProducts(
    whereClause,
    orderClause,
    perPage,
    offset,
    params,
  );

  const categories = await catalogModel.getAllCategories();
  const authors = await catalogModel.getAllAuthors();
  const genres = await catalogModel.getAllGenres();
  const languages = await catalogModel.getDistinctLanguages();

  const total = Number(countRow?.total || 0);
  const lastPage = total > 0 ? Math.ceil(total / perPage) : 1;

  return {
    success: true,
    data: {
      books: buildPagination({
        items: books.map((book) => ({
          ...stripJoinedFields(book),
          category: book.category_join_id
            ? {
                id: book.category_join_id,
                name: book.category_name,
                slug: book.category_slug,
              }
            : null,
          author: book.author_join_id
            ? {
                id: book.author_join_id,
                name: book.author_name,
              }
            : null,
        })),
        total,
        page,
        perPage,
      }),
      filters: {
        categories,
        authors,
        genres,
        languages: languages.map((item) => item.language).filter(Boolean),
      },
    },
  };
}

async function getBookDetails({ bookId, user, recentlyViewedIds = [] }) {
  const book = await catalogModel.findBookWithRelations(bookId);

  if (!book) {
    throw new AppError("Book not found.", 404);
  }

  if (Number(book.is_premium) && !canUserAccessPremiumBook(user)) {
    throw new AppError("This book requires a premium subscription.", 403, {
      redirect: "/plans",
    });
  }

  const reviews = await fetchBookReviews(book.id, user);
  const recommendedBooks = await getRecommendedBooks(book, user);

  return {
    success: true,
    data: {
      book: {
        ...stripJoinedFields(book),
        author: book.author_join_id
          ? {
              id: book.author_join_id,
              name: book.author_name,
              bio: book.author_bio,
              image: book.author_image,
            }
          : null,
        category: book.category_join_id
          ? {
              id: book.category_join_id,
              name: book.category_name,
              slug: book.category_slug,
            }
          : null,
        genre: book.genre_join_id
          ? {
              id: book.genre_join_id,
              name: book.genre_name,
            }
          : null,
      },
      reviews,
      recommended_books: recommendedBooks,
      recently_viewed: buildRecentlyViewedIds(recentlyViewedIds, book.id),
    },
  };
}

async function getCategories() {
  const categories = await catalogModel.getCategoriesWithCounts();

  return {
    success: true,
    data: categories.map((category) => ({
      ...category,
      books_count: Number(category.books_count || 0),
      ebooks_count: Number(category.ebooks_count || 0),
      audiobooks_count: Number(category.audiobooks_count || 0),
      paperbacks_count: Number(category.paperbacks_count || 0),
    })),
  };
}

async function getCategoryBooks(slug, query) {
  const category = await catalogModel.findCategoryBySlug(slug);

  if (!category) {
    throw new AppError("Category not found.", 404);
  }

  const page = parsePositiveInteger(query.page, 1);
  const perPage = await getBooksPerPage();
  const offset = (page - 1) * perPage;
  const countRow = await catalogModel.countBooksByCategoryId(category.id);
  const books = await catalogModel.getBooksByCategoryId(category.id, perPage, offset);

  return {
    success: true,
    data: {
      category: category.name,
      books: buildPagination({
        items: books,
        total: Number(countRow?.total || 0),
        page,
        perPage,
      }),
    },
  };
}

async function getAuthors() {
  const authors = await catalogModel.getAuthorsOrderedById();

  return {
    success: true,
    data: authors,
  };
}

async function getAuthorById(authorId) {
  const author = await catalogModel.findAuthorById(authorId);

  if (!author) {
    throw new AppError("Author not found.", 404);
  }

  const books = await catalogModel.getBooksByAuthorId(authorId);

  return {
    success: true,
    data: {
      ...author,
      books,
    },
  };
}

async function getFormatShelves(format) {
  const categoryNames = FORMAT_SHELF_NAMES[format];
  const flagColumn =
    format === "ebook" ? "has_ebook" : format === "audio" ? "has_audio" : "has_paperback";

  const categories = await catalogModel.getCategoriesByNames(categoryNames);

  const shelves = {};
  for (const category of categories) {
    shelves[category.name.toLowerCase()] = await catalogModel.getBooksByCategoryAndFormat({
      categoryId: category.id,
      flagColumn,
    });
  }

  return {
    success: true,
    data: {
      ...shelves,
      categories: categories.reduce((accumulator, category) => {
        accumulator[category.name] = category;
        return accumulator;
      }, {}),
    },
  };
}

async function getFaq() {
  return {
    success: true,
    data: [],
  };
}

async function getPublicSettings() {
  const rows = await settingsModel.getMany([
    "site_name",
    "support_email",
    "tax_rate",
    "maintenance_mode",
  ]);
  const map = Object.fromEntries(rows.map((row) => [row.key, row.value]));

  return {
    success: true,
    data: {
      site_name: String(map.site_name || ""),
      support_email: String(map.support_email || ""),
      tax_rate: String(map.tax_rate || "5"),
      maintenance_mode: String(map.maintenance_mode || "0"),
    },
  };
}

async function getPlans() {
  const subscriptionsEnabled = await getSetting("subscriptions_enabled", "1");
  const freeTrialDays = await getSetting("free_trial_days", "7");

  return {
    success: true,
    data: {
      plans: [
        {
          name: "Free Reader",
          monthly: 0,
          yearly: 0,
          features: ["Access to free books", "2 downloads per month", "Standard support"],
        },
        {
          name: "Premium Reader",
          monthly: 9,
          yearly: 90,
          features: ["Unlimited ebooks", "5 audiobooks per month", "Early access releases", "No ads"],
          popular: true,
        },
        {
          name: "Ultimate Reader",
          monthly: 19,
          yearly: 190,
          features: ["Unlimited ebooks", "Unlimited audiobooks", "Offline downloads", "Exclusive content", "Priority support"],
        },
      ],
      subscriptions_enabled: String(subscriptionsEnabled) === "1",
      free_trial_days: Number(freeTrialDays || 7),
    },
  };
}

async function fetchBookReviews(bookId, user) {
  const rows = await catalogModel.getBookReviews({
    bookId,
    user,
  });

  return rows.map((review) => ({
    ...stripJoinedFields(review),
    is_approved: Boolean(review.is_approved),
    user: review.user_join_id
      ? {
          id: review.user_join_id,
          name: review.user_name,
          email: review.user_email,
        }
      : null,
  }));
}

async function getRecommendedBooks(book, user) {
  if (user) {
    return catalogModel.getRecommendedBooksForUser({
      userId: user.id,
      bookId: book.id,
    });
  }

  return catalogModel.getRecommendedBooksForGuest({
    bookId: book.id,
    categoryId: book.category_id,
    genreId: book.genre_id,
  });
}

async function fetchBooksByIdsInOrder(ids) {
  const rows = await catalogModel.getBooksByIds(ids);

  const byId = new Map(rows.map((row) => [Number(row.id), row]));
  return ids.map((id) => byId.get(Number(id))).filter(Boolean);
}

function buildPagination({ items, total, page, perPage }) {
  const lastPage = total > 0 ? Math.ceil(total / perPage) : 1;

  return {
    current_page: page,
    data: items,
    last_page: lastPage,
    per_page: perPage,
    total,
  };
}

function stripJoinedFields(row) {
  const clone = { ...row };

  for (const key of Object.keys(clone)) {
    if (key.includes("_join_") || key.endsWith("_join_id") || key.endsWith("_name") || key.endsWith("_slug") || key.endsWith("_bio") || key.endsWith("_image") || key.endsWith("_email")) {
      delete clone[key];
    }
  }

  return clone;
}

function canUserAccessPremiumBook(user) {
  if (!user) {
    return false;
  }

  if (String(user.role || "").toLowerCase() === "admin") {
    return true;
  }

  if (String(user.plan || "free") === "free" || !user.plan_expires_at) {
    return false;
  }

  const planExpiresAt = new Date(user.plan_expires_at);
  return !Number.isNaN(planExpiresAt.getTime()) && planExpiresAt > new Date();
}

function buildRecentlyViewedIds(existingIds, currentBookId) {
  const deduped = existingIds.filter((item) => Number(item) !== Number(currentBookId));
  deduped.unshift(Number(currentBookId));
  return deduped.slice(0, 10);
}

async function getBooksPerPage() {
  const rawValue = await getSetting("books_per_page", "12");
  const parsed = Number(rawValue || 12);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 12;
}

async function getSetting(key, fallback) {
  return settingsModel.getValue(key, fallback);
}

function parsePositiveInteger(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

module.exports = {
  getHomeData,
  getProducts,
  getBookDetails,
  getCategories,
  getCategoryBooks,
  getAuthors,
  getAuthorById,
  getFormatShelves,
  getFaq,
  getPublicSettings,
  getPlans,
};

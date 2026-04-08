const catalogService = require("../services/catalogService");

async function home(req, res, next) {
  try {
    const recentlyViewedIds = parseRecentlyViewedCookie(req);
    const result = await catalogService.getHomeData(recentlyViewedIds);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

async function products(req, res, next) {
  try {
    const result = await catalogService.getProducts(req.query);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

async function booksIndex(req, res, next) {
  try {
    const result = await catalogService.getProducts(req.query);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

async function show(req, res, next) {
  try {
    const recentlyViewedIds = parseRecentlyViewedCookie(req);
    const result = await catalogService.getBookDetails({
      bookId: req.params.bookId,
      user: req.rawUser || req.user || null,
      recentlyViewedIds,
    });

    const nextRecentlyViewed = updateRecentlyViewedList(recentlyViewedIds, req.params.bookId);
    res.cookie("recently_viewed", JSON.stringify(nextRecentlyViewed), {
      httpOnly: false,
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
}

async function details(req, res, next) {
  return show(req, res, next);
}

async function categories(req, res, next) {
  try {
    const result = await catalogService.getCategories();
    res.json(result);
  } catch (error) {
    next(error);
  }
}

async function categoryBooks(req, res, next) {
  try {
    const result = await catalogService.getCategoryBooks(req.params.slug, req.query);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

async function authors(req, res, next) {
  try {
    const result = await catalogService.getAuthors();
    res.json(result);
  } catch (error) {
    next(error);
  }
}

async function author(req, res, next) {
  try {
    const result = await catalogService.getAuthorById(req.params.authorId);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

async function ebooks(req, res, next) {
  try {
    const result = await catalogService.getFormatShelves("ebook");
    res.json(result);
  } catch (error) {
    next(error);
  }
}

async function audiobooks(req, res, next) {
  try {
    const result = await catalogService.getFormatShelves("audio");
    res.json(result);
  } catch (error) {
    next(error);
  }
}

async function paperbacks(req, res, next) {
  try {
    const result = await catalogService.getFormatShelves("paperback");
    res.json(result);
  } catch (error) {
    next(error);
  }
}

async function faq(req, res, next) {
  try {
    const result = await catalogService.getFaq();
    res.json(result);
  } catch (error) {
    next(error);
  }
}

async function publicSettings(req, res, next) {
  try {
    const result = await catalogService.getPublicSettings();
    res.json(result);
  } catch (error) {
    next(error);
  }
}

async function plans(req, res, next) {
  try {
    const result = await catalogService.getPlans();
    res.json(result);
  } catch (error) {
    next(error);
  }
}

async function about(_req, res) {
  res.json({
    success: true,
    data: {
      content: "About page content here",
      features: [],
    },
  });
}

function parseRecentlyViewedCookie(req) {
  const cookies = String(req.headers.cookie || "")
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean);

  const target = cookies.find((item) => item.startsWith("recently_viewed="));
  if (!target) {
    return [];
  }

  try {
    const value = decodeURIComponent(target.split("=").slice(1).join("="));
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map((item) => Number(item)).filter(Number.isFinite) : [];
  } catch (_error) {
    return [];
  }
}

function updateRecentlyViewedList(existingIds, bookId) {
  const normalizedBookId = Number(bookId);
  const filtered = existingIds.filter((item) => Number(item) !== normalizedBookId);
  filtered.unshift(normalizedBookId);
  return filtered.slice(0, 10);
}

module.exports = {
  home,
  products,
  booksIndex,
  show,
  details,
  categories,
  categoryBooks,
  authors,
  author,
  ebooks,
  audiobooks,
  paperbacks,
  faq,
  publicSettings,
  plans,
  about,
};

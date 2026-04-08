const wishlistService = require("../services/wishlistService");

async function index(req, res, next) {
  try {
    const result = await wishlistService.getWishlist(req.user);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

async function toggle(req, res, next) {
  try {
    const result = await wishlistService.toggleWishlist(req.user, req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

async function destroy(req, res, next) {
  try {
    const result = await wishlistService.removeWishlistItem(req.user, req.params.wishlistId);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  index,
  toggle,
  destroy,
};

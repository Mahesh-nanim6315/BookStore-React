const cartService = require("../services/cartService");

async function index(req, res, next) {
  try {
    const result = await cartService.getCart(req.user);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  index,
};

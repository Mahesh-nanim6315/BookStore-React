const orderService = require("../services/orderService");

async function index(req, res, next) {
  try {
    const result = await orderService.getOrders(req.user);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  index,
};

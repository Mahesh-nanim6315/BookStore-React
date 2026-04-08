const subscriptionService = require("../services/subscriptionService");

async function checkout(req, res, next) {
  try {
    const result = await subscriptionService.checkout(req.user, req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

async function success(req, res, next) {
  try {
    const result = await subscriptionService.success(req.user, req.query);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

async function cancel(req, res, next) {
  try {
    const result = await subscriptionService.cancel(req.user);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

async function resume(req, res, next) {
  try {
    const result = await subscriptionService.resume(req.user);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  checkout,
  success,
  cancel,
  resume,
};

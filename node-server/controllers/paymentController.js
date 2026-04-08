const paymentService = require("../services/paymentService");

async function process(req, res, next) {
  try {
    const result = await paymentService.process(req.params.orderId, req.user, req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

async function stripeCheckout(req, res, next) {
  try {
    const result = await paymentService.stripeCheckout(req.params.orderId, req.user);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

async function stripeSuccess(req, res, next) {
  try {
    const result = await paymentService.stripeSuccess(
      req.params.orderId,
      req.user,
      req.query,
    );
    res.json(result);
  } catch (error) {
    next(error);
  }
}

async function stripeCancel(_req, res, next) {
  try {
    const result = paymentService.stripeCancel();
    res.status(422).json(result);
  } catch (error) {
    next(error);
  }
}

async function paypalPay(req, res, next) {
  try {
    const result = await paymentService.paypalPay(req.params.orderId, req.user);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

async function paypalSuccess(req, res, next) {
  try {
    const result = await paymentService.paypalSuccess(
      req.params.orderId,
      req.user,
      req.query,
    );
    res.json(result);
  } catch (error) {
    next(error);
  }
}

async function paypalCancel(_req, res, next) {
  try {
    const result = paymentService.paypalCancel();
    res.status(422).json(result);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  process,
  stripeCheckout,
  stripeSuccess,
  stripeCancel,
  paypalPay,
  paypalSuccess,
  paypalCancel,
};

const profileService = require("../services/profileService");

async function index(req, res, next) {
  try {
    const result = await profileService.getProfile(req.user);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

async function update(req, res, next) {
  try {
    const result = await profileService.updateProfile(req.user, req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  index,
  update,
};

const libraryService = require("../services/libraryService");

async function index(req, res, next) {
  try {
    const result = await libraryService.getLibrary(req.user);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  index,
};

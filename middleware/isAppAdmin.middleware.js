module.exports = (req, res, next) => {
  if (req.payload.role !== "app-admin") {
    return res.status(400).json({
      errorMessage: `Unauthorized Access. Contact admin`,
    });
  }
  next();
};

const router = require("express").Router();
const Event = require("../models/Event.model");

router.get("/events", (req, res, next) => {
  Event.find({ date: { $gte: new Date() } })
    .sort({ date: 1 })
    .then((data) => {
      res.json(data);
    })
    .catch((err) => next(err));
});

module.exports = router;

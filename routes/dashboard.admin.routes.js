const router = require("express").Router();
const User = require("../models/User.model");
const Event = require("../models/Event.model");
const Order = require("../models/Order.model");

router.get("/orders", (req, res, next) => {
  Order.find()
    .then((orders) => {
      res.setHeader("X-Total-Count", orders.length);
      res.json(orders);
    })
    .catch((err) => next(err));
});

module.exports = router;

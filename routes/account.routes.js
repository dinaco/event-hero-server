const router = require("express").Router();
const User = require("../models/User.model");
const Event = require("../models/Event.model");
const Product = require("../models/Product.model");
const Order = require("../models/Order.model");

router.get("/my-events", (req, res, next) => {
  const { _id } = req.payload;
  User.findById(_id)
    .populate({
      path: "events",
      //   options: { date: { $gte: new Date() }, sort: { date: 1 } },
    })
    .then((data) => {
      res.json(data);
    })
    .catch((err) => next(err));
  /*   User.findByIdAndUpdate("6293229af57db3a3a43646d4", {
    $push: { events: "6293229e787fd6a0146f3b02" },
  }); */
});

router.put("/add-balance", (req, res, next) => {
  const { _id } = req.payload;
  const { amount } = req.body;
  User.findByIdAndUpdate(_id, { $inc: { balance: amount } })
    .then((data) => {
      res.json(data);
    })
    .catch((err) => next(err));
  /*   User.findByIdAndUpdate("6293229af57db3a3a43646d4", {
    $push: { events: "6293229e787fd6a0146f3b02" },
  }); */
});

router.get("/order/:eventId", (req, res, next) => {
  const { eventId } = req.params;
  Event.findById(eventId)
    .then((event) => {
      res.json(event);
    })
    .catch((err) => next(err));
});

router.get("/order/status/:orderId", (req, res, next) => {
  const { orderId } = req.params;
  Order.findById(orderId)
    .populate("event")
    .then((order) => {
      res.json(order);
    })
    .catch((err) => next(err));
});

router.post("/order/status/:orderId", (req, res, next) => {
  const { orderId } = req.params;
  const { _id } = req.payload;
  const { amount } = req.body;
  User.findByIdAndUpdate(_id, { $inc: { balance: amount * -1 } }, { new: true })
    .then((user) => {
      Order.findByIdAndUpdate(
        orderId,
        { $set: { status: "completed" } },
        { upsert: true, new: true }
      ).then((order) => {
        res.json(user);
      });
    })
    .catch((err) => next(err));
});

router.post("/order/:eventId", (req, res, next) => {
  const { eventId } = req.params;
  let orderInfo = null;
  const { _id } = req.payload;

  const newArr = [];
  const ids = [];
  const letters = "0123456789ABCDEF";
  let bgColor = "#";
  for (let i = 0; i < 6; i++) {
    bgColor += letters[Math.floor(Math.random() * 16)];
  }
  let total = 0;
  req.body.map((product) => {
    const { [Object.keys(product)[0]]: quantity } = product;
    if (quantity > 0) {
      ids.push(Object.keys(product)[0]);
      total += quantity * product.price;
      newArr.push({
        _id: Object.keys(product)[0],
        price: product.price,
        name: product.name,
        quantity,
      });
    }
  });

  if (total <= 0) {
    return res.status(400).json({
      errorMessage: "There is an error with your order. Order total under 0",
    });
  }
  User.findById(_id)
    .then((user) => {
      if (user.balance < total) {
        return res.status(400).json({
          errorMessage:
            "Insuficient balance. Please add balance to your account",
        });
      }
    })
    .then((e) => {
      return Order.create({
        total,
        bgColor,
        products: newArr,
        event: eventId,
        user: _id,
      });
    })
    .then((order) => {
      orderInfo = order;
      return User.findByIdAndUpdate(_id, { $push: { orders: orderInfo._id } });
    })
    .then(() => {
      return Event.findByIdAndUpdate(eventId, {
        $push: { orders: orderInfo._id },
      });
    })
    .then(() => {
      res.json(orderInfo);
    })
    .catch((err) => next(err));
});

/* router.get("/events/:id", (req, res, next) => {
  const { id } = req.params;
  Event.findById(id)
    .then((event) => res.json(event))
    .catch((err) => next(err));
});
router.delete("/events/:id", (req, res, next) => {
  const { id } = req.params;
  Event.findByIdAndRemove(id)
    .then((event) => res.json(event))
    .catch((err) => next(err));
}); */

module.exports = router;

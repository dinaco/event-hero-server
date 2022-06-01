const router = require("express").Router();
const User = require("../models/User.model");
const Event = require("../models/Event.model");
const Product = require("../models/Product.model");
const Order = require("../models/Order.model");

router.get("/my-account", (req, res, next) => {
  console.log(req.headers);
  User.findById("6293229af57db3a3a43646d4")
    .populate({
      path: "events",
      options: { date: { $gte: new Date() }, sort: { date: 1 } },
    })
    .then((data) => {
      res.json(data);
    })
    .catch((err) => next(err));
  /*   User.findByIdAndUpdate("6293229af57db3a3a43646d4", {
    $push: { events: "6293229e787fd6a0146f3b02" },
  }); */
});

router.get("/order/:eventId", (req, res, next) => {
  // TODO: add function to check Users balance before placing an order
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
  User.findByIdAndUpdate(
    "6293229af57db3a3a43646d4",
    { balance: 450 },
    { new: true }
  )
    .then((user) => {
      console.log(user);
      Order.findByIdAndUpdate(
        orderId,
        { $set: { status: 20 } },
        { upsert: true, new: true }
      ).then((order) => {
        console.log(order);
        res.json(user);
      });
    })
    .catch((err) => next(err));
});

router.post("/order/:eventId", (req, res, next) => {
  const { eventId } = req.params;
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
  Order.create({ total, bgColor, products: newArr, event: eventId })
    .then((order) => {
      res.json(order);
    })
    .catch((err) => next(err));
});

router.get("/products", (req, res, next) => {
  Product.find()
    .then((products) => {
      res.json(products);
    })
    .catch((err) => next(err));
  /*   User.findByIdAndUpdate("6293229af57db3a3a43646d4", {
        $push: { events: "6293229e787fd6a0146f3b02" },
      }); */
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

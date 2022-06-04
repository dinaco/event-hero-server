const router = require("express").Router();
const Event = require("../models/Event.model");
const User = require("../models/User.model");

const { isAuthenticated } = require("../middleware/jwt.middleware");

router.get("/events", (req, res, next) => {
  let newDate = new Date();
  newDate.setDate(newDate.getDate() - 1);

  Event.find({ date: { $gte: newDate } })
    .sort({ date: 1 })
    .then((data) => {
      res.json(data);
    })
    .catch((err) => next(err));
});

router.get("/products/:eventId", isAuthenticated, (req, res, next) => {
  const { eventId } = req.params;
  const { _id } = req.payload;
  User.findById(_id)
    .populate({
      path: "events",
      match: { _id: eventId },
      populate: {
        path: "products",
        match: { active: true },
      },
    })
    .then((products) => {
      res.json(products);
    })
    .catch((err) => next(err));
});

router.get("/event/:eventId", (req, res, next) => {
  const { eventId } = req.params;
  Event.findById(eventId)
    .populate("customers")
    .then((event) => {
      if (!event.active) {
        return res
          .status(400)
          .json({ errorMessage: "Event blocked! Contact Admin" });
      }
      res.json(event);
    })
    .catch((err) => next(err));
});

router.put("/event/:eventId", isAuthenticated, (req, res, next) => {
  const { attending } = req.body;
  const { _id, role } = req.payload;
  const { eventId } = req.params;
  if (attending && role === "customer") {
    Event.findByIdAndUpdate(eventId, {
      $pull: {
        customers: _id,
      },
    })
      .then(() =>
        User.findByIdAndUpdate(_id, {
          $pull: {
            events: eventId,
          },
        })
      )
      .then((event) => res.json(event))
      .catch((err) => next(err));
  } else if (role === "customer") {
    Event.findByIdAndUpdate(eventId, {
      $push: {
        customers: _id,
      },
    })
      .then(() =>
        User.findByIdAndUpdate(_id, {
          $push: {
            events: eventId,
          },
        })
      )
      .then((event) => res.json(event))
      .catch((err) => next(err));
  } else {
    return res.status(400).json({
      errorMessage:
        "This account is not authorized to perform this action. Contact event admin",
    });
  }
});

module.exports = router;

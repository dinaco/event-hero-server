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
  console.log(req.payload);
  User.findById(_id)
    .populate({
      path: "events",
      match: { _id: eventId },
      populate: {
        path: "products",
      },
    })
    .then((products) => {
      console.log(products);
      res.json(products);
    })
    .catch((err) => next(err));
  /*   User.findByIdAndUpdate("6293229af57db3a3a43646d4", {
          $push: { events: "6293229e787fd6a0146f3b02" },
        }); */
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
  const { attending, userId } = req.body;
  const { eventId } = req.params;
  console.log(req.body, eventId);
  if (attending) {
    Event.findByIdAndUpdate(eventId, {
      $pull: {
        customers: userId,
      },
    })
      .then(() =>
        User.findByIdAndUpdate(userId, {
          $pull: {
            events: eventId,
          },
        })
      )
      .then((event) => res.json(event))
      .catch((err) => next(err));
  } else {
    Event.findByIdAndUpdate(eventId, {
      $push: {
        customers: userId,
      },
    })
      .then(() =>
        User.findByIdAndUpdate(userId, {
          $push: {
            events: eventId,
          },
        })
      )
      .then((event) => res.json(event))
      .catch((err) => next(err));
  }

  /*   router.get("/today-events", (req, res, next) => {
    let newDate = new Date();
    newDate.setDate(newDate.getDate() - 1);
    const { _id } = req.payload;
    User.findById(_id)
      .populate({
        path: "events",
        options: { date: newDate, sort: { date: 1 } },
      })
      .then((data) => {
        res.json(data);
      })
      .catch((err) => next(err));
  }); */

  //Event.remove({ _id: { $in: doc.eventsAttended } });
  /*  Event.findById(eventId)
    .populate("customers")
    .then((event) => res.json(event))
    .catch((err) => next(err)); */
});

module.exports = router;

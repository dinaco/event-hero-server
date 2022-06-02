const router = require("express").Router();
const Event = require("../models/Event.model");
const User = require("../models/User.model");

router.get("/events", (req, res, next) => {
  console.log("Hey");
  Event.find({ date: { $gte: new Date() } })
    .sort({ date: 1 })
    .then((data) => {
      res.json(data);
    })
    .catch((err) => next(err));
});

router.get("/event/:eventId", (req, res, next) => {
  const { eventId } = req.params;
  Event.findById(eventId)
    .populate("customers")
    .then((event) => res.json(event))
    .catch((err) => next(err));
});

router.put("/event/:eventId", (req, res, next) => {
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
  //Event.remove({ _id: { $in: doc.eventsAttended } });
  /*  Event.findById(eventId)
    .populate("customers")
    .then((event) => res.json(event))
    .catch((err) => next(err)); */
});

module.exports = router;

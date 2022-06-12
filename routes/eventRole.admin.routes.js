const router = require("express").Router();
const User = require("../models/User.model");
const Event = require("../models/Event.model");

router.get("/", (req, res, next) => {
  const { _id } = req.payload;
  const { _end, _order, _sort, _start, q = "" } = req.query;
  let roleBasedSearch = {
    admins: { $in: [_id] },
    name: { $regex: new RegExp(q, "i") },
  };
  Event.find(roleBasedSearch)
    .populate("customers")
    .populate("products")
    .sort([[_sort, _order === "DESC" ? -1 : 1]])
    .then((events) => {
      const slicedEvents = events.slice(_start, _end);
      res.setHeader("X-Total-Count", events.length);
      res.json(slicedEvents);
    })
    .catch((err) => next(err));
});

router.get("/:eventId", async (req, res, next) => {
  try {
    const { _id } = req.payload;
    const { eventId } = req.params;
    const getEvent = await Event.findById(eventId).populate("admins");
    if (getEvent.admins.some((admin) => admin._id == _id)) {
      res.json(getEvent);
    } else {
      return res.status(400).json({
        errorMessage: "You do not have permission to view this event.",
      });
    }
  } catch (error) {
    next(error);
  }
});

router.put("/:eventId", async (req, res, next) => {
  try {
    const { _id } = req.payload;
    const { eventId } = req.params;
    const getEvent = await Event.findById(eventId).populate("admins");
    if (getEvent.admins.some((admin) => admin._id == _id)) {
      const updatedEvent = await Event.findByIdAndUpdate(
        { _id: eventId },
        req.body
      );
      res.json(updatedEvent);
    } else {
      return res.status(400).json({
        errorMessage:
          "You do not have permission to perform this action for this event.",
      });
    }
  } catch (error) {
    next(error);
  }
});
module.exports = router;

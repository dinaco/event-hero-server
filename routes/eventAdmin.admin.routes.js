const router = require("express").Router();
const User = require("../models/User.model");
const Event = require("../models/Event.model");

const bcrypt = require("bcrypt");
const saltRounds = 10;

router.get("/events-role", (req, res, next) => {
  const { role, _id } = req.payload;
  let roleBasedSearch = {};
  if (role !== "app-admin") {
    roleBasedSearch = { admins: { $in: [_id] } };
  }
  Event.find(roleBasedSearch)
    .populate("customers")
    .populate("products")
    .then((events) => {
      res.setHeader("X-Total-Count", events.length);
      res.json(events);
    })
    .catch((err) => next(err));
});

router.get("/events-role/:eventId", (req, res, next) => {
  const { eventId } = req.params;
  Event.findById({ _id: eventId })
    .then((events) => {
      res.setHeader("X-Total-Count", 1);
      res.json(events);
    })
    .catch((err) => next(err));
});

router.put("/events-role/:eventId", (req, res, next) => {
  const { eventId } = req.params;
  Event.findByIdAndUpdate({ _id: eventId }, req.body)
    .then((events) => {
      res.json(events);
    })
    .catch((err) => next(err));
});

router.get("/staff", async (req, res, next) => {
  try {
    const { _end, _order, _sort, _start, q = "" } = req.query;
    const { role, _id } = req.payload;
    const staff = await User.find({
      name: { $regex: new RegExp("^" + q, "i") },
      $or: [{ role: "event-staff" }, { role: "event-admin" }],
    }).populate("events");
    if (role !== "app-admin") {
      const filterByEventAdmin = await Event.find({ admins: { $in: [_id] } });
      const filteredStaffEventbyAdmin = staff.filter((staff) => {
        return filterByEventAdmin.some((event) => {
          return (
            event.staff.includes(staff._id) || event.admins.includes(staff._id)
          );
        });
      });
      res.setHeader("X-Total-Count", filteredStaffEventbyAdmin.length);
      res.json(filteredStaffEventbyAdmin);
    } else {
      res.setHeader("X-Total-Count", staff.length);
      res.json(staff);
    }
  } catch (error) {
    next(error);
  }
});

router.get("/staff/:userId", async (req, res, next) => {
  console.log("heeeeeey");
  try {
    const { userId } = req.params;
    const { role, _id } = req.payload;
    const staff = await User.find(userId, {
      $or: [{ role: "event-staff" }, { role: "event-admin" }],
    }).populate("events");
    if (role !== "app-admin") {
      const filterByEventAdmin = await Event.find({ admins: { $in: [_id] } });
      const filteredStaffEventbyAdmin = staff.filter((staff) => {
        return filterByEventAdmin.some((event) => {
          return (
            event.staff.includes(staff._id) || event.admins.includes(staff._id)
          );
        });
      });
      console.log(filteredStaffEventbyAdmin);
      res.json(filteredStaffEventbyAdmin);
    } else {
      console.log(staff);
      res.json(staff);
    }
  } catch (error) {
    next(error);
  }
});

router.post("/staff", async (req, res, next) => {
  try {
    const { role } = req.payload;
    if (role !== "app-admin" && req.body.role !== "app-admin") {
      req.body.events = req.body.eventsrole;
      let pushNewUserId;
      const salt = await bcrypt.genSalt(saltRounds);
      const hashedPassword = await bcrypt.hash(req.body.hashedPassword, salt);
      req.body.hashedPassword = hashedPassword;
      const staff = await User.create(req.body);
      req.body.role === "event-staff"
        ? (pushNewUserId = { staff: staff._id })
        : (pushNewUserId = { admins: staff._id });
      const event = await Event.updateMany(
        {
          _id: { $in: req.body.events },
        },
        { $push: pushNewUserId },
        { multi: true }
      );
      res.json(staff);
    } else {
      return res.status(400).json({
        errorMessage: "You do not have permission to create this type of user.",
      });
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;

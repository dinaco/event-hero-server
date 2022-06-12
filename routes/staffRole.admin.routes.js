const router = require("express").Router();
const User = require("../models/User.model");
const Event = require("../models/Event.model");

const bcrypt = require("bcrypt");
const saltRounds = 10;

router.get("/", async (req, res, next) => {
  try {
    const { _end, _order, _sort, _start, q = "" } = req.query;
    const { _id } = req.payload;
    const staff = await User.find({
      /*       $and: [
          { name: { $regex: new RegExp("^" + q, "i") } },
          { role: "event-staff" },
        ], */
      name: { $regex: new RegExp(q, "i") },
      $or: [{ role: "event-staff" }, { role: "event-admin" }],
    })
      .populate("events")
      .sort([[_sort, _order === "DESC" ? -1 : 1]]);
    const filterByEventAdmin = await Event.find({ admins: { $in: [_id] } });
    const filteredStaffEventbyAdmin = staff.filter((staff) => {
      return filterByEventAdmin.some((event) => {
        return (
          event.staff.includes(staff._id) || event.admins.includes(staff._id)
        );
      });
    });
    const slicedFilteredStaffEventbyAdmin = filteredStaffEventbyAdmin.slice(
      _start,
      _end
    );
    res.setHeader("X-Total-Count", filteredStaffEventbyAdmin.length);
    res.json(slicedFilteredStaffEventbyAdmin);
  } catch (err) {
    next(err);
  }
});

router.get("/:userId", async (req, res, next) => {
  try {
    const { userId } = req.params;
    const staff = await User.findById(userId).populate("events");
    res.json(staff);
  } catch (err) {
    next(err);
  }
});

router.put("/:userId", async (req, res, next) => {
  try {
    const { userId } = req.params;

    const clearUserInfo = await User.findByIdAndUpdate(userId, {
      $set: { events: [] },
    });
    const chosenEvents = req.body.eventsrole.filter(
      (event) => typeof event === "string"
    );
    req.body.events = chosenEvents;
    let roleEvent;
    req.body.role === "event-staff"
      ? (roleEvent = { staff: clearUserInfo._id })
      : (roleEvent = { admins: clearUserInfo._id });
    const staff = await User.findByIdAndUpdate(userId, req.body, {
      $push: { events: chosenEvents },
    });
    const clearEvents = await Event.updateMany(
      {
        _id: { $in: clearUserInfo.events },
      },
      { $pull: { admins: clearUserInfo._id, staff: clearUserInfo._id } },
      { multi: true }
    );
    const event = await Event.updateMany(
      {
        _id: { $in: req.body.events },
      },
      { $push: roleEvent },
      { multi: true }
    );
    res.json(staff);
  } catch (err) {
    next(err);
  }
});

router.delete("/:userId", async (req, res, next) => {
  try {
    const { userId } = req.params;
    const deletedUser = await User.findByIdAndRemove(userId);
    const clearEvents = await Event.updateMany(
      {
        _id: { $in: deletedUser.events },
      },
      { $pull: { admins: deletedUser._id, staff: deletedUser._id } },
      { multi: true }
    );
    res.json(deletedUser);
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req, res, next) => {
  try {
    if (req.body.role !== "app-admin") {
      const chosenEvents = req.body.eventsrole.filter(
        (event) => typeof event === "string"
      );
      req.body.events = chosenEvents;
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
        errMessage: "You do not have permission to create this type of user.",
      });
    }
  } catch (err) {
    next(err);
  }
});

module.exports = router;

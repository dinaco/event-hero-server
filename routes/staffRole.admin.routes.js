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
    const { _id } = req.payload;
    const checkUser = await User.findById(userId).populate("events");

    //If one event-admin cant change the infos of the other, change condition bellow to remove event-admin
    // if you change that you need to find a way to let the event-admin change it's own information at least

    if (checkUser.role !== "event-admin" && checkUser.role !== "event-staff") {
      return res.status(400).json({
        errMessage: "You do not have permission for this action.",
      });
    } else {
      const admin = await User.findById(_id).populate("events");
      const filterEventsUser = checkUser.events.map((event) =>
        event._id.toString()
      );
      const filterEventsAdmin = admin.events.map((event) =>
        event._id.toString()
      );

      if (filterEventsAdmin.some((event) => filterEventsUser.includes(event))) {
        res.json(checkUser);
      } else {
        return res.status(400).json({
          errMessage: "You do not have permission for this action.",
        });
      }
    }
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req, res, next) => {
  //TODO: Probably not saving information at all places it needs because map reading is undefined for event-roles
  // only for newly created users

  try {
    const { _id } = req.payload;
    if (req.body.role !== "app-admin") {
      const checkAdminEvent = await User.findById(_id, {
        role: "event-admin",
      }).populate("events");
      const checkAdminEventIds = checkAdminEvent.events.map((event) =>
        event._id.toString()
      );
      const chosenEvents = req.body.eventsrole.filter(
        (event) => typeof event === "string"
      );
      if (chosenEvents.every((event) => checkAdminEventIds.includes(event))) {
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
          errMessage:
            "You do not have permission to create a user for these events.",
        });
      }
    } else {
      return res.status(400).json({
        errMessage: "You do not have permission to create this type of user.",
      });
    }
  } catch (err) {
    next(err);
  }
});

router.put("/:userId", async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { _id } = req.payload;
    const checkUser = await User.findById(userId).populate("events");

    //If one event-admin cant change the infos of the other, change condition bellow to remove event-admin
    // if you change that you need to find a way to let the event-admin change it's own information at least

    if (checkUser.role !== "event-admin" && checkUser.role !== "event-staff") {
      return res.status(400).json({
        errMessage: "You do not have permission for this action.",
      });
    } else {
      const admin = await User.findById(_id).populate("events");
      const filterEventsUser = checkUser.events.map((event) =>
        event._id.toString()
      );
      const filterEventsAdmin = admin.events.map((event) =>
        event._id.toString()
      );

      if (filterEventsAdmin.some((event) => filterEventsUser.includes(event))) {
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
      } else {
        return res.status(400).json({
          errMessage: "You do not have permission for this action.",
        });
      }
    }
  } catch (err) {
    next(err);
  }
});

router.delete("/:userId", async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { _id } = req.payload;
    const checkUser = await User.findById(userId).populate("events");

    //If one event-admin cant change the infos of the other, change condition bellow to remove event-admin
    // if you change that you need to find a way to let the event-admin change it's own information at least

    if (checkUser.role !== "event-admin" && checkUser.role !== "event-staff") {
      return res.status(400).json({
        errMessage: "You do not have permission for this action.",
      });
    } else {
      const admin = await User.findById(_id).populate("events");
      const filterEventsUser = checkUser.events.map((event) =>
        event._id.toString()
      );
      const filterEventsAdmin = admin.events.map((event) =>
        event._id.toString()
      );

      if (filterEventsAdmin.some((event) => filterEventsUser.includes(event))) {
        const deletedUser = await User.findByIdAndRemove(userId);
        const clearEvents = await Event.updateMany(
          {
            _id: { $in: deletedUser.events },
          },
          { $pull: { admins: deletedUser._id, staff: deletedUser._id } },
          { multi: true }
        );
        res.json(deletedUser);
      } else {
        return res.status(400).json({
          errMessage: "You do not have permission for this action.",
        });
      }
    }
  } catch (err) {
    next(err);
  }
});

module.exports = router;

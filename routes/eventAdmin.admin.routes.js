const router = require("express").Router();
const User = require("../models/User.model");
const Event = require("../models/Event.model");

router.get("/events-role", (req, res, next) => {
  const { role, _id } = req.payload;
  console.log(role);
  let roleBasedSearch = {};
  if (role !== "app-admin") {
    roleBasedSearch = { admins: { $in: [_id] } };
  }
  console.log(roleBasedSearch);
  Event.find(roleBasedSearch)
    .populate("customers")
    .populate("products")
    .then((events) => {
      res.setHeader("X-Total-Count", events.length);
      res.json(events);
    })
    .catch((err) => next(err));
});

router.get("/staff", (req, res, next) => {
  const { role, _id } = req.payload;
  console.log(role);
  let roleBasedSearch = {};
  if (role !== "app-admin") {
    roleBasedSearch = { admins: { $in: [_id] } };
  }
  console.log(roleBasedSearch);
  Event.find(roleBasedSearch)
    .populate("staff")
    .then((staff) => {
      res.setHeader("X-Total-Count", staff.length);
      res.json(staff);
      console.log(staff);
    })
    .catch((err) => next(err));
});

module.exports = router;

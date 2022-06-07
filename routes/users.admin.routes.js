const router = require("express").Router();
const User = require("../models/User.model");
const Event = require("../models/Event.model");

const bcrypt = require("bcrypt");
const saltRounds = 10;

router.get("/users", (req, res, next) => {
  // let collectionLength = 0;
  const { _end, _order, _sort, _start, q = "" } = req.query;
  User.find({ name: { $regex: new RegExp("^" + q, "i") } })
    .populate("events")
    /*  .count({}, function (err, count) {
      collectionLength = count;
    })
    .skip(_start)
    .limit(_end) */
    .sort([[_sort, _order === "DESC" ? -1 : 1]])
    .then((users) => {
      // res.header("Access-Control-Allow-Origin", process.env.ORIGIN); // update to match the domain you will make the request from
      /*  res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
      ); */
      res.setHeader("X-Total-Count", users.length);
      //  res.header("Content-Range", `users 0-10/${users.length}`);
      const slicedUsers = users.slice(_start, _end);
      res.json(slicedUsers);
    })
    .catch((err) => next(err));
});

router.get("/users/:id", (req, res, next) => {
  const { id } = req.params;
  User.findById(id)
    .then((user) => res.json(user))
    .catch((err) => next(err));
});
router.put("/users/:id", (req, res, next) => {
  const { id } = req.params;
  User.findByIdAndUpdate(id, req.body)
    .then((user) => res.json(user))
    .catch((err) => next(err));
});
router.post("/users", async (req, res, next) => {
  try {
    const chosenEvents = req.body.eventsrole.filter(
      (event) => typeof event === "string"
    );
    req.body.events = chosenEvents;
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(req.body.hashedPassword, salt);
    req.body.hashedPassword = hashedPassword;
    const user = await User.create(req.body);
    let roleEvent;
    req.body.role === "event-staff"
      ? (roleEvent = { staff: user._id })
      : (roleEvent = { admins: user._id });
    const event = await Event.updateMany(
      {
        _id: { $in: req.body.events },
      },
      { $push: roleEvent },
      { multi: true }
    );
    res.json(user);
  } catch (error) {
    next(error);
  }
});
router.delete("/users/:id", (req, res, next) => {
  //TODO: Clear all models events, orders...
  const { id } = req.params;
  User.findByIdAndRemove(id)
    .then((user) => res.json(user))
    .catch((err) => next(err));
});

module.exports = router;

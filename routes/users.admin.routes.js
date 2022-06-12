const router = require("express").Router();
const User = require("../models/User.model");
const Event = require("../models/Event.model");

const bcrypt = require("bcrypt");
const saltRounds = 10;

router.get("/users", (req, res, next) => {
  // let collectionLength = 0;
  const { _end, _order, _sort, _start, q = "" } = req.query;
  User.find({ name: { $regex: new RegExp(q, "i") } })
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
router.put("/users/:id", async (req, res, next) => {
  //console.log(req.body);
  try {
    const { id } = req.params;
    const userInfo = await User.findById(id);
    const { name, email, password, active, balance, role } = req.body;
    if (email !== userInfo.email) {
      const checkEmail = await User.findOne({ email });
      if (checkEmail) {
        return res.status(400).json({ errorMessage: "Email already taken." });
      }
    }

    if (!password) {
      const updateUser = await User.findByIdAndUpdate(id, {
        name,
        email,
        active,
        balance,
        role,
      });
      res.json(updateUser);
    } else {
      if (password.length < 8) {
        return res.status(400).json({
          errorMessage: "Your password needs to be at least 8 characters long.",
        });
      }
      const salt = await bcrypt.genSalt(saltRounds);
      const hashedPassword = await bcrypt.hash(req.body.password, salt);
      // req.body.hashedPassword = hashedPassword;
      const updateUser = await User.findByIdAndUpdate(id, {
        name,
        email,
        hashedPassword,
        active,
        balance,
        role,
      });
      res.json(updateUser);
    }
  } catch (error) {
    next(error);
  }
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

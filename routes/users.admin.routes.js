const router = require("express").Router();
const User = require("../models/User.model");
const Event = require("../models/Event.model");

// Require necessary (isLoggedOut and isLiggedIn) middleware in order to control access to specific routes
const isLoggedOut = require("../middleware/isLoggedOut");
const isLoggedIn = require("../middleware/isLoggedIn");

router.get("/users", (req, res, next) => {
  // let collectionLength = 0;
  const { _end, _order, _sort, _start, q = "" } = req.query;
  console.log(req.query);
  User.find({ email: { $regex: "^" + q } })
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
router.delete("/users/:id", (req, res, next) => {
  const { id } = req.params;
  User.findByIdAndRemove(id)
    .then((user) => res.json(user))
    .catch((err) => next(err));
});

module.exports = router;
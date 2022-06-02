const router = require("express").Router();
const User = require("../models/User.model");
const Event = require("../models/Event.model");

router.get("/events", (req, res, next) => {
  // let collectionLength = 0;
  const { _end, _order, _sort, _start, q = "" } = req.query;
  //console.log(req.query);
  Event.find({ name: { $regex: `^${q}` } })
    .populate("customers")
    .populate("products")
    /*  .count({}, function (err, count) {
      collectionLength = count;
    })
    .skip(_start)
    .limit(_end) */
    .sort([[_sort, _order === "DESC" ? -1 : 1]])
    .then((events) => {
      // res.header("Access-Control-Allow-Origin", process.env.ORIGIN); // update to match the domain you will make the request from
      /*  res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
      ); */
      res.setHeader("X-Total-Count", events.length);
      //  console.log(events);
      //  res.header("Content-Range", `events 0-10/${events.length}`);
      const slicedEvents = events.slice(_start, _end);
      res.json(slicedEvents);
    })
    .catch((err) => next(err));
});
router.get("/events/:id", (req, res, next) => {
  const { id } = req.params;
  Event.findById(id)
    .then((event) => res.json(event))
    .catch((err) => next(err));
});

router.put("/events/:id", (req, res, next) => {
  const { id } = req.params;
  console.log("This is re.bodyyyyyyyyyyyyyyyyyyy", req.body);
  Event.findById(id)
    .then((event) => res.json(event))
    .catch((err) => next(err));
});
router.delete("/events/:id", (req, res, next) => {
  const { id } = req.params;
  Event.findByIdAndRemove(id)
    .then((event) => res.json(event))
    .catch((err) => next(err));
});

module.exports = router;

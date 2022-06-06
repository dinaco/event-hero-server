const router = require("express").Router();
const Event = require("../models/Event.model");

router.get("/events", (req, res, next) => {
  // let collectionLength = 0;
  const { _end, _order, _sort, _start, q = "" } = req.query;
  //console.log(req.query);
  Event.find({ name: { $regex: new RegExp("^" + q, "i") } })
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
router.post("/events", (req, res, next) => {
  Event.create(req.body)
    .then((event) => res.json(event))
    .catch((err) => next(err));
});
router.put("/events/:id", (req, res, next) => {
  const { id } = req.params;
  Event.findByIdAndUpdate(id, req.body)
    .then((event) => res.json(event))
    .catch((err) => next(err));
});
router.delete("/events/:id", (req, res, next) => {
  //TODO: delete its products, customers, event-staff and all references
  const { id } = req.params;
  Event.findByIdAndRemove(id)
    .then((event) => res.json(event))
    .catch((err) => next(err));
});

module.exports = router;

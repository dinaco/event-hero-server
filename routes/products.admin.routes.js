const router = require("express").Router();
const Product = require("../models/Product.model");

router.get("/products", (req, res, next) => {
  // let collectionLength = 0;
  const { _end, _order, _sort, _start, q = "" } = req.query;
  Product.find({ name: { $regex: new RegExp("^" + q, "i") } })
    .populate("event")
    /*  .count({}, function (err, count) {
      collectionLength = count;
    })
    .skip(_start)
    .limit(_end) */
    .sort([[_sort, _order === "DESC" ? -1 : 1]])
    .then((products) => {
      // res.header("Access-Control-Allow-Origin", process.env.ORIGIN); // update to match the domain you will make the request from
      /*  res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
      ); */
      res.setHeader("X-Total-Count", products.length);
      //  res.header("Content-Range", `events 0-10/${events.length}`);
      const slicedProducts = products.slice(_start, _end);
      res.json(slicedProducts);
    })
    .catch((err) => next(err));
});
router.get("/products/:id", (req, res, next) => {
  const { id } = req.params;
  Product.findById(id)
    .populate("event")
    .then((event) => res.json(event))
    .catch((err) => next(err));
});

router.post("/products", (req, res, next) => {
  Product.create(req.body)
    .then((event) => res.json(event))
    .catch((err) => next(err));
});

router.put("/products/:id", (req, res, next) => {
  delete req.body.event;
  req.body.event = req.body.eventsrole;
  console.log(req.body);
  const { id } = req.params;
  Product.findByIdAndUpdate(id, req.body)
    .then((event) => res.json(event))
    .catch((err) => next(err));
});

router.delete("/products/:id", (req, res, next) => {
  //TODO: remove all references from other models
  const { id } = req.params;
  Product.findByIdAndRemove(id)
    .then((event) => res.json(event))
    .catch((err) => next(err));
});

module.exports = router;

const router = require("express").Router();
const Product = require("../models/Product.model");
const Event = require("../models/Event.model");

//TODO: Protect routes check active staff / customer /admin

router.get("/", async (req, res, next) => {
  try {
    const { _end, _order, _sort, _start, q = "" } = req.query;
    const search = {
      name: { $regex: new RegExp(q, "i") },
    };
    const products = await Product.find(search)
      .populate("event")
      .sort([[_sort, _order === "DESC" ? -1 : 1]]);
    res.setHeader("X-Total-Count", products.length);
    const slicedProducts = products.slice(_start, _end);
    res.json(slicedProducts);
  } catch (error) {
    next(error);
  }
});

/* router.get("/products-role", (req, res, next) => {
  const { role, _id } = req.payload;
  let roleBasedSearch = {};
  if (role !== "app-admin") {
    roleBasedSearch = { admins: { $in: [_id] } };
  }
  Event.find(roleBasedSearch)
    .populate("products")
    .then((events) => {
      const products = events.map((event) => event.products);
      res.setHeader("X-Total-Count", products.length);
      res.json(products);
    })
    .catch((err) => next(err));
}); */

router.get("/:id", (req, res, next) => {
  const { id } = req.params;
  Product.findById(id)
    .populate("event")
    .then((event) => res.json(event))
    .catch((err) => next(err));
});

router.post("/", async (req, res, next) => {
  try {
    req.body.event = req.body.eventsrole;
    const newProduct = await Product.create(req.body);
    const pushToEvent = await Event.findByIdAndUpdate(
      req.body.event,
      {
        $push: { products: newProduct._id },
      },
      { new: true }
    );
    res.json(newProduct);
  } catch (error) {
    next(error);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    /*     delete req.body.event;
    req.body.event = req.body.eventsrole; */
    const { id } = req.params;
    const product = await Product.findByIdAndUpdate(id, req.body);
    /*     const clearEvent = await Event.findByIdAndUpdate(product.event._id, {
      $pull: { products: id },
    });
    const pushToEvent = await Event.findByIdAndUpdate(
      req.body.event,
      {
        $push: { products: id },
      },
      { new: true }
    ); */
    res.json(product);
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  //TODO: remove all references from other models
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndRemove(id);
    const clearEvent = await Event.findByIdAndUpdate(product.event._id, {
      $pull: { products: id },
    });
    res.json(product);
  } catch (error) {
    next(error);
  }
});

module.exports = router;

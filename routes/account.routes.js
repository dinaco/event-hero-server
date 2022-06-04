const router = require("express").Router();
const User = require("../models/User.model");
const Event = require("../models/Event.model");
const Order = require("../models/Order.model");

router.get("/my-events", (req, res, next) => {
  const { _id } = req.payload;
  User.findById(_id)
    .populate({
      path: "events",
      //   options: { date: { $gte: new Date() }, sort: { date: 1 } },
    })
    .then((data) => {
      res.json(data);
    })
    .catch((err) => next(err));
});

router.put("/add-balance", (req, res, next) => {
  const { _id } = req.payload;
  const { amount } = req.body;
  User.findByIdAndUpdate(_id, { $inc: { balance: amount } })
    .then((data) => {
      res.json(data);
    })
    .catch((err) => next(err));
});

router.get("/order/:eventId", (req, res, next) => {
  const { eventId } = req.params;
  Event.findById(eventId)
    .then((event) => {
      res.json(event);
    })
    .catch((err) => next(err));
});

router.get("/orders/:eventId", (req, res, next) => {
  const { eventId } = req.params;
  const { _id } = req.payload;
  User.findById(_id)
    .populate({
      path: "events",
      match: { _id: eventId },
    })
    .populate({
      path: "orders",
      match: { event: eventId },
    })
    .then((event) => {
      res.json(event);
    })
    .catch((err) => next(err));
});

router.get("/order/status/:orderId", (req, res, next) => {
  const { orderId } = req.params;
  const { _id } = req.payload;
  Order.findById(orderId)
    .populate("event")
    .populate("staff")
    .populate("customer")
    .then((order) => {
      res.json(order);
    })
    .catch((err) => next(err));
});

router.put("/order/process/:orderId", (req, res, next) => {
  const { orderId } = req.params;
  const { _id, role } = req.payload;
  if (role === "event-staff") {
    return Order.findByIdAndUpdate(
      orderId,
      { $set: { status: "processing", staff: _id } },
      { upsert: true, new: true }
    )
      .then(() => {
        return User.findByIdAndUpdate(
          _id,
          { $push: { orders: orderId } },
          { new: true }
        ).then((staff) => {
          res.json(staff);
        });
      })
      .then((customer) => {
        res.json(customer);
      })
      .catch((err) => next(err));
  } else {
    return res.status(400).json({
      errorMessage:
        "This action can only be performed by staff members, please contact event admins",
    });
  }
});

router.put("/order/charge/:orderId", (req, res, next) => {
  const { orderId } = req.params;
  const { role } = req.payload;
  if (role === "event-staff") {
    return Order.findByIdAndUpdate(
      orderId,
      { $set: { status: "completed" } },
      { upsert: true, new: true }
    )
      .then((order) => {
        return User.findByIdAndUpdate(
          order.customer,
          { $inc: { balance: order.total * -1 } },
          { new: true }
        );
      })
      .then((customer) => {
        res.json(customer);
      })
      .catch((err) => next(err));
  } else {
    return res.status(400).json({
      errorMessage:
        "This action can only be performed by staff members, please contact event admins",
    });
  }
});

router.delete("/order/delete/:orderId", async (req, res, next) => {
  const { orderId } = req.params;
  const { role } = req.payload;
  if (role === "customer") {
    try {
      let orderToDelete = await Order.findById(orderId);
      if (orderToDelete.status === "completed") {
        return res.status(400).json({
          errorMessage: "This order is completed and can't be deleted",
        });
      } else {
        await User.findByIdAndUpdate(
          orderToDelete.customer,
          { $pull: { orders: orderId } },
          { new: true }
        );
        if (orderToDelete.staff) {
          await User.findByIdAndUpdate(
            orderToDelete.staff,
            { $pull: { orders: orderId } },
            { new: true }
          );
        }

        await Event.findByIdAndUpdate(
          orderToDelete.event,
          { $pull: { orders: orderId } },
          { new: true }
        );

        let orderToRemove = await Order.findByIdAndRemove(orderId).then(
          (order) => {
            res.json(order);
          }
        );
      }
    } catch (error) {
      next(error);
    }
  } else {
    return res.status(400).json({
      errorMessage:
        "You don't have authorization to perform this action, please contact admins",
    });
  }
});

router.post("/order/:eventId", (req, res, next) => {
  const { eventId } = req.params;
  let orderInfo = null;
  const { _id, role } = req.payload;
  if (role === "customer") {
    const newArr = [];
    const ids = [];
    const letters = "0123456789ABCDEF";
    let bgColor = "#";
    for (let i = 0; i < 6; i++) {
      bgColor += letters[Math.floor(Math.random() * 16)];
    }
    let total = 0;
    req.body.map((product) => {
      const { [Object.keys(product)[0]]: quantity } = product;
      if (quantity > 0) {
        ids.push(Object.keys(product)[0]);
        total += quantity * product.price;
        newArr.push({
          _id: Object.keys(product)[0],
          price: product.price,
          name: product.name,
          quantity,
        });
      }
    });

    if (total <= 0) {
      return res.status(400).json({
        errorMessage: "There is an error with your order. Order total under 0",
      });
    }
    User.findById(_id)
      .then((customer) => {
        if (customer.balance < total) {
          return res.status(400).json({
            errorMessage:
              "Insuficient balance. Please add balance to your account",
          });
        }
      })
      .then((e) => {
        return Order.create({
          total,
          bgColor,
          products: newArr,
          event: eventId,
          customer: _id,
        });
      })
      .then((order) => {
        orderInfo = order;
        return User.findByIdAndUpdate(_id, {
          $push: { orders: orderInfo._id },
        });
      })
      .then(() => {
        return Event.findByIdAndUpdate(eventId, {
          $push: { orders: orderInfo._id },
        });
      })
      .then(() => {
        res.json(orderInfo);
      })
      .catch((err) => next(err));
  } else {
    return res.status(400).json({
      errorMessage:
        "You don't have authorization to perform this action, please contact admins",
    });
  }
});

/* router.get("/events/:id", (req, res, next) => {
  const { id } = req.params;
  Event.findById(id)
    .then((event) => res.json(event))
    .catch((err) => next(err));
});
router.delete("/events/:id", (req, res, next) => {
  const { id } = req.params;
  Event.findByIdAndRemove(id)
    .then((event) => res.json(event))
    .catch((err) => next(err));
}); */

module.exports = router;

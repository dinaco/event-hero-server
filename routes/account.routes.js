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
      populate: {
        path: "customers",
      },
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

router.get("/order/status/:orderId", async (req, res, next) => {
  const { orderId } = req.params;
  const { _id, role } = req.payload;
  try {
    const orderInfo = await Order.findById(orderId)
      .populate("event")
      .populate("staff")
      .populate("customer");
    if (role === "customer" && _id == orderInfo.customer._id) {
      res.json(orderInfo);
    }
    if (role === "event-staff" && _id == orderInfo.staff._id) {
      res.json(orderInfo);
    } else {
      return res.status(400).json({ errorMessage: "Order not found." });
    }
  } catch (error) {
    next(error);
  }
});

router.put("/order/process/:orderId", async (req, res, next) => {
  const { orderId } = req.params;
  const { _id, role } = req.payload;

  try {
    const eventTakingOrders = await Order.findById(orderId).populate("event");
    if (eventTakingOrders.event.takeOrders) {
      if (role === "event-staff") {
        const orrderInfo = await Order.findByIdAndUpdate(
          orderId,
          { $set: { status: "processing", staff: _id } },
          { upsert: true }
        );
        if (orrderInfo.status === "pending") {
          const staff = await User.findByIdAndUpdate(
            _id,
            { $push: { orders: orderId } },
            { new: true }
          );
          res.json(staff);
        }

        res.json(orrderInfo);
      } else {
        return res.status(400).json({
          errorMessage:
            "This action can only be performed by staff members, please contact event admins",
        });
      }
    } else {
      return res.status(400).json({
        errorMessage:
          "This event is not taking orders at the moment. Contact event admin.",
      });
    }
  } catch (error) {
    next(error);
  }
});

router.put("/order/charge/:orderId", async (req, res, next) => {
  const { orderId } = req.params;
  const { role } = req.payload;

  try {
    if (role === "event-staff") {
      const orderCheckUserBalance = await Order.findById(orderId).populate(
        "customer"
      );
      if (
        orderCheckUserBalance.customer.balance < orderCheckUserBalance.total
      ) {
        return res.status(400).json({
          errorMessage:
            "Insuficient balance. Customer needs to add more funds.",
        });
      }
      const orderInfo = await Order.findById(orderId).populate("event");
      if (orderInfo.status === "processing" && orderInfo.event.takeOrders) {
        const updateOrder = await Order.findByIdAndUpdate(
          orderId,
          { $set: { status: "completed" } },
          { upsert: true, new: true }
        );
        const updateUser = await User.findByIdAndUpdate(
          updateOrder.customer,
          { $inc: { balance: updateOrder.total * -1 } },
          { new: true }
        );

        res.json(updateUser);
      } else {
        return res.status(400).json({
          errorMessage: `Check if order status is "processing" or contact event admin for further information`,
        });
      }
    } else {
      return res.status(400).json({
        errorMessage:
          "This action can only be performed by staff members, please contact event admins",
      });
    }
  } catch (error) {
    next(error);
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

router.post("/order/:eventId", async (req, res, next) => {
  try {
    const { eventId } = req.params;

    const eventInfo = await Event.findById(eventId);
    if (!eventInfo.takeOrders) {
      return res.status(400).json({
        errorMessage: "This event is not taking orders. Contact event admin.",
      });
    }

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
          errorMessage:
            "There is an error with your order. Order total under 0",
        });
      }
      const customerInfo = await User.findById(_id);
      if (customerInfo.balance < total) {
        return res.status(400).json({
          errorMessage:
            "Insuficient balance. Please add balance to your account",
        });
      }

      const orderInfo = await Order.create({
        total,
        bgColor,
        products: newArr,
        event: eventId,
        customer: _id,
      });
      await User.findByIdAndUpdate(_id, {
        $push: { orders: orderInfo._id },
      });

      await Event.findByIdAndUpdate(eventId, {
        $push: { orders: orderInfo._id },
      });
      res.json(orderInfo);
    } else {
      return res.status(400).json({
        errorMessage:
          "You don't have authorization to perform this action, please contact admins",
      });
    }
  } catch (error) {
    next(error);
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

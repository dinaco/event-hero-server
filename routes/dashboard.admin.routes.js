const router = require("express").Router();
const User = require("../models/User.model");
const Event = require("../models/Event.model");
const Order = require("../models/Order.model");
const moment = require("moment");

router.get("/orders", (req, res, next) => {
  Order.find()
    .then((orders) => {
      const response = [];
      const currentMonthCompletedSales = orders
        .filter(
          (order) =>
            moment(order.createdAt).isSame(new Date(), "month") &&
            order.status === "completed"
        )
        .reduce((sum, amount) => sum + Number(amount.total), 0)
        .toFixed(2);
      const currentMonthCompletedQty = orders.filter(
        (order) =>
          moment(order.createdAt).isSame(new Date(), "month") &&
          order.status === "completed"
      ).length;
      const currentMonthOpenOrders = orders
        .filter(
          (order) =>
            moment(order.createdAt).isSame(new Date(), "month") &&
            order.status !== "completed"
        )
        .reduce((sum, amount) => sum + Number(amount.total), 0)
        .toFixed(2);
      const currentMonthOpenOrdersQty = orders.filter(
        (order) =>
          moment(order.createdAt).isSame(new Date(), "month") &&
          order.status !== "completed"
      ).length;
      const allCompletedSales = orders
        .filter((order) => order.status === "completed")
        .reduce((sum, amount) => sum + Number(amount.total), 0)
        .toFixed(2);
      const allCompletedQty = orders.filter(
        (order) => order.status === "completed"
      ).length;
      const allOpenOrders = orders
        .filter((order) => order.status !== "completed")
        .reduce((sum, amount) => sum + Number(amount.total), 0)
        .toFixed(2);
      const allOpenOrdersQty = orders.filter(
        (order) => order.status !== "completed"
      ).length;

      response.push({ id: 0, currentMonthCompletedSales });
      response.push({ id: 1, currentMonthCompletedQty });
      response.push({ id: 2, currentMonthOpenOrders });
      response.push({ id: 3, currentMonthOpenOrdersQty });
      response.push({ id: 4, allCompletedSales });
      response.push({ id: 5, allCompletedQty });
      response.push({ id: 6, allOpenOrders });
      response.push({ id: 7, allOpenOrdersQty });

      res.json(response);
    })
    .catch((err) => next(err));
});

module.exports = router;

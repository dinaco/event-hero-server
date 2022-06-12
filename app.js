// ℹ️ Gets access to environment variables/settings
// https://www.npmjs.com/package/dotenv
require("dotenv/config");

// ℹ️ Connects to the database
require("./db");

// Handles http requests (express is node js framework)
// https://www.npmjs.com/package/express
const express = require("express");

const app = express();

// ℹ️ This function is getting exported from the config folder. It runs most pieces of middleware
require("./config")(app);

const { isAuthenticated } = require("./middleware/jwt.middleware");
const isAdmin = require("./middleware/isAdmin.middleware");
const isAppAdmin = require("./middleware/isAppAdmin.middleware");
const isEventAdmin = require("./middleware/isEventAdmin.middleware");
// 👇 Start handling routes here
// Contrary to the views version, all routes are controlled from the routes/index.js
const allRoutes = require("./routes/index.routes");
app.use("/api", allRoutes);
const authRoutes = require("./routes/auth.routes");
app.use("/auth", authRoutes);
const eventRoutes = require("./routes/event.routes");
app.use("/api", eventRoutes);
const accountRoutes = require("./routes/account.routes");
app.use("/api", isAuthenticated, accountRoutes);
const dashboardRoutes = require("./routes/dashboard.admin.routes");
app.use("/api/admin/dashboard", isAuthenticated, isAdmin, dashboardRoutes);
const usersAdminRoutes = require("./routes/users.admin.routes");
app.use("/api/admin/users", isAuthenticated, isAppAdmin, usersAdminRoutes);
const eventsAdminRoutes = require("./routes/events.admin.routes");
app.use("/api/admin/events", isAuthenticated, isAppAdmin, eventsAdminRoutes);
const productsAdminRoutes = require("./routes/products.admin.routes");
app.use(
  "/api/admin/products",
  isAuthenticated,
  isAppAdmin,
  productsAdminRoutes
);
const staffRoleRoutes = require("./routes/staffRole.admin.routes");
app.use("/api/admin/staff", isAuthenticated, isEventAdmin, staffRoleRoutes);
const eventRoleRoutes = require("./routes/eventRole.admin.routes");
app.use(
  "/api/admin/events-role",
  isAuthenticated,
  isEventAdmin,
  eventRoleRoutes
);
const productsRoleRoutes = require("./routes/productsRole.admin.routes");
app.use(
  "/api/admin/products-role",
  isAuthenticated,
  isEventAdmin,
  productsRoleRoutes
);

// ❗ To handle errors. Routes that don't exist or errors that you handle in specific routes
require("./error-handling")(app);

module.exports = app;

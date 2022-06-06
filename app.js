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
const usersAdminRoutes = require("./routes/users.admin.routes");
app.use("/api/admin", isAuthenticated, isAdmin, usersAdminRoutes);
const eventsAdminRoutes = require("./routes/events.admin.routes");
app.use("/api/admin", isAuthenticated, isAdmin, eventsAdminRoutes);
const eventAdminRoutes = require("./routes/eventAdmin.admin.routes");
app.use("/api/admin", isAuthenticated, isAdmin, eventAdminRoutes);
const productsAdminRoutes = require("./routes/products.admin.routes");
app.use("/api/admin", isAuthenticated, isAdmin, productsAdminRoutes);

// ❗ To handle errors. Routes that don't exist or errors that you handle in specific routes
require("./error-handling")(app);

module.exports = app;

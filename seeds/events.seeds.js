const mongoose = require("mongoose");
const Event = require("../models/Event.model");
const User = require("../models/User.model");
const MONGO_URI = require("../utils/consts");
const axios = require("axios");

// in order to run this seed file just type node seeds/events.seeds.js in the terminal

mongoose
  .connect(MONGO_URI)
  .then((x) => {
    console.log(
      `Connected to Mongo! Database name: "${x.connections[0].name}"`
    );
  })
  .catch((err) => {
    console.error("Error connecting to mongo: ", err);
  });

const randomEvents = async () => {
  const eventsInfos = [
    {
      name: "Rock in Rio",
      date: new Date("2022-12-17T03:24:00"),
      type: "normal",
    },
    { name: "Burnman", date: new Date("2022-08-17T03:24:00"), type: "normal" },
    {
      name: "F1 race",
      date: new Date("2022-05-17T03:24:00"),
      type: "open-bar",
    },
  ];
  const userIds = [];
  try {
    const fetchUserIds = await User.find();
    await Promise.all(
      fetchUserIds.map(async (user) => {
        try {
          const { _id } = user;
          userIds.push(_id);
        } catch (error) {
          console.log(error);
        }
      })
    );
    const createdEvents = await Event.create(eventsInfos);
    await Promise.all(
      userIds.slice(5, 10).map(async (e) => {
        try {
          await User.findByIdAndUpdate(
            { _id: e },
            { $push: { events: createdEvents[0]._id } }
          );
          await Event.findByIdAndUpdate(
            { _id: createdEvents[0]._id },
            { $push: { users: e } }
          );
        } catch (error) {
          console.log(error);
        }
      })
    );
  } catch (error) {
    console.log(error);
  }
  console.log(`Created ${createdEvents.length} in the db`);
  mongoose.disconnect(() => console.log(`db disconnected`));
};

randomEvents();

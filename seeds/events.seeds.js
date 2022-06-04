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
      date: new Date("2022-06-02T03:24:00"),
      location: {
        address: "R. Nova do Carvalho,73",
        city: "Lisboa",
        state: "Ls",
        country: "Portugal",
        geo: {
          lat: 38.70759862989832,
          lng: -9.144320244579871,
        },
      },
      description:
        "Lorem ipsum, dolor sit amet consectetur adipisicing elit. Architecto voluptate facere dignissimos fugit minus hic, suscipit consequuntur eius totam ipsa quisquam unde ratione ex pariatur recusandae similique iure fugiat fuga?",
    },
    {
      name: "Comiccon",
      date: new Date("2022-10-T03:24:00"),
      location: {
        address: "R. Cavaleiro de Oliveira, 28",
        city: "Lisboa",
        state: "Ls",
        country: "Portugal",
        geo: {
          lat: 38.73258873496412,
          lng: -9.132665015742898,
        },
      },
      description:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Id voluptates perferendis maiores delectus totam cumque, dolor voluptatem, debitis aspernatur iste quasi? Nihil corporis nesciunt, rerum inventore deleniti explicabo excepturi repellendus.",
    },
    {
      name: "Medieval Festival",
      date: new Date("2022-02-17T03:24:00"),
      location: {
        address: "R. Clodomiro Amazonas, 202",
        city: "Sao Paulo",
        state: "SP",
        country: "Brazil",
        geo: {
          lat: -23.585861070776915,
          lng: -46.67968237381178,
        },
      },
      description:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptas ex dolore dolorum quam porro illum laboriosam voluptate debitis praesentium voluptates doloremque unde facilis quod, distinctio officiis nemo culpa quisquam maxime.",
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

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
      name: "Lolapalooza",
      date: new Date("2022-06-09T03:24:00"),
      active: true,
      takeOrders: true,
      splashImg:
        "https://media.gettyimages.com/photos/festivalgoers-on-day-four-of-lollapalooza-at-grant-park-on-august-1-picture-id1234390428?s=612x612",
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
      name: "Tomorrowland",
      date: new Date("2022-06-09T03:24:00"),
      active: true,
      takeOrders: true,
      splashImg:
        "https://images.prismic.io/tomorrowland/8beeb14b-bc77-4ee6-baca-8317fff8c43a_190720-194141-TML2019-KV-5679-HR.jpg?auto=compress,format&rect=0,0,5266,3511&w=480&h=320",
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
      name: "Roland Garros",
      date: new Date("2022-06-04T03:24:00"),
      active: true,
      takeOrders: true,
      splashImg:
        "https://padelmagazine.fr/wp-content/uploads/2019/11/roland-garros-2020.jpg",
      location: {
        address: "R. Nova do Carvalho,73",
        city: "Lisboa",
        state: "Ls",
        country: "Portugal",
        geo: {
          lat: 38.70759862989832,
          lng: -9.144320244579871,
        },
        description:
          "Lorem ipsum, dolor sit amet consectetur adipisicing elit. Architecto voluptate facere dignissimos fugit minus hic, suscipit consequuntur eius totam ipsa quisquam unde ratione ex pariatur recusandae similique iure fugiat fuga?",
      },
    },
    {
      name: "Wimbledon",
      date: new Date("2022-06-27T03:24:00"),
      active: true,
      takeOrders: true,
      splashImg:
        "https://www.puntodebreak.com/files/wimbledon-2022-atp-entry-list.jpeg",
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
  console.log(`Created events in the db`);
  mongoose.disconnect(() => console.log(`db disconnected`));
};

randomEvents();

const mongoose = require("mongoose");
const Product = require("../models/Product.model");
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
  const products = [
    {
      name: "Heineken 350ml",
      manufacturer: "Heineken",
      date: new Date("2022-12-17T03:24:00"),
      price: 10,
    },
    {
      name: "Big Mac",
      manufacturer: "McDonalds",
      date: new Date("2022-05-01T03:24:00"),
      price: 5,
      productImg:
        "https://image.similarpng.com/very-thumbnail/2020/04/burger-transparent-png.png",
    },
    {
      name: "T-shirt Rock",
      manufacturer: "Other",
      date: new Date("2021-01-25T03:24:00"),
      price: 2.55,
      productImg:
        "https://w7.pngwing.com/pngs/712/583/png-transparent-poster-t-shirt-rock-music-punk-rock-rock-posters.png",
    },
  ];
  try {
    const createdProducts = await Product.create(products);
    console.log(`Created ${createdProducts.length} in the db`);
    mongoose.disconnect(() => console.log(`db disconnected`));
  } catch (error) {
    console.log(error);
  }
};

randomEvents();

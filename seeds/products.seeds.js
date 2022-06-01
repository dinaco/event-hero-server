const mongoose = require("mongoose");
const Product = require("../models/Product.model");
const Event = require("../models/Event.model");
const MONGO_URI = require("../utils/consts");
const axios = require("axios");

// in order to run this seed file just type node seeds/products.seeds.js in the terminal

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
      price: 10,
      event: "6293229e787fd6a0146f3b00",
    },
    {
      name: "Big Mac",
      manufacturer: "McDonalds",
      price: 5,
      productImg:
        "https://image.similarpng.com/very-thumbnail/2020/04/burger-transparent-png.png",
      event: "6293229e787fd6a0146f3b00",
    },
    {
      name: "T-shirt Rock",
      manufacturer: "Other",
      price: 2.55,
      productImg:
        "https://w7.pngwing.com/pngs/712/583/png-transparent-poster-t-shirt-rock-music-punk-rock-rock-posters.png",
      event: "6293229e787fd6a0146f3b00",
    },
    {
      name: "Heineken 1Liter",
      manufacturer: "Heineken",
      price: 20,
      productImg:
        "https://www.heineken.com/media-eu/ffeluw1s/heineken-draught-keg.png?quality=85",
      event: "6293229e787fd6a0146f3b01",
    },
    {
      name: "Kebab",
      manufacturer: "Kebab King",
      price: 5,
      productImg:
        "https://www.alibabakebabhaus.com//wp-content/uploads/2019/08/doner-kebab-slider.png",
      event: "6293229e787fd6a0146f3b01",
    },
    {
      name: "Event Cap",
      manufacturer: "Other",
      price: 5.45,
      productImg:
        "https://img.hatshopping.com/Champion-Baseball-Cap-black.92719_rf4.jpg",
      event: "6293229e787fd6a0146f3b01",
    },
    {
      name: "Soft drink",
      manufacturer: "Coca Cola",
      price: 2.5,
      productImg:
        "https://www.spar.pt/images/thumbs/0003645_refrig-coca-cola-lata-033lt_550.jpeg",
      event: "6293229e787fd6a0146f3b01",
    },
    {
      name: "Wine",
      manufacturer: "Casal Garcia",
      price: 7,
      productImg:
        "https://ean-images.booztcdn.com/spiegelau/1300x1700/g/spi4720172_cclearglass_1.jpg",
      event: "6293229e787fd6a0146f3b01",
    },
  ];
  try {
    const createdProducts = await Product.create(products);
    await Promise.all(
      products.map(async (product) => {
        try {
          await Event.findByIdAndUpdate(
            { _id: product.event },
            { $push: { products: product._id } }
          );
        } catch (error) {
          console.log(error);
        }
      })
    );
    console.log(`Created ${createdProducts.length} in the db`);
    mongoose.disconnect(() => console.log(`db disconnected`));
  } catch (error) {
    console.log(error);
  }
};

randomEvents();

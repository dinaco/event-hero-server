const mongoose = require("mongoose");
const User = require("../models/User.model");
const MONGO_URI = require("../utils/consts");
const bcrypt = require("bcrypt");
const axios = require("axios");

// in order to run this seed file just type node seeds/users.seeds.js in the terminal

const saltRounds = 10;

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

const randomUsers = async () => {
  const usersAmount = 20;
  const newUsersArr = [];
  try {
    const result = await axios.get(
      `https://randomuser.me/api/?results=${usersAmount}`
    );
    await Promise.all(
      result.data.results.map(async (user) => {
        try {
          const {
            email,
            name,
            login: { password },
            picture: { large: profileImg },
          } = user;

          const salt = await bcrypt.genSalt(saltRounds);
          const hashedPassword = await bcrypt.hash(password, salt);

          newUsersArr.push({
            email,
            hashedPassword,
            profileImg,
            role: "customer",
          });
        } catch (error) {
          console.log(error);
        }
      })
    );
    const createdUsers = await User.create(newUsersArr);
    console.log(`Created ${createdUsers.length} in the db`);
    mongoose.disconnect(() => console.log(`db disconnected`));
  } catch (error) {
    console.log(error);
  }
};

randomUsers();

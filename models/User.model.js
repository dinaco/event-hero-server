const { Schema, model } = require("mongoose");

// TODO: Please make sure you edit the user model to whatever makes sense in this case

const randomGender = Math.round(Math.random() + 1) === 0 ? "women" : "men";

const userSchema = new Schema(
  {
    email: {
      type: String,
      unique: true,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    hashedPassword: { type: String, required: true },
    profileImg: {
      type: String,
      default: `https://randomuser.me/api/portraits/${randomGender}/${Math.floor(
        Math.random() * 50 + 1
      )}.jpg`,
    },
    balance: { type: Number, min: 0, default: 0 },
    events: [{ type: Schema.Types.ObjectId, ref: "Event" }],
    orders: [{ type: Schema.Types.ObjectId, ref: "Order" }],
    role: {
      type: String,
      enum: ["customer", "app-admin", "event-admin", "event-staff"],
      default: "customer",
    },
    active: { type: Boolean, default: true },
  },
  {
    // this second object adds extra properties: `createdAt` and `updatedAt`
    timestamps: true,
  }
);
userSchema.virtual("id").get(function () {
  return this._id.toHexString();
});
userSchema.set("toJSON", {
  virtuals: true,
});

const User = model("User", userSchema);

module.exports = User;

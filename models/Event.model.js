const { Schema, model } = require("mongoose");

// TODO: Please make sure you edit the user model to whatever makes sense in this case

const eventSchema = new Schema(
  {
    name: {
      type: String,
      require: true,
    },
    date: { type: Date, require: true },
    splashImg: {
      type: String,
      default: `https://rollingstone.uol.com.br/media/uploads/rock-in-rio_getty_images_raphael_dias.jpg`,
    },
    type: {
      type: String,
      enum: ["normal", "open-bar"],
      required: true,
    },
    description: String,
    customers: [{ type: Schema.Types.ObjectId, ref: "User" }],
    staff: [{ type: Schema.Types.ObjectId, ref: "User" }],
    admins: [{ type: Schema.Types.ObjectId, ref: "User" }],
    products: [{ type: Schema.Types.ObjectId, ref: "Product" }],
    orders: [{ type: Schema.Types.ObjectId, ref: "Order" }],
    active: { type: Boolean, required: true, default: true },
  },
  {
    // this second object adds extra properties: `createdAt` and `updatedAt`
    timestamps: true,
  }
);
eventSchema.virtual("id").get(function () {
  return this._id.toHexString();
});
eventSchema.set("toJSON", {
  virtuals: true,
});

const Event = model("Event", eventSchema);

module.exports = Event;

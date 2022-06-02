const { Schema, model } = require("mongoose");

// TODO: Please make sure you edit the user model to whatever makes sense in this case

const productSchema = new Schema(
  {
    name: {
      type: String,
      require: true,
    },
    productImg: {
      type: String,
      default: `https://www.heineken.com/media-az/01pfxdqq/heineken-original-bottle.png?quality=85`,
    },
    manufacturer: {
      type: String,
      require: true,
    },
    price: { type: Number, min: 0, required: true },
    event: { type: Schema.Types.ObjectId, ref: "Event" },
    active: { type: Boolean, required: true, default: true },
    orders: [{ type: Schema.Types.ObjectId, ref: "Order" }],
  },
  {
    // this second object adds extra properties: `createdAt` and `updatedAt`
    timestamps: true,
  }
);
productSchema.virtual("id").get(function () {
  return this._id.toHexString();
});
productSchema.set("toJSON", {
  virtuals: true,
});

const Product = model("Product", productSchema);

module.exports = Product;

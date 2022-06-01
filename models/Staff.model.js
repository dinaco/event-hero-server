const { Schema, model } = require("mongoose");

// TODO: Please make sure you edit the user model to whatever makes sense in this case

const randomGender = Math.round(Math.random() + 1) === 0 ? "women" : "men";

const staffSchema = new Schema(
  {
    email: {
      type: String,
      unique: true,
      require: true,
      lowercase: true,
      // unique: true -> Ideally, should be unique, but its up to you
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
    type: {
      type: String,
      enum: ["user", "app-admin", "event-admin", "event-staff"],
      required: true,
    },
    active: { type: Boolean, required: true, default: true },
  },
  {
    // this second object adds extra properties: `createdAt` and `updatedAt`
    timestamps: true,
  }
);
staffSchema.virtual("id").get(function () {
  return this._id.toHexString();
});
staffSchema.set("toJSON", {
  virtuals: true,
});

const Staff = model("Staff", staffSchema);

module.exports = Staff;

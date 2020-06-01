import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: {
    type: String, // Nothing to do with TS
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
});

const User = mongoose.model("User", userSchema);

const user = new User({
  email: "pepe",
  passwordTypo: "asdsad",
  pepe: "seems ok",
}); // No complains by TS

export { User };

import mongoose from "mongoose";
import { Password } from "../services/password";

// An interface that describes the properties
// that are required to create a new user
interface UserAttrs {
  email: string;
  password: string;
}

// An interface that describes the properties
// that a user model has
interface UserModel extends mongoose.Model<UserDoc> {
  build: (attrs: UserAttrs) => UserDoc;
}

// An interface that describes the properties
// that a user model has
interface UserDoc extends mongoose.Document {
  email: string;
  password: string;
  // updateAt: string; // Add if we would like to access property in user. See (*access to user.updatedAt)
}

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String, // Nothing to do with TS
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.password;
        delete ret.__v;
      },
    },
  }
);

userSchema.pre("save", async function (done) {
  // Check if we modified the user password
  // We might retrieving the user from the DB and then saving it back to th eDB
  // i.e.: modifying - edit - the email on the user
  // Only hash the password if the user's password was modified
  // Mongoose considered the password to be modified also when it is created
  if (this.isModified("password")) {
    const hashed = await Password.toHash(this.get("password"));
    this.set("password", hashed);
  }

  done();
});

userSchema.statics.build = (attrs: UserAttrs) => {
  return new User(attrs);
};

const User = mongoose.model<UserDoc, UserModel>("User", userSchema);

// const user = User.build({
//   email: "ads",
//   password: "asdasd",
// });
// Now we can access properties, because user is now of UserDoc type
// user.email; // good
// user.password; // good
// user.updatedAt // We could if interface updated - see (*access to user.updatedAt)

export { User };

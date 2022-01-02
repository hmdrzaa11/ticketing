import mongoose from "mongoose";
import { Password } from "../services/password";

//An interface that describes properties that are required to create a user

interface UserAttrs {
  email: string;
  password: string;
}

//An interface that describes properties that User Model has
interface UserModel extends mongoose.Model<UserDoc> {
  build(attrs: UserAttrs): UserDoc;
}

//An interface that describes properties that User Document has
interface UserDoc extends mongoose.Document {
  email: string;
  password: string;
}

let userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true },
    password: { type: String, required: true },
  },
  {
    toJSON: {
      transform(doc, ret) {
        //we need to do direct changes to the "ret"
        ret.id = ret._id;
        delete ret.password;
        delete ret.__v;
        delete ret._id;
      },
    },
  }
);

userSchema.statics.build = function (attrs: UserAttrs) {
  return new User(attrs);
};

userSchema.pre("save", async function (done) {
  if (this.isModified("password")) {
    let hashed = await Password.toHash(this.get("password"));
    this.set("password", hashed);
  }
  done();
});

let User = mongoose.model<UserDoc, UserModel>("User", userSchema);

export { User };

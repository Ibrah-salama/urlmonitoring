const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const crypto = require('crypto');
const AppError = require("../utils/appError");

const userSchema = mongoose.Schema({
  name: { type: String, required: [true, "Please tell us your name!"] },
  username: {
    type: String,
    min: 6,
    required: [true, "Please provide your username!"],
    unique: true,
    lowercase: true,
  },
  email: {
    type: String,
    required: [true, "Please provide your email!"],
    validate: [validator.isEmail, "Please provide your email!"],
  },
  password: {
    type: String,
    required: [true, "Please provide a password!"],
    minlength: 8,
    select:false
  },
  passwordConfirm: {
    type: String,
    required: [true, "Please confirm your password!"],
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: "Password are not the same",
    },
  },
  active: { type: Boolean, default: false },
  verificationToken:{ type:String , select: false}
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try{ 
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  }catch(err){ 
      next(new AppError("",400))
  }
  next();
});

userSchema.pre('save', function(){
    this.verificationToken = crypto.randomBytes(32).toString('hex')
})

userSchema.methods.correctPassword= async function(candidatePassword, userPassword){ 
    return await bcrypt.compare(candidatePassword,userPassword)
}

const UserModel = mongoose.model("User", userSchema);

module.exports = UserModel;

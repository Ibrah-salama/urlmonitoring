const mongoose = require("mongoose");

const checkSchema = mongoose.Schema({
  name: {
    type: String,
    unique: true,
    required: [true, "A check Must has a name! "]
  },
  URL: {
    type: String,
    required: [true, "Please provide a URL to check it."],
  },
  protocol: {
    type: String,
    // enum:['HTTP','HTTPS','TCP'],
  },
  path: {
    type: String,
  },
  port: {
    type: Number,
  },
  tags: {
    type: String,
  },
  interval: {
    type: Number,
    required: true,
    default: 600,
  },
  timeOut: {
    type: Number,
    required: true,
    default: 5,
  },
  threshold: {
    type: Number,
    required: true,
    default: 1,
  },
  tags: {
    type: [String],
  },
  webhook: {
    type: String,
    default: undefined,
  },
  ignoreSSL: {
    type: Boolean,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    // required: [true, 'A review Must belong to user']
  },
});

const CheckModel = mongoose.model("Check", checkSchema);

checkSchema.pre("save",  function () {
  if (this.protocol.includes("https")) {
    this.ignoreSSL = false;
  } else {
    this.ignoreSSL = true;
  }
});

module.exports = CheckModel;

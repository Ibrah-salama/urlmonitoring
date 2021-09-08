const mongoose = require("mongoose");

const reportSchema = mongoose.Schema({
  status: {
    type: String,
    default: "",
  },
  responseTime: {
    type: Number,
    default: 0,
  },
  availability: {
    type: Number,
    default: 0,
  },
  upTime: {
    type: Number,
    default: 0,
  },
  outages: {
    type: Number,
  },
  downTime: {
    type: Number,
    default: 0,
  },
  history: {
    type: [Date],
  },
  check: {
    type: mongoose.Schema.ObjectId,
    ref: "Check",
    required: [true, "Report Must Belong to check"],
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: [true, "A Report Must belong to user url monitor"],
  },
});

const ReportModel = mongoose.model("Report", reportSchema);

module.exports = ReportModel;

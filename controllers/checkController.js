const catchAsync = require("./../utils/catchAsync");
const ReportModel = require("../models/reportModel");
const AppError = require("../utils/appError");
const CheckModel = require("../models/checkModel");
const UserModel = require("../models/userModel");
const webhookUtil = require("./../utils/webhook");
const request = require("request");
// const a = require('simple-puppeteer-uptime-checker')

exports.createCheck = catchAsync(async (req, res, next) => {
  const url = req.body.url;

  if (!req.body.user) req.body.user = req.user.id;

  var startTime = new Date();

  request.get({ url: url, time: true }, async (err, response) => {
    if (err) {
      return next(new AppError("There is something wrong with that URL", 404));
    } else {
      var responseTime = (new Date() - startTime) / 1000;
      message = response.statusMessage;
      statusCode = response.statusCode;

      const check = await CheckModel.create({
        name: req.body.name,
        URL: url,
        protocol: response.request.uri.protocol,
        path: response.request.path,
        port: response.request.port,
        host: response.request.uri.host,
        webhook:
          "https://discord.com/api/webhooks/884853062018146344/IZuCxrnkhNslqBE5zcSeddasLxxgH9cIBCuiU9t0gpXduKkUyE3LyQuN_vbw7e8xImZE",
        user: req.body.user,
      });

      if (!check)
        return next(new AppError("Failure saving your monitor ", 404));
      const checkId = await check._id;

      await ReportModel.create({
        status: "status",
        responseTime: responseTime,
        user: req.body.user,
        check: checkId,
      });

      const urlCheckkingResult = {
        name: response.request.uri.host,
        url: url,
        urlStatus: message,
        urlStatuCode: statusCode,
        protocol: response.request.uri.protocol,
        path: response.request.path,
        port: response.request.port,
      };

      // sending messages in webhook
      const webhook = await check.webhook;
      const userData = await UserModel.findById(req.user.id);
      const email = await userData.email;
      await webhookUtil.webhook(webhook, message, email, message);

      res.status(200).json(urlCheckkingResult);
    }
  });
});

exports.getCheckByName = catchAsync(async (req, res, next) => {
  const checkName = req.params.checkName;
  const check = await CheckModel.findOne({ name: checkName });
  if (!check)
    return res
      .status(404)
      .json({ status: "fail", message: "Thers are no check with that name!" });

  res.status(200).json({
    status: "success",
    data: check,
  });
});

exports.getChecks = catchAsync(async (req, res, next) => {
  res.status(500).json({
    status: "success",
  });
});

exports.editCheck = catchAsync(async (req, res, next) => {
  // const user = await UserModel.findById(req.user.id)
  const checkName = req.params.checkName;
  const userId = req.user.id;

  const oldCheck = await CheckModel.findOne({ name: checkName, user: userId });
  const updatedCheck = await CheckModel.findOneAndUpdate(
    { name: checkName, user: userId },
    {
      name: req.body.name ? req.body.name : oldCheck.name,
    }
  );

  res.status(201).json({
    status: "success",
    data: updatedCheck,
  });
});

exports.pauseCheck = catchAsync(async (req, res, next) => {
  const checkName = req.params.checkName;
  const userId = req.user.id;
  const pausedCheck = await CheckModel.findOneAndUpdate(
    { name: checkName, user: userId },
    {
      isActive: false,
    }
  );
  if (!pausedCheck)
    return res.status(404).json({
      status: "fail",
      message: "There is no check to pause",
    });
  res.status(201).json({
    status: "success",
    message: "Successfully disable monitorin on this check",
    data: pausedCheck,
  });
});

exports.deleteCheck = catchAsync(async (req, res, next) => {
  const checkName = req.params.checkName;
  const userId = req.user.id;
  await CheckModel.findOneAndDelete({ name: checkName, user: userId });
  res.status(204).json({
    status: "success",
    message: "Successfully deleted this check",
    data: null,
  });
});

exports.addTagToCheck = catchAsync(async (req, res, next) => {
  const checkName = req.params.checkName;
  const userId = req.user.id;
  const taggedCheck = await CheckModel.findOneAndUpdate(
    { name: checkName, user: userId },
    { $push: { tags: req.body.tags } }
  );
  if (!taggedCheck)
    return res.status(404).json({
      status: "fail",
      message: "There is no checks with that name",
    });

  res.status(200).json({
    status: "success",
    message: "Successfully tag Added to this check",
    data: taggedCheck,
  });
});

exports.getChecksByTagName = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const tagName = req.body.tags;
  const checks = await CheckModel.find({ user: userId, tags: tagName });

  res.status(200).json({
    status: "success",
    message: "Successfully found checks with that tag.",
    data: checks,
  });
});

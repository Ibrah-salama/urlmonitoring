const CheckModel = require("../models/checkModel");
const ReportModel = require("../models/reportModel");
const catchAsync = require("../utils/catchAsync");

exports.getReportsByTag = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const tagName = req.params.tagName;
  const checks = await CheckModel.find({ tags: tagName, user: userId });

  const checksIds = checks.map((check) => {
    return check.id;
  });

  const reports = await ReportModel.find({
    check: { $in: checksIds },
  });
  if (!reports)
    return res.status(404).json({
      message: "There are no reports with that tag! ",
    });

  res.status(200).json({
    status: "success",
    data: reports,
  });
});

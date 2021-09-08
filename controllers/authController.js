const UserModel = require("./../models/userModel");
const jwt = require("jsonwebtoken");
const { promisify } = require("util");

const AppError = require("../utils/appError");
const catchAsync = require("./../utils/catchAsync");
const sendEmail = require("./../utils/email");

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createAndSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  res.cookie("jwt", token, cookieOptions);
  user.password = undefined;
  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await UserModel.create({
    name: req.body.name,
    username: req.body.username,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  const verifyToken = newUser.verificationToken;

  const verificationURL = `${req.protocol}://${req.get(
    "host"
  )}/api/users/verifyUser/${verifyToken}`;

  const message = `This emal is for verification your account Please visit this URL: \n ${verificationURL}. \n 
     To activate your account.`;

  try {
    await sendEmail({
      email: newUser.email,
      subject: "Activate your account",
      message: message,
    });
  } catch (err) {
    next(
      new AppError(
        "There is a problem sending the email, please try again later"
      ),
      500
    );
  }

  const token = signToken(newUser._id);

  res.status(201).json({
    status: "success",
    token,
    data: { user: newUser },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password)
    return next(new AppError("Please provide email and password!", 400));
  const user = await UserModel.findOne({ email }).select("+password");
  const correct = user.correctPassword(password, user.password);
  if (!user || !correct)
    return next(new AppError("Incorrect email or password", 401));
  if (user.active === false) {
    return res.status(401).json({
      status: "fail",
      message: "Please check your email for verification",
    });
  }
  createAndSendToken(user, 200, res);
});

exports.logout = (req, res) => {
  res.cookie("jwt", "loggedout", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({
    status: "success",
  });
};

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers["authorization"] &&
    req.headers["authorization"].startsWith("Bearer")
  ) {
    token = req.headers["authorization"].split(" ")[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  if (!token) {
    return next(
      new AppError("You are not logged in! please log in to get access.", 401)
    );
  }
  const decodedData = await promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET
  );
  const currentUser = await UserModel.findById(decodedData.id);
  if (!currentUser)
    return next(new AppError("The token is no longer exist.", 401));

  req.user = currentUser;
  res.locals.user = currentUser;
  next();
});

exports.verifyUser = catchAsync(async (req, res, next) => {
  const verifyToken = req.params.verifyToken;
  const user = await UserModel.findOneAndUpdate(
    { verificationToken: verifyToken },
    { active: true }
  );
  if (!user)
    return next(new AppError("You are not allowed to use this route", 403));
  const token = signToken(user._id);
  user.verificationToken = undefined;
  await user.save({ validateBeforeSave: false });
  res.status(200).json({
    status: "success",
    token,
  });
});

exports.isLoggedIn = catchAsync(async (req, res, next) => {
  console.log("kkkkk");
  console.log(req.cookies);
  if (req.cookies.jwt) {
    try {
      const decodedData = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );
      const currentUser = await UserModel.findById(decodedData.id);
      if (!currentUser) return next();

      res.locals.user = currentUser;
      return next();
    } catch (err) {
      return next();
    }
  }
  next();
});

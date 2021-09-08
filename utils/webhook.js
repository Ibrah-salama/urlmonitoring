// const fetch = require('node-fetch')
const axios = require("axios");

const sendEmail = require("./email");

exports.webhook = async function (whURL, message, email, status) {
  const res = await axios.post(whURL, {
    content: message,
  });

  if (res) {
    try {
      await sendEmail({
        email: email,
        subject: "Info About your url monitoring",
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
  } else {
    console.log("alnkmfdml;vc lnkmf.d/,x");
  }
};

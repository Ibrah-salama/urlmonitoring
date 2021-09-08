const express = require('express')
const router = express.Router()

const reportController = require("../controllers/reportController")
const authController = require('../controllers/authController')

router.use(authController.protect);
// router.use(authController.isLoggedIn);


router.route("/:tagName").get(reportController.getReportsByTag)

module.exports = router
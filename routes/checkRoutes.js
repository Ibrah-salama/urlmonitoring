const express = require("express");

const authController = require("./../controllers/authController");
const checkController = require("./../controllers/checkController");

const router = express.Router();

router.use(authController.protect);

router
  .route("/")
  .post(checkController.createCheck)

router
  .route("/tags")
  .get(checkController.getChecksByTagName);

router
  .route("/:checkName")
  .get(checkController.getCheckByName)
  .delete(checkController.deleteCheck);

router.route("/:checkName/pause").patch(checkController.pauseCheck);

router.route("/:checkName/edit").patch(checkController.editCheck);

router.route("/:checkName/tags").patch(checkController.addTagToCheck);

router.route("/tags").get(checkController.getChecksByTagName);

module.exports = router;

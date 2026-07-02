const express = require("express");
const router = express.Router({ mergeParams: true });
const {
  getAllMenus,
  createMenu,
  deleteMenu,
  addItemToMenu,
} = require("../controllers/menuController");

const { protect } = require("../controllers/authController");
const { authorizeRoles } = require("../middlewares/authorizeRoles");

router
  .route("/")
  .get(getAllMenus)
  .post(protect, authorizeRoles("admin"), createMenu);

// add food item to a specific menu (more specific, must come before /:menuId)
router
  .route("/:menuId/addItem")
  .patch(protect, authorizeRoles("admin"), addItemToMenu);

router.route("/:menuId").delete(protect, authorizeRoles("admin"), deleteMenu);

//doubt//router.route("/:menuId/items").post(protect, authorizeRoles("admin"), addItemToMenu);

module.exports = router;

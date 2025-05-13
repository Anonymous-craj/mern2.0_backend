import express, { Router } from "express";
import authMiddleware from "../middleware/authMiddleware";
import cartController from "../controllers/cartController";
const router: Router = express.Router();

router
  .route("/")
  .post(authMiddleware.isAuthenticated, cartController.addToCart)
  .get(authMiddleware.isAuthenticated, cartController.getMyCarts);

router
  .route("/:productId")
  .delete(authMiddleware.isAuthenticated, cartController.deleteCartItem)
  .patch(authMiddleware.isAuthenticated, cartController.updateCartItem);

export default router;

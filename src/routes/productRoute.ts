import express, { Router } from "express";
import authMiddleware, { Role } from "../middleware/authMiddleware";
const router: Router = express.Router();
import { storage, multer } from "../middleware/multerMiddleware";
import productController from "../controllers/productController";
const upload = multer({ storage: storage });

router
  .route("")
  .post(
    authMiddleware.isAuthenticated,
    authMiddleware.restrictTo(Role.Admin),
    upload.single("image"),
    productController.addProduct
  )
  .get(productController.getAllProducts);

router
  .route("/:id")
  .get(productController.getSingleProduct)
  .delete(
    authMiddleware.isAuthenticated,
    authMiddleware.restrictTo(Role.Admin),
    productController.deleteProduct
  );

export default router;

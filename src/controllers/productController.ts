import { Request, Response } from "express";
import Product from "../database/models/productModel";
import { AuthRequest } from "../middleware/authMiddleware";
import User from "../database/models/userModel";
import Category from "../database/models/categoryModel";

class ProductController {
  async addProduct(req: AuthRequest, res: Response): Promise<void> {
    const userId = req.user?.id;
    try {
      const {
        productName,
        productPrice,
        productDescription,
        productTotalStockQty,
        categoryId,
      } = req.body;
      let fileName;
      if (req.file) {
        fileName = req.file?.filename;
      } else {
        fileName =
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTW1yhlTpkCnujnhzP-xioiy9RdDQkKLMnMSg&s";
      }
      if (
        !productName ||
        !productPrice ||
        !productDescription ||
        !productTotalStockQty ||
        !categoryId
      ) {
        res.status(400).json({
          message:
            "Please provide productName, productPrice, productDescription, productTotalStockQty, categoryId",
        });
        return;
      }

      await Product.create({
        productName,
        productPrice,
        productDescription,
        productTotalStockQty,
        productImageUrl: fileName,
        userId: userId,
        categoryId: categoryId,
      });
      res.status(200).json({
        message: "Product added successfully!",
      });
    } catch (error) {
      res.status(500).json({
        message: "Something went wrong!",
      });
    }
  }

  async getAllProducts(req: Request, res: Response): Promise<void> {
    const data = await Product.findAll({
      include: [
        {
          model: User,
          attributes: ["id", "username", "email"],
        },
        {
          model: Category,
          attributes: ["id", "categoryName"],
        },
      ],
    });
    res.status(200).json({
      message: "Products fetched successfully!",
      data,
    });
  }
}

export default new ProductController();

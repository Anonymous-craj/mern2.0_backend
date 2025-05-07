import { Request, Response } from "express";
import Product from "../database/models/productModel";

class ProductController {
  async addProduct(req: any, res: Response): Promise<void> {
    try {
      const {
        productName,
        productPrice,
        productDescription,
        productTotalStockQty,
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
        !productTotalStockQty
      ) {
        res.status(400).json({
          message:
            "Please provide productName, productPrice, productDescription, productTotalStockQty",
        });
        return;
      }

      await Product.create({
        productName,
        productPrice,
        productDescription,
        productTotalStockQty,
        productImageUrl: fileName,
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
}

export default new ProductController();

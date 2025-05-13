import { Request, Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import Cart from "../database/models/cartModel";
import Product from "../database/models/productModel";

class CartController {
  async addToCart(req: AuthRequest, res: Response): Promise<void> {
    const userId = req.user?.id;
    const { quantity, productId } = req.body;
    if (!quantity || !productId) {
      res.status(400).json({
        message: "Please provide quantity and product",
      });
    }
    //check whether the product already exist in the cart table or not
    let cartItem = await Cart.findOne({
      where: {
        productId,
        userId,
      },
    });
    if (cartItem) {
      cartItem.quantity += quantity;
      await cartItem.save();
    } else {
      cartItem = await Cart.create({
        quantity,
        userId,
        productId,
      });
    }
    res.status(200).json({
      message: "Product added to cart",
      data: cartItem,
    });
  }

  async getMyCarts(req: AuthRequest, res: Response): Promise<void> {
    const userId = req.user?.id;
    const cartItems = await Cart.findAll({
      where: {
        userId,
      },
      include: [
        {
          model: Product,
        },
      ],
    });
    if (cartItems.length === 0) {
      res.status(400).json({
        message: "No items in the cart",
      });
    } else {
      res.status(200).json({
        message: "Cart items fetched successfully",
        data: cartItems,
      });
    }
  }

  async deleteCartItem(req: AuthRequest, res: Response): Promise<void> {
    const userId = req.user?.id;
    const { productId } = req.params;
    //Check whether the product is available in the table or not
    const product = await Product.findByPk(productId);
    if (!product) {
      res.status(404).json({
        message: "No product with that id",
      });
      return;
    }
    //remove the item from the cart
    await Cart.destroy({
      where: {
        userId,
        productId,
      },
    });
    res.status(200).json({
      message: "Product removed from cart successfully!",
    });
  }

  async updateCartItem(req: AuthRequest, res: Response): Promise<void> {
    const userId = req.user?.id;
    const { productId } = req.params;
    const { quantity } = req.body;

    if (!quantity) {
      res.status(404).json({
        message: "Please provide quantity!",
      });
    }
    const cartData = await Cart.findOne({
      where: {
        userId,
        productId,
      },
    });
    if (cartData) {
      cartData.quantity = quantity;
      await cartData.save();
      res.status(200).json({
        message: "Product of that cart updated successfully!",
        data: cartData,
      });
    } else {
      res.status(404).json({
        message: "No product with that user id",
      });
    }
  }
}

export default new CartController();

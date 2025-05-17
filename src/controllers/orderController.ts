import axios from "axios";
import Order from "../database/models/Order";
import OrderDetail from "../database/models/OrderDetails";
import Payment from "../database/models/Payment";
import { AuthRequest } from "../middleware/authMiddleware";
import {
  KhaltiResponse,
  OrderData,
  OrderStatus,
  PaymentMethod,
  TransactionStatus,
  TransactionVerificationResponse,
} from "../types/orderTypes";
import { Response } from "express";
import Product from "../database/models/productModel";

class OrderController {
  async createOrder(req: AuthRequest, res: Response): Promise<void> {
    const userId = req.user?.id;
    const {
      shippingAddress,
      phoneNumber,
      totalAmount,
      paymentDetails,
      items,
    }: OrderData = req.body;
    if (
      !shippingAddress ||
      !phoneNumber ||
      !totalAmount ||
      !paymentDetails ||
      !paymentDetails.paymentMethod ||
      items.length == 0
    ) {
      res.status(400).json({
        message:
          "Please provide shippingAddress, phoneNumber, totalAmount, paymentDetails, items",
      });
      return;
    }

    const paymentData = await Payment.create({
      paymentMethod: paymentDetails.paymentMethod,
    });

    const orderData = await Order.create({
      shippingAddress,
      phoneNumber,
      totalAmount,
      userId,
      paymentId: paymentData.id,
    });

    for (var i = 0; i < items.length; i++) {
      await OrderDetail.create({
        quantity: items[i].quantity,
        productId: items[i].productId,
        orderId: orderData.id,
      });
    }
    if (paymentDetails.paymentMethod === PaymentMethod.Khalti) {
      //Khalti integration
      const data = {
        return_url: "http://localhost:3000/success",
        purchase_order_id: orderData.id,
        amount: totalAmount * 100,
        purchase_order_name: "orderName_" + orderData.id,
        website_url: "http://localhost:3000/",
      };
      const response = await axios.post(
        "https://dev.khalti.com/api/v2/epayment/initiate/",
        data,
        {
          headers: {
            Authorization: "key 6968a254b4924721ab8e7aebd8579e71",
          },
        }
      );
      const khaltiResponse: KhaltiResponse = response.data;
      paymentData.pidx = khaltiResponse.pidx;
      await paymentData.save();
      res.status(200).json({
        message: "Order placed successfully!",
        url: khaltiResponse.payment_url,
      });
    } else {
      res.status(200).json({
        message: "Order placed successfully!",
      });
    }
  }

  async verifyTransaction(req: AuthRequest, res: Response): Promise<void> {
    const { pidx } = req.body;
    if (!pidx) {
      res.status(400).json({
        message: "Please provide pidx",
      });
      return;
    }
    const response = await axios.post(
      "https://dev.khalti.com/api/v2/epayment/lookup/",
      { pidx: pidx },
      {
        headers: {
          Authorization: "key  6968a254b4924721ab8e7aebd8579e71",
        },
      }
    );
    const data: TransactionVerificationResponse = response.data;
    if (data.status === TransactionStatus.Completed) {
      await Payment.update(
        { paymentStatus: "paid" },
        {
          where: {
            pidx: pidx,
          },
        }
      );
      res.status(200).json({
        message: "Payment verified successfully!",
      });
    } else {
      res.status(200).json({
        message: "Payment not verified!",
      });
    }
  }
  // Customer side starts here
  async fetchMyOrders(req: AuthRequest, res: Response): Promise<void> {
    const userId = req.user?.id;
    const orders = await Order.findAll({
      where: {
        userId,
      },
      include: [
        {
          model: Payment,
        },
      ],
    });
    if (orders.length > 0) {
      res.status(200).json({
        message: "Orders fetched successfully!",
        data: orders,
      });
    } else {
      res.status(404).json({
        message: "You haven't ordered anything yet!",
        data: [],
      });
    }
  }

  async fetchOrderDetails(req: AuthRequest, res: Response): Promise<void> {
    const { orderId } = req.params;

    const orderDetails = await OrderDetail.findAll({
      where: {
        orderId,
      },
      include: [
        {
          model: Product,
        },
      ],
    });
    if (orderDetails.length > 0) {
      res.status(200).json({
        message: "orderDetails fetched successfully!",
        data: orderDetails,
      });
    } else {
      res.status(404).json({
        message: "No orderDetails found for that product",
        data: [],
      });
    }
  }

  async cancelMyOrder(req: AuthRequest, res: Response): Promise<void> {
    const userId = req.user?.id;
    const { orderId } = req.params;

    const cancelOrder: any = await Order.findAll({
      where: {
        userId,
        id: orderId,
      },
    });
    if (
      cancelOrder?.orderStatus === OrderStatus.OnTheWay ||
      cancelOrder?.orderStatus === OrderStatus.Packaging
    ) {
      res.status(400).json({
        message:
          "You cannot cancel order when the product is ontheway or while packaging!",
      });
      return;
    }
    await Order.update(
      { orderStatus: OrderStatus.Cancelled },
      {
        where: {
          orderId,
        },
      }
    );
    res.status(200).json({
      message: "Order cancelled successfully!",
    });
  }
  //Customer side ends here
}

export default new OrderController();

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
import { Request, Response } from "express";
import Product from "../database/models/productModel";

class ExtendedOrder extends Order {
  declare paymentId: string | null;
}
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
    const orderId = req.params.id;

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
    const orderId = req.params.id;

    const order: any = await Order.findAll({
      where: {
        userId,
        id: orderId,
      },
    });
    if (
      order?.orderStatus === OrderStatus.OnTheWay ||
      order?.orderStatus === OrderStatus.Packaging
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
          id: orderId,
        },
      }
    );
    res.status(200).json({
      message: "Order cancelled successfully!",
    });
  }
  //Customer side ends here

  //admin side starts here
  async changeOrderStatus(req: Request, res: Response): Promise<void> {
    const orderId = req.params.id;
    const orderStatus = req.body.orderStatus;
    if (!orderStatus) {
      res.status(404).json({
        message: "Please provide orderStatus",
      });
    }
    await Order.update(
      { orderStatus: orderStatus },
      {
        where: {
          id: orderId,
        },
      }
    );
    res.status(200).json({
      message: "Order Status changed successfully!",
    });
  }

  async changePaymentStatus(req: Request, res: Response): Promise<void> {
    const orderId = req.params.id;
    const paymentStatus = req.body.paymentStatus;
    const order = await Order.findByPk(orderId);
    const extendedOrder: ExtendedOrder = order as ExtendedOrder;
    await Payment.update(
      { paymentStatus: paymentStatus },
      {
        where: {
          id: extendedOrder.paymentId,
        },
      }
    );
    res.status(200).json({
      message: `Payment status of orderId ${orderId} updated to ${paymentStatus} successfully!`,
    });
  }

  async deleteOrder(req: Request, res: Response): Promise<void> {
    const orderId = req.params.id;
    const order = await Order.findByPk(orderId);
    const extendedOrder: ExtendedOrder = order as ExtendedOrder;
    if (order) {
      await OrderDetail.destroy({
        where: {
          orderId: orderId,
        },
      });

      await Payment.destroy({
        where: {
          id: extendedOrder.paymentId,
        },
      });

      await Order.destroy({
        where: {
          id: orderId,
        },
      });

      res.status(200).json({
        message: "Order deleted successfully!",
      });
    } else {
      res.status(404).json({
        message: "No orders with that orderId",
      });
    }
  }
}

export default new OrderController();

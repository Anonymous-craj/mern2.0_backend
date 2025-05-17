export interface OrderData {
  shippingAddress: string;
  phoneNumber: string;
  totalAmount: number;
  paymentDetails: {
    paymentMethod: PaymentMethod;
    paymentStatus?: PaymentStatus;
    pidx?: string;
  };
  items: OrderDetails[];
}

interface OrderDetails {
  quantity: number;
  productId: string;
}

export enum PaymentMethod {
  Cod = "cod",
  Khalti = "khalti",
}

enum PaymentStatus {
  Unpaid = "unpaid",
  Paid = "paid",
}

export interface KhaltiResponse {
  pidx: string;
  payment_url: string;
  expires_at: Date | string;
  expires_in: number;
}

export interface TransactionVerificationResponse {
  pidx: string;
  total_amount: number;
  status: TransactionStatus;
  transaction_id: string;
  fee: number;
  refunded: boolean;
}

export enum TransactionStatus {
  Completed = "Completed",
  Pending = "Pending",
  Initiated = "Initiated",
  Refunded = "Refunded",
  Expired = "Expired",
  Canceled = "User canceled",
}

export enum OrderStatus {
  Pending = "pending",
  Delivered = "delivered",
  Cancelled = "cancelled",
  OnTheWay = "ontheway",
  Packaging = "packaging",
}

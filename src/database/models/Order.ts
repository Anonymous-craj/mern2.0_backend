import { Table, Column, Model, DataType } from "sequelize-typescript";

@Table({
  tableName: "orders",
  modelName: "Order",
  timestamps: true,
})
class Order extends Model {
  @Column({
    primaryKey: true,
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
  })
  declare id: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare shippingAddress: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare phoneNumber: number;

  @Column({
    type: DataType.FLOAT,
    allowNull: false,
  })
  declare totalAmount: number;

  @Column({
    type: DataType.ENUM(
      "pending",
      "delivered",
      "cancelled",
      "ontheway",
      "packaging"
    ),
    defaultValue: "pending",
  })
  declare orderStatus: string;
}

export default Order;

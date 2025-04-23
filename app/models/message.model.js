import { DataTypes, Sequelize } from "sequelize";
import { sequelize } from "../data/client.js";

export class Message extends Sequelize.Model {}
Message.init(
  {
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "message",
  }
);

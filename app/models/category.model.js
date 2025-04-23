import { DataTypes, Sequelize } from "sequelize";
import { sequelize } from "../data/client.js";

export class Category extends Sequelize.Model {}
Category.init(
  {
    name: {
      type: DataTypes.TEXT,
      unique: true,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "category",
  }
);

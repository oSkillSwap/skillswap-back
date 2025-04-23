import { DataTypes, Sequelize } from "sequelize";
import { sequelize } from "../data/client.js";

export class Post extends Sequelize.Model {}
Post.init(
  {
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    title: DataTypes.TEXT,
    allowNull: false,
  },
  {
    sequelize,
    tableName: "post",
  }
);

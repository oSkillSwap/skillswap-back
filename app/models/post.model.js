import { DataTypes, Sequelize } from "sequelize";
import { sequelize } from "../data/client.js";

export class Post extends Sequelize.Model {}
Post.init(
  {
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    title: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    isClosed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      default: false,
    },
  },
  {
    sequelize,
    tableName: "post",
  }
);

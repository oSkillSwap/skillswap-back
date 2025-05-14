import { DataTypes, Sequelize } from "sequelize";
import { sequelize } from "../data/client.js";

export class Review extends Sequelize.Model {}
Review.init(
  {
    title: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    grade: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
    },
    reviewed_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "user",
        key: "id",
      },
      onDelete: "SET NULL",
    },
  },
  {
    sequelize,
    tableName: "review",
  },
);

import { DataTypes, Sequelize } from "sequelize";
import { sequelize } from "../data/client.js";

export class User extends Sequelize.Model {}
User.init(
  {
    username: {
      type: DataTypes.TEXT,
      unique: true,
      allowNull: false,
    },
    lastName: {
      type: DataTypes.TEXT,
    },
    firstName: {
      type: DataTypes.TEXT,
    },
    email: {
      type: DataTypes.TEXT,
      allowNull: false,
      unique: true,
    },
    role: {
      type: DataTypes.ENUM("admin", "member"),
      allowNull: false,
      defaultValue: "member",
    },
    isBanned: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    password: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    isAvailable: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    description: {
      type: DataTypes.TEXT,
    },
    avatar: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    reset_token: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    reset_token_expires: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "user",
  },
);

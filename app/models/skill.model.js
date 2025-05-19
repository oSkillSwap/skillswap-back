import { DataTypes, Sequelize } from "sequelize";
import { sequelize } from "../data/client.js";

export class Skill extends Sequelize.Model {}
Skill.init(
  {
    name: {
      type: DataTypes.TEXT,
      unique: true,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "skill",
  }
);

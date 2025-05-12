import { DataTypes, Sequelize } from "sequelize";
import { sequelize } from "../data/client.js";

export class Proposition extends Sequelize.Model {}
Proposition.init(
  {
    content: {
      type: DataTypes.TEXT,
    },
    state: {
      type: DataTypes.ENUM("en attente", "acceptée", "refusée"),
    },
    isFinishedBySender: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    isFinishedByReceiver: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    sequelize,
    tableName: "proposition",
  },
);

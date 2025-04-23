import { DataTypes, Sequelize } from "sequelize";
import { sequelize } from "../data/client.js";

export class Availability extends Sequelize.Model {}
Availability.init(
  {
    day_of_the_week: {
      type: DataTypes.ENUM(
        "Lundi",
        "Mardi",
        "Mercredi",
        "Jeudi",
        "Vendredi",
        "Samedi",
        "Dimanche"
      ),
      allowNull: false,
    },
    time_slot: {
      type: DataTypes.ENUM("matin", "midi", "après-midi", "soir"),
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "availability",
  }
);

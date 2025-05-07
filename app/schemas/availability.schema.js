import { z } from "zod";

const validDays = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];

const validSlots = ["matin", "midi", "après-midi", "soir"];

export const updateAvailabilitiesSchema = z.array(
  z.object({
    day_of_the_week: z.enum(validDays),
    time_slot: z.enum(validSlots),
  }),
);

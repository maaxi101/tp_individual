import { z } from "zod";
import { idPositivo } from "./comunes.js";

export const FavoritoSchema = z.strictObject({
  eventoId: idPositivo,
});

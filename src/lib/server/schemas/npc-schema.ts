import { z } from "zod";

export const npcSchema = z.object({
  npcLevel: z.number().min(0).max(100).describe("Number % from 0 (Main Character) to 100 (Extreme NPC)"),
  explanation: z.string().describe("Detailed explanation of the NPC level assessed"),
});

export type NpcSchema = z.infer<typeof npcSchema>;

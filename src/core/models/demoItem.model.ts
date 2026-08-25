import * as z from "zod";

export const demoItem = z.object({
  itemId: z.uuid(),
  action: z.union([z.literal("click"), z.literal("view"), z.literal("scroll")]),
  details: z.string().optional()
});

export const demoItems = z.array(demoItem);

export type DemoItem = z.infer<typeof demoItem>;

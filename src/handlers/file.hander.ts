import { log } from "../middleware/log.middleware";
import { cascade } from "../utils/middleware";
import { fileMiddleware } from "../middleware/file.middleware";

export const fileHandler = cascade(
  log(console.log),
  fileMiddleware
)
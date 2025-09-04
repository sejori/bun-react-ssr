import { log } from "../../_common/middleware/log.middleware";
import { cascade } from "../../_common/utils/middleware";
import { fileMiddleware } from "../middleware/file.middleware";

export const fileHandler = cascade(
    log(console.log),
    fileMiddleware
  )
import { cascade } from "../../_common/utils/middleware";
import { log } from "../../_common/middleware/log.middleware";
import { reactHandler } from "../../_common/handlers/react.handler";
import Home from "../../../client/home/Home.page";

export const homeHandler = cascade(
  log(console.log),
  reactHandler(Home, {
    message: "Hello world"
  })
);
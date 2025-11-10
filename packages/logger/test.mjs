import { logger, createLogger } from "./index.mjs?foobar";

logger("This is the Props.to logger package %O", { hello: "welcome" });

const customLogger = createLogger("test");
customLogger("Custom logger still works %O", { ok: true });

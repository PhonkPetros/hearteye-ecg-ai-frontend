import log from "loglevel";

const isDev = process.env.NODE_ENV === "development";

const LOG_LEVEL =
  (process.env.REACT_APP_LOG_LEVEL as log.LogLevelDesc) ||
  (isDev ? "debug" : "info");

log.setLevel(LOG_LEVEL);

export default log;

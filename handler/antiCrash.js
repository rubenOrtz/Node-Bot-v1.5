const Logger = require("../utils/console");
module.exports = client => {
    process.on('unhandledRejection', (reason, p) => {
        Logger.warn(' [antiCrash] :: Unhandled Rejection/Catch');
        Logger.error(reason, p);
    });
    process.on("uncaughtException", (err, origin) => {
        Logger.warn(' [antiCrash] :: Uncaught Exception/Catch');
        Logger.error(err, origin);
    })
    process.on('uncaughtExceptionMonitor', (err, origin) => {
        Logger.warn(' [antiCrash] :: Uncaught Exception/Catch (MONITOR)');
        Logger.error(err, origin);
    });
    process.on('multipleResolves', (type, promise, reason) => {
        Logger.warn(' [antiCrash] :: Multiple Resolves');
        Logger.error(reason);
    });
}

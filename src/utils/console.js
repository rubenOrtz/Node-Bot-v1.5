const colors = require('colors');

colors.setTheme({
    silly: 'rainbow',
    log: 'grey',
    verbose: 'cyan',
    penis: 'america',
    prompt: 'grey',
    info: 'green',
    data: 'grey',
    help: 'cyan',
    warn: 'yellow',
    debug: 'cyan',
    error: 'red'
});
const log = require('fancy-log');

/**
 *
 *
 * @class Logger
 */
class Logger {
    constructor() {

    }

    /**
     *
     *
     * @param {any} source
     * @param {any} msg
     * @memberof Logger
     */
    log(msg) {
        // @ts-ignore
        let message = colors.log(msg)
        log(`Node | ${message}`);
    }

    /**
     *
     *
     * @param {any} source
     * @param {any} msg
     * @memberof Logger
     */
    info(msg) {
        // @ts-ignore
        let message = colors.info(msg)
        log(`Node | ${message}`);
    }

    /**
     *
     *
     * @param {any} source
     * @param {any} msg
     * @memberof Logger
     */
    warn(msg) {
        // @ts-ignore
        let message = colors.warn(msg)
        log(`Node | ${message}`);
    }

    /**
     *
     *
     * @param {any} source
     * @param {any} msg
     * @memberof Logger
     */
    error(msg) {
        // @ts-ignore
        let message = colors.error(msg)
        log(`Node | ${message}`);
    }

    /**
     *
     *
     * @param {any} source
     * @param {any} msg
     * @memberof Logger
     */
    data(msg) {
        // @ts-ignore
        let message = colors.data(msg)
        log(`Node | ${message}`);
    }

    /**
     *
     *
     * @param {any} source
     * @param {any} msg
     * @memberof Logger
     */
    debug(msg) {
        // @ts-ignore
        let message = colors.debug(msg)
        log(`Node | ${message}`);
    }
    /**
     *
     *
     * @param {any} source
     * @param {any} msg
     * @memberof Logger
     */
    silly(msg) {
        // @ts-ignore
        let message = colors.silly(msg)
        log(`Node | ${message}`);
    }
    /**
     *
     *
     * @param {any} source
     * @param {any} msg
     * @memberof Logger
     */
    penis(msg) {
        // @ts-ignore
        let message = colors.penis(msg)
        log(`Node | ${message}`);
    }
}

module.exports = new Logger();
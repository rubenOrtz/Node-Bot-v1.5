require("dotenv").config();
const {
    glob
} = require("glob");
const {
    promisify
} = require("util");

const globPromise = promisify(glob);
const Logger = require('../utils/console');
const {
    connect
} = require("mongoose");

module.exports = async (client) => {
    const slashCommands = await globPromise(
        `${process.cwd()}/slash/commands/*/*.js`
    );

    const arrayOfSlashCommands = [];
    const unpublishCommands = [];

    slashCommands.map((value) => {
        const file = require(value);
        if (!file?.name) return;

        let command = new file(client);

        client.commands.set(file.name.toLowerCase(), command);

        if (file.permissions) file.defaultPermission = false;

        arrayOfSlashCommands.push(command);
    });

    client.on("ready", async () => {
        // const guild = client.guilds.cache.get('862635336165097483');

        /* Registrar los slash commands globalmente*/
        // await client.application.commands.set(arrayOfSlashCommands);

        /* Registrar los slash commands en el servidor privado*/
        // guild.commands.set(arrayOfSlashCommands);
        // client.commands.forEach((command) => {
        //     const { SlashCommandBuilder } = require('@discordjs/builders');

        //     const command2 = new SlashCommandBuilder()
        //     .setName(command.name)
        //     .setDescription(command.description)

        //  })
        // await guild.commands.set(arrayOfSlashCommands).then((cmd) => {
        //     const getRoles = (commandName) => {
        //         const permissions = arrayOfSlashCommands.find((x) => x.name === commandName).permissions;

        //         if (!permissions) return null;
        //         return guild.roles.cache.filter((x) => x.permissions.has(permissions) && !x.managed);
        //     };

        //     const fullPermissions = cmd.reduce((accumulator, x) => {
        //         const roles = getRoles(x.name);
        //         if (!roles) return accumulator;

        //         const permissions = roles.reduce((a, v) => {
        //             return [
        //                 ...a,
        //                 {
        //                     id: v.id,
        //                     type: "ROLE",
        //                     permission: true
        //                 },
        //             ];
        //         }, [])

        //         return [
        //             ...accumulator,
        //             {
        //                 id: x.id,
        //                 permissions,
        //             },
        //         ];
        //     }, []);

        //     guild.commands.permissions.set({
        //         fullPermissions
        //     });
        // });
    });

    const selectMenus = await globPromise(
        `${process.cwd()}/slash/selectMenus/*.js`
    );

    selectMenus.map((value) => {
        const file = require(value);
        if (!file?.name) return;
        client.selectMenu.set(file.name, file);
    });
    const buttons = await globPromise(
        `${process.cwd()}/slash/buttons/*/*.js`
    );

    buttons.map((value) => {
        const file = require(value);
        if (!file?.name) return;
        client.buttons.set(file.name, file);
    });
}

connect(process.env.mongoURL, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
}).then(Logger.debug('Se ha conectado la base de datos correctamente.'));
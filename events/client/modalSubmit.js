const { MessageEmbed } = require("discord.js");
const client = require("../../bot");
const reportModel = require("../../models/report");
const channel = "890300743104462919";
let responses = 3;

client.on("modalSubmit", async (modal) => {
  if (modal.customId === "bug-report") {
    let response = []
    let user = await reportModel.findOne({ userID: modal.user.id });
    if (!user) {
      user = new reportModel({
        userID: modal.user.id,
        reports: [],
      });

      await user.save();
    }

    const description = modal.getTextInputValue("bug-description");
    const happen = modal.getTextInputValue("bug-happen");
    const expected = modal.getTextInputValue("bug-expected");

    response.push(description);
    response.push(happen);
    response.push(expected);

    user.reports.push({
      description,
      happen,
      expected,
      created_at: Date.now(),
    });

    await user.save();

    const embed = new MessageEmbed()
      .setTitle("Bug report")
      .setDescription(`Bug reportado con exito.`)
      .setColor("#00ff00");

    client.shard.broadcastEval(
      (c, { id, response, responses }) => {
        const { Formatters } = require("discord.js");

        const channel = c.channels.cache.get(id);
        if (!channel) return;

        for (let i = 0; i < responses; i++) {
          channel.send({
            content: Formatters.codeBlock("markdown", response[i]),
          });
        }
      },
      {
        context: {
          id: channel,
          response,
          responses,
        },
      }
    );

    modal.reply({ embeds: [embed] });
  }
});

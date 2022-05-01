module.exports = class Commando {
    constructor(client, opciones) {
      this.client = client;
      this.name = opciones.name;
      this.description = opciones.description;
      this.args = opciones.args || false;
      this.cooldown = opciones.cooldown || false;
      this.options = opciones.options || [];
      this.name_localizations = opciones.name_localizations || null;
      this.description_localizations = opciones.description_localizations || null;
    }
  };
const HomeAssistant = require('../HomeAssistant')
module.exports = function (RED) {
    RED.nodes.registerType('ha-mqtt-device', function (cfg) {
        RED.nodes.createNode(this, cfg);
        let { name, config } = cfg
        name = name.trim()
        if (!name) {
            name = 'Home Assistant'
        }
        config = config ? JSON.parse(config) : {}
        this.device_info = {
            configuration_url: 'https://github.com/RACELAND-Automacao-Lda',
            identifiers: `ha-mqtt-${name}`,
            manufacturer: "Raceland Automação",
            model: 'NR-MQTT',
            sw_version: HomeAssistant.version,
            ...config,
            name
        }
    })
}
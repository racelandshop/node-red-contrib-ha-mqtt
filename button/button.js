const HomeAssistant = require('../HomeAssistant')

module.exports = function (RED) {
    RED.nodes.registerType('ha-mqtt-button', function (cfg) {
        RED.nodes.createNode(this, cfg);
        this.server = RED.nodes.getNode(cfg.server);
        if (this.server) {
            this.server.register(this)
            const deviceNode = RED.nodes.getNode(cfg.device);
            const ha = new HomeAssistant(this, cfg, deviceNode.device_info)
            const { json_attr_t, command_topic, availability_topic } = ha.config
            const node = this
            node.on('input', function (msg) {
                const { attributes, availability } = msg
                try {
                    if (attributes) {
                        ha.publish(json_attr_t, attributes, RED._(`node-red-contrib-ha-mqtt/common:publish.attributes`))
                    }
                    if (availability) {
                        ha.publish(availability_topic, availability, RED._(`node-red-contrib-ha-mqtt/common:publish.availability`))
                    }
                } catch (ex) {
                    node.status({ fill: "red", shape: "ring", text: JSON.stringify(ex) });
                }
            })
            ha.subscribe(command_topic, (payload) => {
                node.send({ payload })
            })
            try {
                ha.discovery({
                    state_topic: null,
                    command_topic,
                    availability_topic,
                }, () => {
                    this.status({ fill: "green", shape: "ring", text: `node-red-contrib-ha-mqtt/common:publish.config` });
                })
            } catch (ex) {
                this.status({ fill: "red", shape: "ring", text: `${ex}` });
            }
        } else {
            this.status({ fill: "red", shape: "ring", text: `node-red-contrib-ha-mqtt/common:errors.mqttNotConfigured` });
        }
    })
}
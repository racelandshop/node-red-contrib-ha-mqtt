const HomeAssistant = require('../HomeAssistant')

module.exports = function (RED) {
    RED.nodes.registerType('ha-mqtt-sensor', function (cfg) {
        RED.nodes.createNode(this, cfg);
        this.server = RED.nodes.getNode(cfg.server);
        if (this.server) {
            this.server.register(this)
            const deviceNode = RED.nodes.getNode(cfg.device);
            const ha = new HomeAssistant(this, cfg, deviceNode.device_info)
            const node = this
            const { availability_topic } = ha.config
            node.on('input', function (msg) {
                const { payload, attributes, availability } = msg
                try {
                    if (!ha.isEmpty(payload)) {
                        ha.publish(ha.config.state_topic, payload, RED._(`node-red-contrib-ha-mqtt/common:publish.state`))
                    }
                    if (availability) {
                        ha.publish(availability_topic, availability, RED._(`node-red-contrib-ha-mqtt/common:publish.availability`))
                    }
                    if (attributes) {
                        ha.publish(ha.config.json_attr_t, attributes, RED._(`node-red-contrib-ha-mqtt/common:publish.attributes`))
                    }
                } catch (ex) {
                    node.status({ fill: "red", shape: "ring", text: JSON.stringify(ex) });
                }
            })

            try {
                const discoveryConfig = {
                    unit_of_measurement: cfg.unit_of_measurement,
                    availability_topic
                }
                ha.discovery(discoveryConfig, () => {
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
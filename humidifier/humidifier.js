const HomeAssistant = require('../HomeAssistant')

module.exports = function (RED) {
    RED.nodes.registerType('ha-mqtt-humidifier', function (cfg) {
        RED.nodes.createNode(this, cfg);
        this.server = RED.nodes.getNode(cfg.server);
        if (this.server) {
            this.server.register(this)
            const deviceNode = RED.nodes.getNode(cfg.device);
            const ha = new HomeAssistant(this, cfg, deviceNode.device_info)
            const node = this
            const { command_topic, target_humidity_command_topic, target_humidity_state_topic,
                mode_state_topic, mode_command_topic, availability_topic } = ha.config
            node.on('input', function (msg) {
                const { payload, attributes, mode, target_humidity, availability } = msg
                try {
                    if (payload) {
                        ha.publish(ha.config.state_topic, payload, RED._(`node-red-contrib-ha-mqtt/common:publish.state`))
                    }
                    if (availability) {
                        ha.publish(availability_topic, availability, RED._(`node-red-contrib-ha-mqtt/common:publish.availability`))
                    }
                    if (attributes) {
                        ha.publish(ha.config.json_attr_t, attributes, RED._(`node-red-contrib-ha-mqtt/common:publish.attributes`))
                    }
                    if (mode) {
                        ha.publish(ha.config.mode_state_topic, mode, RED._(`node-red-contrib-ha-mqtt/common:publish.mode`))
                    }
                    if (target_humidity) {
                        ha.publish(ha.config.target_humidity_state_topic, target_humidity, RED._(`node-red-contrib-ha-mqtt/common:publish.target_humidity`))
                    }
                } catch (ex) {
                    node.status({ fill: "red", shape: "ring", text: ex });
                }
            })
            ha.subscribe(command_topic, (payload) => {
                ha.send_payload(payload, 1, 3)
                ha.publish(ha.config.state_topic, payload, RED._(`node-red-contrib-ha-mqtt/common:publish.state`))
            })
            ha.subscribe(target_humidity_command_topic, (payload) => {
                ha.send_payload(payload, 2, 3)
                ha.publish(ha.config.target_humidity_state_topic, payload, RED._(`node-red-contrib-ha-mqtt/common:publish.target_humidity`))
            })
            ha.subscribe(mode_command_topic, (payload) => {
                ha.send_payload(payload, 3, 3)
                ha.publish(ha.config.mode_state_topic, payload, RED._(`node-red-contrib-ha-mqtt/common:publish.mode`))
            })

            try {
                const discoveryConfig = {
                    availability_topic,
                    command_topic,
                    target_humidity_command_topic,
                    target_humidity_state_topic,
                    mode_state_topic,
                    mode_command_topic,
                    device_class: "humidifier",
                    modes: ["normal", "eco", "away", "boost", "comfort", "home", "sleep", "auto", "baby"],
                    min_humidity: 30,
                    max_humidity: 80
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
export default {

    name: "mouse-manager",
    requires: [],

    load() {
        const MouseManager = require("./src/mouse-manager.js").default; // eslint-disable-line global-require
        return MouseManager;
    },

    unload() {},
    config: {
        // Minimum distance for triggering a drag-start, and maximum distance
        // to consider a mouse down/up as a click.
        threshold: 5,
    },

};

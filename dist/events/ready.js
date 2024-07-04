"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.data = void 0;
exports.data = {
    name: 'ready',
    once: true,
    execute(client) {
        var _a;
        console.log(`Ready! Logged in as ${(_a = client.user) === null || _a === void 0 ? void 0 : _a.tag}`);
    },
};
//# sourceMappingURL=ready.js.map
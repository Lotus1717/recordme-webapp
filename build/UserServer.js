"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DBServer_1 = require("./DBServer");
async function login(params) {
    return DBServer_1.queryUser(params);
}
exports.login = login;
async function signup(params) {
    return DBServer_1.insertUser(params);
}
exports.signup = signup;
//# sourceMappingURL=../src/build/UserServer.js.map
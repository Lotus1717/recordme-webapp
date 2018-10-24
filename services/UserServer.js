let DBServer = require('./DBServer').DBServer

const login = (params) => {
  console.log('调用UserService login方法')
  return DBServer.queryUser(params)
}

exports.UserServer = {
  login
}
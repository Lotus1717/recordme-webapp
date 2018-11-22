let DBServer = require('./DBServer').DBServer

/** 
 * 登录
 * @param [object] params 
 * @return promise
 */
const login = (params) => {
  console.log('调用UserService login方法')
  return DBServer.queryUser(params)
}


/** 
 * 注册
 * @param [object] params 
 * @return promise
 */
const signup = (params) => {
  console.log('调用UserService sign方法')
  return DBServer.insertUser(params)
}

exports.UserServer = {
  login,
  signup
}
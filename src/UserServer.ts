/// <reference path="interface-dictionary.ts" />
import {queryUser, insertUser} from './DBServer'

/** 
 * 登录
 */
export async function login (params: DuckTypes.QUserVal) {
  return queryUser(params)
}


/** 
 * 注册
 */
export async function signup (params: DuckTypes.QUserVal) {
  return insertUser(params)
}

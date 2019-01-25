/// <reference path="interface-dictionary.ts" />
let mysql = require('mysql')

// 创建数据库连接池
let pool = mysql.createPool({
  //主机
  host: '127.0.0.1',
  // host: '148.70.2.7',
  //用户
  user: 'root',
  //密码
  password: '80808080',
  // password: '8080!Qtm',
  //端口
  port: 3306,
  //数据库名
  database: 'recordme',
  //最大连接数
  connectionLimit: 100,
  // 允许执行多条sql语句
  multipleStatements: true
})

// // 封装数据库connect方法
// let connect = () => {
//   db.connect(err => {
//     if(err){
//       console.log(err)
//     } else {
//       console.log('connect succeed')
//     } 
//   })
// }

// // 封装数据库end方法
// let close = () => {
//   db.end(err => {
//     if(err){
//       console.log(err)
//     } else {
//       console.log('db end')
//     } 
//   })
// }

/** 
 * 封装数据库query方法
 * @param sql sql语句
 * @param todos 待处理的数据库字段内容
 */
const query = (sql: string, todos?: Array<any>): Promise<DuckTypes.QReturnVal> => {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      connection.query(sql, todos, (error, results) => {
        if (error) {
          let param = {
            result: false,
            error: error
          }
          reject(param)
        } else {
          let param = {
            result: true,
            data: JSON.parse(JSON.stringify(results)) //去掉打印出的RowDataPacket
          }
          resolve(param)
        }
      })
      connection.release()
    })
  })
}

/**
 * 插入文本记录 
 */
export async function insertRecord (params: DuckTypes.IRecordVal) {
  let sql = `insert into record(record_name, record_url, user_id) values(?, ?, ?)`
  let todo = [params.data.title, params.data.url, params.userId]
  try {
    let res = await query(sql, todo) // await遇到rejected，会被catch捕捉，进入下一轮循环，所以下面的res.result一定为true。catch用来开发时捕捉异常，不建议把正常操作放到里面
    let param: DuckTypes.IRecordReturnVal = {
      result: false,
      msg: '文本记录保存失败'
    }
    if (res.result) {
      if (res.data.insertId >= 0) {
        param = {
          result: true,
          data: {
            recordId: res.data.insertId
          },
          msg: '文本记录保存成功'
        }
      }
    }
    return param
  } catch (err) {
    console.log(err)
  }
}

/**
 * 查询一条文本记录 
 */
export async function queryRecord (params: DuckTypes.QRecordVal) {
  let sql = `select * from record where user_id = ${params.userId} and record_name = '${params.recordName}'`
  try {
    let res = await query(sql)
    let param: DuckTypes.QRecordReturnVal = {
      result: false,
      msg: '查询记录失败'
    }
    if (res.result) {
      let data = res.data
      if (data.length > 0) {
        param = {
          result: true,
          data: {
            recordId: data[0]['record_id'],
            recordName: data[0]['record_name'],
            recordUrl: data[0]['record_url']
          },
          msg: '查询记录成功'
        }
      }
    }
    return param
  } catch (err) {
    console.log(err)
  }
}

/**
 * 插入多行标注
 */
export async function insertMultiMark (params: DuckTypes.IMarksVal) {
  let todos = []
  params.markList.forEach(val => {
    todos.push([val.markText, params.recordId])
  })
  let sql = `insert into mark(mark_text, record_id) values ?`
  try {
    let res = await query(sql, [todos])
    let param = {
      result: false,
      msg: '文本标注保存失败'
    }
    if (res.result) {
      let data = res.data
      if (data.affectedRows === params.markList.length) {
        param = {
          result: true,  
          msg: '所有文本标注保存成功'
        }
      }
    }
    return param
  } catch (err) {
    console.log(err)
  }
}

/**
 * 插入新标签(如果存在相同的user_id和tag_name（联合主键），则不插入)
 */
export async function insertNewTags (params: DuckTypes.ITagsVal){
  let todos = []
  params.tags.forEach(val => {
    todos.push([val, params.userId])
  })
  let sql = `insert ignore into tag(tag_name, user_id) values ?`
  try {
    let res = await query(sql, [todos])
    let param:DuckTypes.ITagsReturnVal = {
      result: false,
      msg: '插入新标签失败'
    }
    if (res.result) {
      let data = res.data
      if (data.affectedRows > 0) {
        let tagIds = []
        for (let i = 0; i < data.affectedRows; i++) {
          tagIds.push(data.insertId + i)
        }
        param = {
          result: true,
          data: tagIds,
          msg: '插入新标签成功'
        }
      }
    }
    return param
  } catch (err) {
    console.log(err)
  }
}

/**
 * 插入记录标签
 */
export async function insertRecordTags (params: DuckTypes.IRTagsVal) {
  let todos = []
  params.tagIds.forEach(val => {
    todos.push([params.recordId, val])
  })
  let sql = `insert into record_tag(record_id, tag_id) values ?`
  try {
    let res = await query(sql, [todos])
    let param = {
      result: false,
      msg: '插入记录标签失败'
    }
    if (res.result) {
      let data = res.data
      if (data.affectedRows > 0) {
        param = {
          result: true, 
          msg: '插入记录标签成功'
        }
      }
    }
    return param
  } catch (err) {
    console.log(err)
  }
}

/**
 * 删除标注
 */
export async function deleteOneMark (params: DuckTypes.DMarkVal) {
  let sql = `delete from mark where mark_id = ${params.markId}`
  try {
    let res = await query(sql)
    let param = {
      result: false,
      msg: '删除标注失败'
    }
    if (res.result) {
      let data = res.data
      if (data.affectedRows > 0) {
        param = {
          result: true, 
          msg: '删除标注成功'
        }
      }
    }
    return param
  } catch (err) {
    console.log(err)
  }
}

/**
 * 删除记录 
 */
export async function deleteOneRecord (params: DuckTypes.DRecordVal) {
  let sql = `delete from record where record_id = ${params.recordId} and user_id = ${params.userId}`
  try {
    let res = await query(sql)
    let param = {
      result: false,
      msg: '删除记录失败'
    }
    if (res.result) {
      let data = res.data
      if (data.affectedRows > 0) {
        param = {
          result: true,  
          msg: '删除记录成功'
        }
      }
    }
    return param
  } catch (err) {
    console.log(err)
  }
}

/**
 * 删除记录标签关系
 */
export async function deleteRecordTags (params: DuckTypes.recordId) {
  let sql = `delete from record_tag where record_id = ${params.recordId}`
  try {
    let res = await query(sql)
    let param = {
      result: false,
      msg: '删除记录标签失败'
    }
    if (res.result) {
      let data = res.data
      if (data.affectedRows > 0) {
        param = {
          result: true, 
          msg: '删除记录标签成功'
        }
      }
    }
    return param
  } catch (err) {
    console.log(err)
  }
}

/**
 * 查询标签
 */
export async function queryTags (params: DuckTypes.QTagsVal) {
  let sql = ''
  params.tags.forEach(val => {
    sql += `select * from tag where tag_name = '${val}' and user_id = ${params.userId};`
  })
  try {
    let res = await query(sql)
    let param: DuckTypes.QTagsReturnVal = {
      result: false,
      msg: '查询标签失败'
    }  
    if (res.result) {
      let tagArr = []
      res.data.forEach((val: Array<object> | object) => {
        if (val instanceof Array) {         
          val.forEach(item => {
            tagArr.push({
              tagId: item['tag_id'],
              tagName: item['tag_name'],
              userId: item['user_id']
            })
          })
        } else {
          tagArr.push({
            tagId: val['tag_id'],
            tagName: val['tag_name'],
            userId: val['user_id']
          })
        }
      })
      param = {
        result: true,
        data: tagArr,
        msg: '查询标签成功'
      }
    }
    return param
  } catch (err) {
    console.log(err)
  }
}

/**
 * 查询记录标签
 */
export async function queryRecordTags (params: DuckTypes.QRTagsVal) {
  let sqls = ''
  params.recordIds.forEach(val => {
    sqls += `select * from tag t right join record_tag rt on t.tag_id = rt.tag_id where rt.record_id = ${val};`
  })
  try {
    let res = await query(sqls)
    let param: DuckTypes.QRTagsReturnVal = {
      result: false,
      msg: '查询记录标签失败'
    }
    if (res.result) {
      let allTags = []
      let tagArr = []
      res.data.forEach((val: Array<object> | object) => {
        let arr = []
        if(val instanceof Array){
          val.forEach(item => {
            arr.push({
              tagId: item['tag_id'],
              tagName: item['tag_name']
            })
          })
          allTags.push(arr)
        } else {
          tagArr.push({
            tagId: val['tag_id'],
            tagName: val['tag_name']
          })
        }     
      })
      if(tagArr.length > 0){
        allTags.push(tagArr)
      }
      param = {
        result: true,
        data: allTags,
        msg: '查询记录标签成功'
      }
    }
    return param
  } catch (err) {
    console.log(err)
  }
}

export async function queryUserRecords (params: DuckTypes.userVal) {
  let sql = `select * from record r right join mark m on m.record_id = r.record_id where r.user_id = ${params.userId};`
  try {
    let res = await query(sql)
    let param: DuckTypes.QUserRecordsReturnVal = {
      result: false,
      msg: '查询用户的所有记录失败'
    }
    if (res.result) {
      let arr = []
      res.data.forEach((val: Object) => {
        arr.push({
          recordId: val['record_id'],
          recordName: val['record_name'],
          recordUrl: val['record_url'],
          markId: val['mark_id'],
          markText: val['mark_text']
        })
      })
      param = {
        result: true,
        data: arr,
        msg: '查询用户的所有记录成功'
      }
    }  
    return param
  } catch (err) {
    console.log(err)
  }
}

/**
 * 查询所有文本记录 
 */ 
export async function queryRecordList (params: DuckTypes.userVal) {
  let sql = `select * from record where user_id = ${params.userId}`
  try {
    let res = await query(sql)
    let param: DuckTypes.QRecordsReturnVal = {
      result: false,
      msg: '查询文本记录失败'
    }
    if (res.result) {
      let data = res.data
      if (data instanceof Array) {
        let arr = []
        data.forEach(val => {
          arr.push({
            recordId: val['record_id'],
            recordName: val['record_name'],
            recordUrl: val['record_url']
          })
        })
        param = {
          result: true,
          data: arr,
          msg: '查询文本记录成功'
        }
      }
    }
    return param
  } catch (err) {
    
  }
}

/**
 * 查询所有文本标注
 */ 
export async function queryMarkList (params: DuckTypes.QRTagsVal) {
  let sql = ''
  params.recordIds.forEach(val => {
    sql += `select * from mark where record_id = ${val};`
  })
  try {
    let res = await query(sql)
    let param: DuckTypes.QMarksReturnVal = {
      result: false,
      msg: '查询文本标注失败'
    }
    if (res.result) {
      let allMarks = []
      let markArr = []
      res.data.forEach((val: Array<object> | object) => {
        if (val instanceof Array) {
          let arr = []
          val.forEach(item => {
            arr.push({
              markId: item['mark_id'],
              markText: item['mark_text']
            })
          })
          allMarks.push(arr)
        } else {
          markArr.push({
            markId: val['mark_id'],
            markText: val['mark_text']
          })
        }
      })
      if (markArr.length > 0) {
        allMarks.push(markArr)
      }
      param.data = allMarks
      param = {
        result: true,
        data: allMarks,
        msg: '查询文本标注成功'
      }
    }
    return param
  } catch (err) {
    console.log(err)
  }
}

/** 
 * 查询用户
 * @param [object] params [用户信息] {name: '', password: ''}
 * @return promise
 */
export async function queryUser (params: DuckTypes.QUserVal) {
  let sql = `select * from user where user_name = '${params.name}' and user_password = '${params.password}'`
  try {
    let res = await query(sql)
    let param: DuckTypes.QUserReturnVal = {
      result: false,
      msg: '查询用户失败'
    }
    if (res.result) {
      if (res.data.length > 0) {
        param = {
          result: true,
          data: {
            userId: res.data[0]['user_id']
          },
          msg: '查询用户成功'
        }
      }
    }
    return param
  } catch (err) {
    console.log(err)
  }
}

/** 
 * 插入（新增）用户
 * @param [object] params [用户信息] {name: '', password: ''}
 * @return promise
 */
export async function insertUser (params: DuckTypes.QUserVal) {
  let sql = `insert into user (user_name, user_password) values ('${params.name}', '${params.password}')`
  try {
    let res = await query(sql)
    let param: DuckTypes.QUserReturnVal = {
      result: false,
      msg: '新增用户失败'
    }
    if (res.result) {
      if (res.data.insertId > 0) {
        param = {
          result: true,
          data: {
            userId: res.data.insertId
          },
          msg: '新增用户成功'
        }
      }
    }
    return param
  } catch (err) {
    console.log(err)
  }
}
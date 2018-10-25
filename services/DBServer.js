let mysql = require('mysql')

// 创建数据库连接池
let pool = mysql.createPool({
  //主机
  host: '127.0.0.1',
  //用户
  user: 'root',
  //密码
  password: '80808080',
  //端口
  port: 3306,
  //数据库名
  database: 'recordme',
  //最大连接数
  connectionLimit:100 
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
 * @param [string] sql [sql语句]
 * @param [array] todos [待处理的数据库字段内容]
 */
let query = (sql, todos) => {
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
            data: JSON.parse(JSON.stringify(results))  //去掉打印出的RowDataPacket
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
 * @param [object] params {userId: '', data: {url: '', title: '', recordList: [{marktText: '', record: ''}]}}
 * @return promise
 */
const insertRecord = (params) => {
  let insertRecordSql = `INSERT INTO RECORD(RECORD_NAME, RECORD_URL, USER_ID) VALUES(?, ?, ?)`
  let todo = [params.data.title, params.data.url, params.userId]
  console.log(insertRecordSql)
  return query(insertRecordSql, todo).then(res => {
    console.log(res)
    let param = {
      result: false,
      data: null
    }
    if(res.result){
      if(res.data.insertId > 0){
        param = {
          result: true,
          data: {
            recordId: res.data.insertId
          },
          msg: '插入文本记录成功'
        }
      } else {
        param = {
          result: false,
          data: null,
          msg: '插入文本记录失败'
        }
      }      
    }
    return param
  }).catch(e => {
    console.log(e)
  })
}

/** 
 * 插入多行标注
 * @param [object] params [文本标注信息] {recordId: '', markList: [{marktText: '', record: ''}]}
 * @return promise
 */
const insertMultiMark = (params) => {
  let todos = []
  params.markList.forEach(val => {
    todos.push([val.markText, params.recordId])
  })
  let insertMarkSql = `INSERT INTO MARK(MARK_TEXT, RECORD_ID) VALUES ?`
  console.log(insertMarkSql)
  return query(insertMarkSql, [todos]).then(res => {
    let param = {
      result: false,
      data: null
    }
    if(res.result){ 
      let data = res.data
      if(data.length > 0){
        param = {
          result: true,
          data: null,
          msg: '插入文本标注成功'
        }
      } else {
        param = {
          result: false,
          data: null,
          msg: '插入文本标注失败'
        }
      }     
    }
    return param
  }).catch(e => {
    console.log(e)
  })
}

/** 
 * 删除文本记录 
 * @param [object] params {recordId: ''}
 * @return promise
 */
const deleteRecord = (params) => {
  let sql = `DELETE FROM RECORD WHERE RECORD_ID = ${params.recordId}`
  console.log(sql)
  return query(sql, null).then(res => {
    let param = {
      result: false,
      data: null
    }
    if(res.result){
      let data = res.data
      if(data.affectedRows > 0){
        param = {
          result: true,
          data: null,
          msg: '删除记录成功'
        }
      } else {
        param.msg = '删除记录失败'
      } 
    }
    return param
  }).catch(e => {
    console.log(e)
  })
}

/** 
 * 删除标注
 * @param [object] params {recordId: ''}
 * @return promise
 */
const deleteMark = (params) => {
  let sql = `DELETE FROM MARK WHERE RECORD_ID = ${params.recordId}`
  console.log(sql)
  return query(sql, null).then(res => {
    let param = {
      result: false,
      data: null
    }
    if(res.result){
      let data = res.data
      if(data.affectedRows > 0){
        param = {
          result: true,
          data: null,
          msg: '删除标注成功'
        }
      } else {
        param.msg = '删除标注失败'
      } 
    }
    return param
  }).catch(e => {
    console.log(e)
  })
}

/** 
 * 查询文本记录 
 * @param [object] params {userId: '', recordName: ''}
 * @return promise
 */
const queryRecord = (params) => {
  let sql = `SELECT * FROM RECORD WHERE USER_ID = ${params.userId} AND RECORD_NAME = '${params.recordName}'`
  console.log(sql)
  return query(sql, null).then(res => {
    let param = {
      result: false,
      data: null
    }
    if(res.result){
      let data = res.data
      if(data.length > 0){
        param = {
          result: true,
          data: {
            recordId: data[0]['record_id'],
            recordName: data[0]['record_name'],
            recordUrl: data[0]['record_url']
          },
          msg: '查询记录成功'
        }
      } else {
        param = {
          result: false,
          data: null,
          msg: '查询记录失败'
        }
      }
    }
    return param
  }).catch(e => {
    console.log(e)
  })
}

/** 
 * 查询用户
 * @param [object] params [用户信息] {name: '', password: ''}
 * @return promise
 */
const queryUser = (params) => {
  let sql = `SELECT * FROM USER WHERE USER_NAME = '${params.name}' AND USER_PASSWORD = '${params.password}'`
  console.log(sql)
  return query(sql, null).then(res => {
    let param = {
      result: false,
      data: null
    }
    if(res.result){
      if(res.data.length > 0){
        param = {
          result: true,
          data: {
            userId: res.data[0]['user_id']
          },
          msg: '查询用户成功'
        }
      } else {
        param = {
          result: false,
          data: null,
          msg: '查询用户失败'
        }
      }     
    }
    return param
  }).catch(e => {
    console.log(e)
  })
}

exports.DBServer = {
  insertRecord,
  insertMultiMark,
  queryRecord,
  queryUser,
  deleteRecord,
  deleteMark
}
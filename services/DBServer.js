let mysql = require('mysql')

// 创建数据库连接池
let pool = mysql.createPool({
  //主机
  // host: '127.0.0.1',
  host: '148.70.2.7',
  //用户
  user: 'root',
  //密码
  // password: '80808080',
  password: '8080!Qtm',
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
 * @param [object] params {userId: '', data: {url: '', title: '', recordList: [{marktText: '', record: ''}]}}
 * @return promise
 */
const insertRecord = (params) => {
  let sql = `insert into record(record_name, record_url, user_id) values(?, ?, ?)`
  let todo = [params.data.title, params.data.url, params.userId]
  console.log(sql)
  return query(sql, todo).then(res => {
    let param = {
      result: false,
      data: null,
      msg: '插入文本记录失败'
    }
    if (res.result) {
      if (res.data.insertId >= 0) {
        param = {
          result: true,
          data: {
            recordId: res.data.insertId
          },
          msg: '插入文本记录成功'
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
  let sql = `insert into mark(mark_text, record_id) values ?`
  console.log(sql)
  return query(sql, [todos]).then(res => {
    let param = {
      result: false,
      data: null,
      msg: '插入文本标注失败'
    }
    if (res.result) {
      let data = res.data
      if (data.affectedRows > 0) {
        param = {
          result: true,
          data: null,
          msg: '插入文本标注成功'
        }
      }
    }
    return param
  }).catch(e => {
    console.log(e)
  })
}

/** 
 * 插入新标签(如果存在相同的user_id和tag_name（联合主键），则不插入)
 * @param [object] params [标签信息] {userId: '', tags: [''...]}
 * @return promise
 */
const insertNewTags = (params) => {
  let todos = []
  params.tags.forEach(val => {
    todos.push([val, params.userId])
  })
  let sql = `insert ignore into tag(tag_name, user_id) values ?`
  return query(sql, [todos]).then(res => {
    let param = {
      result: false,
      data: null,
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
  }).catch(e => {
    console.log(e)
  })
}

/** 
 * 插入记录标签
 * @param [object] params [标签信息] {recordId: '', tagIds: [''...]}
 * @return promise
 */
const insertRecordTags = (params) => {
  let todos = []
  params.tagIds.forEach(val => {
    todos.push([params.recordId, val])
  })
  let sql = `insert into record_tag(record_id, tag_id) values ?`
  console.log(sql)
  return query(sql, [todos]).then(res => {
    let param = {
      result: false,
      data: null,
      msg: '插入记录标签失败'
    }
    if (res.result) {
      let data = res.data
      if (data.affectedRows > 0) {
        param = {
          result: true,
          data: null,
          msg: '插入记录标签成功'
        }
      }
    }
    return param
  }).catch(e => {
    console.log(e)
  })
}

/** 
 * 删除标注
 * @param [object] params {markId: 1}
 * @return promise
 */
const deleteMark = (params) => {
  let sql = `delete from mark where mark_id = ${params.markId}`
  console.log(sql)
  return query(sql, null).then(res => {
    let param = {
      result: false,
      data: null,
      msg: '删除标注失败'
    }
    if (res.result) {
      let data = res.data
      if (data.affectedRows > 0) {
        param = {
          result: true,
          data: null,
          msg: '删除标注成功'
        }
      }
    }
    return param
  }).catch(e => {
    console.log(e)
  })
}

/** 
 * 删除记录
 * @param [object] params {recordId: 1, userId: 1}
 * @return promise
 */
const deleteRecord = (params) => {
  let sql = `delete from record where record_id = ${params.recordId} and user_id = ${params.userId}`
  console.log(sql)
  return query(sql, null).then(res => {
    let param = {
      result: false,
      data: null,
      msg: '删除记录失败'
    }
    if (res.result) {
      let data = res.data
      if (data.affectedRows > 0) {
        param = {
          result: true,
          data: null,
          msg: '删除记录成功'
        }
      }
    }
    return param
  }).catch(e => {
    console.log(e)
  })
}

/** 
 * 删除记录标签关系
 * @param [object] params {recordId: 1}
 * @return promise
 */
const deleteRecordTags = (params) => {
  let sql = `delete from record_tag where record_id = ${params.recordId}`
  console.log(sql)
  return query(sql, null).then(res => {
    let param = {
      result: false,
      data: null,
      msg: '删除记录标签失败'
    }
    if (res.result) {
      let data = res.data
      if (data.affectedRows > 0) {
        param = {
          result: true,
          data: null,
          msg: '删除记录标签成功'
        }
      }
    }
    return param
  }).catch(e => {
    console.log(e)
  })
}

/** 
 * 查询标签
 * @param [object] params {userId: 1, tags: ['', '']}
 * @return promise
 */
const queryTags = (params) => {
  let sql = ''
  params.tags.forEach(val => {
    sql += `select * from tag where tag_name = '${val}' and user_id = ${params.userId};`
  })
  console.log(sql)
  return query(sql, null).then(res => {
    let param = {
      result: false,
      data: null,
      msg: '查询标签失败'
    }
    let tagArr = []
    console.log('查询标签结果：')
    console.log(res.data)
    if (res.result) {
      res.data.forEach(val => {
        if (val.length >= 0) {
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
  }).catch(e => {
    console.log(e)
  })
}

/** 
 * 查询记录标签
 * @param [object] params {recordIds: [1, ...]}
 * @return promise
 */
const queryRecordTags = (params) => {
  console.log(params)
  let sqls = ''
  params.recordIds.forEach(val => {
    sqls += `select * from tag t right join record_tag rt on t.tag_id = rt.tag_id where rt.record_id = ${val};`
  })
  console.log(sqls)
  return query(sqls, null).then(res => {
    let param = {
      result: false,
      data: null,
      msg: '查询记录标签失败'
    }
    if (res.result) {
      let allTags = []
      let tagArr = []
      res.data.forEach(val => {
        let arr = []
        if (val.length >= 0) {
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
  }).catch(e => {
    console.log(e)
  })
}

/** 
 * 查询一条文本记录 
 * @param [object] params {userId: '', recordName: ''}
 * @return promise
 */
const queryRecord = (params) => {
  let sql = `select * from record where user_id = ${params.userId} and record_name = '${params.recordName}'`
  console.log(sql)
  return query(sql, null).then(res => {
    let param = {
      result: false,
      data: null,
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
  }).catch(e => {
    console.log(e)
  })
}

/** 
 * 查询所有文本记录 
 * @param [object] params {userId: ''}
 * @return promise
 */
const queryRecordList = (params) => {
  let sql = `select * from record where user_id = ${params.userId}`
  console.log(sql)
  return query(sql, null).then(res => {
    let param = {
      result: false,
      data: null,
      msg: '查询文本记录失败'
    }
    if (res.result) {
      let data = res.data
      if (data.length >= 0) {
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
  }).catch(e => {
    console.log(e)
  })
}

/** 
 * 查询所有文本标注 
 * @param [object] params {recordIds: [...]}
 * @return promise
 */
const queryMarkList = (params) => {
  let sql = ''
  params.recordIds.forEach(val => {
    sql += `select * from mark where record_id = ${val};`
  })
  console.log(sql)
  return query(sql, null).then(res => {
    let param = {
      result: false,
      data: null,
      msg: '查询文本标注失败'
    }
    if (res.result) {
      let allMarks = []
      let markArr = []
      res.data.forEach(val => {
        if (val.length >= 0) {
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
  let sql = `select * from user where user_name = '${params.name}' and user_password = '${params.password}'`
  console.log(sql)
  return query(sql, null).then(res => {
    let param = {
      result: false,
      data: null,
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
  }).catch(e => {
    console.log(e)
  })
}

/** 
 * 插入（新增）用户
 * @param [object] params [用户信息] {name: '', password: ''}
 * @return promise
 */
const insertUser = (params) => {
  let sql = `insert into user (user_name, user_password) values ('${params.name}', '${params.password}')`
  console.log(sql)
  return query(sql, null).then(res => {
    let param = {
      result: false,
      data: null,
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
  }).catch(e => {
    console.log(e)
  })
}

exports.DBServer = {
  insertRecord,
  insertMultiMark,
  insertNewTags,
  insertRecordTags,
  queryRecord,
  queryUser,
  insertUser,
  deleteRecord,
  deleteMark,
  deleteRecordTags,
  queryRecordList,
  queryMarkList,
  queryTags,
  queryRecordTags
}
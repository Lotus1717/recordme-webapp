let DBServer = require('./DBServer').DBServer

/** 
 * 更新记录 
 * a. 查询记录，若有记录则删除原来的记录信息（数据库会级联删除跟此记录有关的所有信息）
 * b. 查询标签，若无标签则插入新标签
 * c. 插入新的文本记录，标注
 * d. 插入新的标签和标签关系
 * @param [object] params {userId: 1, data: {url: '', title: '', tags: [], recordList: [{marktText: '', record: ''}]}}
 * @return promise
 */
const updateRecord = (params) => {
  console.log('调用recordServer updateRecord方法')
  let recordId
  // 子方法 -- 插入新的文本记录和标注
  let insertRecordAndMarks = () => {
    return DBServer.insertRecord(params).then(res => {
      if (res.result) {
        recordId = res.data.recordId
        let insertTodos = {
          recordId: res.data.recordId,
          markList: params.data.recordList
        }
        return DBServer.insertMultiMark(insertTodos)
      }
    })
  }
  // 1.查询记录
  return DBServer.queryRecord({
    userId: params.userId,
    recordName: params.data.title
  }).then(res => {
    console.log(res)
    if (res.result) {
      // 2.删除原来的记录      
      return DBServer.deleteRecord({
        recordId: res.data.recordId,
        userId: params.userId
      })
    }
  }).then(res => {
    // 3.插入新的记录和标注
    return insertRecordAndMarks()
  }).then(res => {
    if (params.data.tags.length > 0) {
      if (res.result) {
        // 4.插入新的标签
        let param = {
          userId: params.userId,
          tags: params.data.tags
        }
        return DBServer.insertNewTags(param)
      }
    } else {
      return {
        noTag: true
      }
    }
  }).then(res => {
    if (!res.noTag) {
      // 5.查询标签Id
      let param = {
        userId: params.userId,
        tags: params.data.tags
      }
      return DBServer.queryTags(param)
    } else {
      return {
        result: false
      }
    }
  }).then(res => {
    if (res.result) {
      // 6.插入新的标签记录关系
      let tagIds = []
      res.data.forEach(val => {
        tagIds.push(val.tagId)
      })
      let param = {
        recordId: recordId,
        tagIds: tagIds
      }
      return DBServer.insertRecordTags(param)
    }
  })
}

/** 
 * 查找用户的所有记录详情
 * 1.查找所有记录id
 * 2.查询记录id对应的标注  -- 1.2步可以优化，两张表联连接查询
 * 3.查询标签
 * @param [object] params {userId: 1}
 * @return promise 
 * {
      "result": true,
      "data": [{
        "recordId": 0,
        "recordName": "",
        "recordUrl": "",
        "markList": [{
          "markId": 0,
          "markText": ""
        }],
        "tagList": [{
          "tagId": 0,
          "tagName": ""
        }]
      }]
    }
 */
const queryPageRecords = (params) => {
  console.log('调用recordServer queryPageRecords方法')
  let list
  let recordIds = []
  return DBServer.queryRecordList(params).then(res => {
    if (res.result) {
      list = res.data
      list.forEach(val => {
        recordIds.push(val.recordId)
      })
      if(list.length > 0){
        return DBServer.queryMarkList({
          recordIds
        })
      } else {
        return Promise.reject({
          notRealPromiseException: true,
          data: {
            result: true,
            data: [],
            msg: '查询记录列表成功'
          }
        })
      }  
    }
  }).then(res => {
    if (res.result) {
      res.data.forEach((val, i) => {
        list[i].markList = val
      })
    }
  }).then(res => {
    let param = {
      recordIds
    }
    return DBServer.queryRecordTags(param)
  }).then(res => {
    let returnParam
    if (res.result) {
      res.data.forEach((val, i) => {
        list[i].tagList = val
      })
      returnParam = {
        result: true,
        data: list
      }
    } else {
      returnParam = {
        result: false,
        data: null
      }
    }
    return returnParam
  }).catch(e => {
    console.log(e)
    if(e.notRealPromiseException){
      return e.data
    }
    return {
      result: false,
      data: null,
      msg: '查询记录列表失败'
    }
  })
}

/** 
 * 删除一条标注 
 * @param [object] params {data: {markId: 1, recordId: 1}, userId: 1}
 * @return promise
 */
const deleteMark = (params) => {
  console.log('调用recordServer deleteMark方法')
  // 暂时不用userId做身份验证，应该要检查recordId是否属于此userId用户 
  return DBServer.deleteMark(params.data)
}

/** 
 * 删除一条记录 
 * @param [object] params {data: {recordId: 1}, userId: 1}
 * @return promise
 */
const deleteRecord = (params) => {
  console.log('调用recordServer deleteMark方法')
  // 暂时不用userId做身份验证，应该要检查recordId是否属于此userId用户 
  return DBServer.deleteRecord({
    recordId: params.data.recordId,
    userId: params.userId
  })
}

/** 
 * 更新记录标签 
 * 1.删除原来标签
 * 2.查询该用户的所有标签，插入新标签
 * 2.插入新记录标签
 * @param [object] params {data: {tags: ['',...], recordId: 1}, userId: 1}
 * @return promise
 */
const updateRecordTags = (params) => {
  console.log('调用调用recordServer updateRecordTags方法')
  let tagIds = []
  let tags = params.data.tags
  return DBServer.deleteRecordTags({
    recordId: params.data.recordId
  }).then(res => {  
    if (tags.length === 1 && tags[0] === '') {
      return Promise.reject({
        notRealPromiseException: true,
        data: {
          result: true,
          data: [],
          msg: '更新记录标签成功'
        }
      })
    } else {
      return DBServer.queryTags({
        userId: params.userId,
        tags
      })
    }    
  }).then(res => {
    if (res.result) {
      let todos = []
      res.data.forEach(val => {
        tagIds.push(val.tagId)
      })
      tags.forEach(val => {
        let arr = tagIds.filter(t => t.tagId === val)
        if (arr.length === 0) {
          todos.push(val)
        }
      })
      if (todos.length) {
        return DBServer.insertNewTags({
          userId: params.userId,
          tags: todos
        })
      }
    }
  }).then(res => {
    if (res.result) {
      tagIds = [...tagIds, ...res.data]
    }
    return DBServer.insertRecordTags({
      recordId: params.data.recordId,
      tagIds
    })
  }).then(res => {
    return DBServer.queryRecordTags({recordIds: [params.data.recordId]})
  }).then(res => {    
    let param = {
      result: false,
      data: null,
      msg: '更新记录标签失败'
    }
    if(res.result){
      param = {
        result: true,
        data: res.data[0],
        msg: '更新记录标签成功'
      }
    }
    return param
  }).catch(e => {
    if(e.notRealPromiseException){
      return e.data
    } 
  })
}

exports.RecordServer = {
  updateRecord,
  updateRecordTags,
  queryPageRecords,
  deleteMark,
  deleteRecord
}
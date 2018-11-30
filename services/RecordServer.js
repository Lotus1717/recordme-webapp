let DBServer = require('./DBServer').DBServer

/** 
 * 更新记录 
 * a. 查询记录，若有记录则删除原来的记录信息（数据库会级联删除跟此记录有关的所有信息）
 * b. 查询标签，若无标签则插入新标签
 * c. 插入新的文本记录，标注
 * d. 插入新的标签和标签关系
 * @param [object] params {userId: '', data: {url: '', title: '', tags: [], recordList: [{marktText: '', record: ''}]}}
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
  return DBServer.queryRecord({userId: params.userId, recordName: params.data.title}).then(res => {
    console.log(res)
    if (res.result) {
      // 2.删除原来的记录      
      return DBServer.deleteRecord({recordId: res.data.recordId, userId: params.userId})
    } 
  }).then(res => {    
    // 3.插入新的记录和标注
    return insertRecordAndMarks()
  }).then(res => {  
    if (params.data.tags.length > 0) {
      if (res.result) {
        // 4.插入新的标签
        let param = {userId: params.userId, tags: params.data.tags}
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
      let param = {userId: params.userId, tags: params.data.tags}
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
      let param = {recordId: recordId, tagIds: tagIds}
      return DBServer.insertRecordTags(param)
    }   
  })
}

/** 
 * 查找用户的所有记录详情
 * 1.查找所有记录id
 * 2.查询记录id对应的标注  -- 1.2步可以优化，两张表联连接查询
 * 3.查询标签
 * @param [object] params {userId: ''}
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
      return DBServer.queryMarkList({recordIds})
    }
  }).then(res => {
    if (res.result) {
      res.data.forEach((val, i) => {
        list[i].markList = val
      })     
    } 
  }).then(res => {
    let param = {recordIds}
    return DBServer.queryRecordTags(param)
  }).then(res => {
    let returnParam
    if(res.result){
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
  })
}

/** 
 * 删除一条标注 
 * @param [object] params {data: {markId: '', recordId: ''}, userId: ''}
 * @return promise
 */
const deleteMark = (params) => {
  console.log('调用recordServer deleteMark方法')
  // 暂时不用userId做身份验证，应该要检查recordId是否属于此userId用户 
  return DBServer.deleteMark(params.data)
}

/** 
 * 删除一条记录 
 * @param [object] params {data: {recordId: ''}, userId: ''}
 * @return promise
 */
const deleteRecord = (params) => {
  console.log('调用recordServer deleteMark方法')
  // 暂时不用userId做身份验证，应该要检查recordId是否属于此userId用户 
  return DBServer.deleteRecord({recordId: params.data.recordId, userId: params.userId})
}

exports.RecordServer =  {
  updateRecord,
  queryPageRecords,
  deleteMark,
  deleteRecord
}
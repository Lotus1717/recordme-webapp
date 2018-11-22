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
    if (res.result) {
      // 2.删除原来的记录      
      return DBServer.deleteRecord({recordId: res.data.recordId})
    }
  }).then(res => {    
    if (res.result) {
      // 3.插入新的记录和标注
      return insertRecordAndMarks()
    } 
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
 * 查找用户的所有记录 
 * @param [object] params {userId: ''}
 * @return promise
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
    let returnParam
    if (res.result) {
      res.data.forEach((val, i) => {
        list[i].markList = val
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
  }).then(res => {
    let param = {recordIds}
    return DBServer.queryRecordTags(param)
  })
}

exports.RecordServer =  {
  updateRecord,
  queryPageRecords
}
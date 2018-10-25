let DBServer = require('./DBServer').DBServer

/** 
 * 更新文本记录 
 * @param [object] params {userId: '', data: {url: '', title: '', recordList: [{marktText: '', record: ''}]}}
 * @return promise
 */
const updateRecord = (params) => {
  console.log('调用recordServer updateRecord方法')
  // 子方法 -- 插入新的文本记录
  let insertRecordAndMarks = () => {
    return DBServer.insertRecord(params).then(res => {
      if (res.result) {
        let insertTodos = {
          recordId: res.data.recordId,
          markList: params.data.recordList
        }
        return DBServer.insertMultiMark(insertTodos)
      }  
    })
  }
  
  return DBServer.queryRecord({userId: params.userId, recordName: params.data.title}).then(res => {
    if (res.result) {
      // 更新文本记录 -- 1.删除原来的文本记录； 2.插入新的文本记录
      return DBServer.deleteRecord({recordId: res.data.recordId}).then(delResult => {
        if (delResult.result) {
          return insertRecordAndMarks()
        } 
      })
    } else {
      // 插入文本记录
      return insertRecordAndMarks()
    }
  })

  
}

exports.RecordServer =  {
  updateRecord
}
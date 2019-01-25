/// <reference path="interface-dictionary.ts" />
import {
  insertRecord,
  insertMultiMark,
  insertNewTags,
  insertRecordTags,
  queryRecord,
  deleteOneRecord,
  deleteOneMark,
  deleteRecordTags,
  queryTags,
  queryRecordTags,
  queryUserRecords
} from './DBServer'

/**
 * 門栓
 * @description 程序是否通行
 */
// const latch = (...results: Array<DuckTypes.latchVal>) => {
//   for (let r of results) {
//     if (!r.result){
//       return Promise.reject(r)
//     }    
//   }
// }

/** 
 * 更新记录 
 * @description
 * a. 查询记录，若有记录则删除原来的记录信息（数据库会级联删除跟此记录有关的所有信息）；
 * b. 查询标签，若无标签则插入新标签；
 * c. 插入新的文本记录，标注；
 * d. 插入新的标签和标签关系；
 */
export async function updateRecord (params: DuckTypes.URecordVal) {
  try {
    let res1 = await queryRecord({userId: params.userId, recordName: params.data.title})
    res1.result && await deleteOneRecord({recordId: res1.data.recordId, userId: params.userId})
    let res2 = await insertRecord(params)
    if (params.data.tags.length > 0) {
      await Promise.all([
        insertMultiMark({recordId: res2.data.recordId, markList: params.data.recordList}),
        insertNewTags({userId: params.userId, tags: params.data.tags})
      ]) // 同时执行， 提高效率
      let res3 = await queryTags({userId: params.userId, tags: params.data.tags}) 
      let tagIds = []
      res3.data.forEach(val => {
        tagIds.push(val.tagId)
      })
      await insertRecordTags({recordId: res2.data.recordId, tagIds})
      return {result: true, msg: '更新记录成功'}
    } else {
      await insertMultiMark({recordId: res2.data.recordId, markList: params.data.recordList})
      return {result: true, msg: '更新记录成功'}
    }   
  } catch (err) {
    console.log(err)
    return {result: false, msg: '更新记录失敗'}
  }
}

/** 
 * 查找用户的所有记录详情
 * @description
 * 1.查找所有记录和标注 -- 后期优化: 多表连接查询并将结果分组
 * 2.查询标签
 */
export async function queryPageRecords (params: DuckTypes.userVal) {
  try {
    let returnVal: DuckTypes.QPagesReturnVal = {result: true, msg: '查询用户记录成功', data: []}
    let res1 = await queryUserRecords(params)
    let recordIds = []
    res1.data.forEach(val => {
      let todos = res1.data.filter(r => r.recordId === val.recordId)
      if (todos.length > 0) {
        let record = {recordId: todos[0].recordId, recordName: todos[0].recordName, recordUrl: todos[0].recordUrl}
        recordIds.push(record.recordId)
        let markList = []
        todos.forEach(val => {
          markList.push({markId: val.markId, markText: val.markText})
        })
        returnVal.data.push({...record, markList, tagList: []})
      }
    })
    if(recordIds.length > 0) {
      let res2 = await queryRecordTags({recordIds})
      res2.data.forEach((val, i) => {
        returnVal.data[i].tagList = val
      })
    }  
    return returnVal
  } catch (err) {
    console.log(err)
    return {result: false, msg: '查询用户记录失敗'}
  }
}

/** 
 * 删除一条标注 
 */
export async function deleteMark (params: DuckTypes.DRecordMarkVal) {
  // 暂时不用userId做身份验证，应该要检查recordId是否属于此userId用户 
  return deleteOneMark(params.data)
}

/** 
 * 删除一条记录 
 */
export async function deleteRecord (params: DuckTypes.DOneRecordVal) {
  // 暂时不用userId做身份验证，应该要检查recordId是否属于此userId用户 
  return deleteOneRecord({recordId: params.data.recordId, userId: params.userId})
}

/** 
 * 更新记录标签 
 * @description
 * 1.删除原来标签
 * 2.查询该用户的所有标签，插入新标签
 * 3.插入新记录标签
 */
export async function updateRecordTags (params: DuckTypes.URecordTagsVal) {
  try {
    let returnVal: DuckTypes.URecordTagReturnVal = {result: true, msg: '更新记录标签成功'}
    let recordId = params.data.recordId
    let tags = params.data.tags
    await deleteRecordTags({'recordId': recordId})
    if (params.data.tags.length === 1 && params.data.tags[0] === '') {
      return returnVal
    }
    await insertNewTags({'userId': params.userId, 'tags': tags})
    let res5 = await queryTags({'userId': params.userId, 'tags': tags})
    let todos = []
    res5.data.forEach(val => {
      todos.push(val.tagId)
    })
    await insertRecordTags({'recordId': recordId, 'tagIds': todos})
    let res4 = await queryRecordTags({'recordIds': [recordId]})
    returnVal.data = res4.data[0]
    return returnVal
  } catch (err) {
    console.log(err)
    return {result: false, msg: '更新记录标签失敗'}
  }
}

// test 
// let notags = {'userId': 1, 'data': {'url': '123', title: 'abc', 'recordList': [{'markText': '11342', 'record': ''}], 'tags': []}}
// updateRecord(notags).then(res => {console.log(res)})
// let tags = {'userId': 1, 'data': {'url': '123', title: 'abc', 'recordList': [{'markText': '11342', 'record': ''}], 'tags': ['a', 'b']}}
// updateRecord(tags).then(res => {console.log(res)})
queryPageRecords({'userId': 1}).then(res => console.log(res))
// deleteMark({'userId': 1, 'data': {'markId': 125, 'recordId': 128}}).then(res => console.log(res))
// deleteRecord({'userId': 1, 'data': {'recordId': 128}}).then(res => console.log(res))
// updateRecordTags({'userId': 1, 'data': {'tags': [''], 'recordId': 62}}).then(res => console.log(res))

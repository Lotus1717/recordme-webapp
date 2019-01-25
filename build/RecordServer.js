"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DBServer_1 = require("./DBServer");
async function updateRecord(params) {
    try {
        let res1 = await DBServer_1.queryRecord({ userId: params.userId, recordName: params.data.title });
        res1.result && await DBServer_1.deleteOneRecord({ recordId: res1.data.recordId, userId: params.userId });
        let res2 = await DBServer_1.insertRecord(params);
        if (params.data.tags.length > 0) {
            await Promise.all([
                DBServer_1.insertMultiMark({ recordId: res2.data.recordId, markList: params.data.recordList }),
                DBServer_1.insertNewTags({ userId: params.userId, tags: params.data.tags })
            ]);
            let res3 = await DBServer_1.queryTags({ userId: params.userId, tags: params.data.tags });
            let tagIds = [];
            res3.data.forEach(val => {
                tagIds.push(val.tagId);
            });
            await DBServer_1.insertRecordTags({ recordId: res2.data.recordId, tagIds });
            return { result: true, msg: '更新记录成功' };
        }
        else {
            await DBServer_1.insertMultiMark({ recordId: res2.data.recordId, markList: params.data.recordList });
            return { result: true, msg: '更新记录成功' };
        }
    }
    catch (err) {
        console.log(err);
        return { result: false, msg: '更新记录失敗' };
    }
}
exports.updateRecord = updateRecord;
async function queryPageRecords(params) {
    try {
        let returnVal = { result: true, msg: '查询用户记录成功', data: [] };
        let res1 = await DBServer_1.queryUserRecords(params);
        let recordIds = [];
        res1.data.forEach(val => {
            let todos = res1.data.filter(r => r.recordId === val.recordId);
            if (todos.length > 0) {
                let record = { recordId: todos[0].recordId, recordName: todos[0].recordName, recordUrl: todos[0].recordUrl };
                recordIds.push(record.recordId);
                let markList = [];
                todos.forEach(val => {
                    markList.push({ markId: val.markId, markText: val.markText });
                });
                returnVal.data.push(Object.assign({}, record, { markList, tagList: [] }));
            }
        });
        if (recordIds.length > 0) {
            let res2 = await DBServer_1.queryRecordTags({ recordIds });
            res2.data.forEach((val, i) => {
                returnVal.data[i].tagList = val;
            });
        }
        return returnVal;
    }
    catch (err) {
        console.log(err);
        return { result: false, msg: '查询用户记录失敗' };
    }
}
exports.queryPageRecords = queryPageRecords;
async function deleteMark(params) {
    return DBServer_1.deleteOneMark(params.data);
}
exports.deleteMark = deleteMark;
async function deleteRecord(params) {
    return DBServer_1.deleteOneRecord({ recordId: params.data.recordId, userId: params.userId });
}
exports.deleteRecord = deleteRecord;
async function updateRecordTags(params) {
    try {
        let returnVal = { result: true, msg: '更新记录标签成功' };
        let recordId = params.data.recordId;
        let tags = params.data.tags;
        await DBServer_1.deleteRecordTags({ 'recordId': recordId });
        if (params.data.tags.length === 1 && params.data.tags[0] === '') {
            return returnVal;
        }
        await DBServer_1.insertNewTags({ 'userId': params.userId, 'tags': tags });
        let res5 = await DBServer_1.queryTags({ 'userId': params.userId, 'tags': tags });
        let todos = [];
        res5.data.forEach(val => {
            todos.push(val.tagId);
        });
        await DBServer_1.insertRecordTags({ 'recordId': recordId, 'tagIds': todos });
        let res4 = await DBServer_1.queryRecordTags({ 'recordIds': [recordId] });
        returnVal.data = res4.data[0];
        return returnVal;
    }
    catch (err) {
        console.log(err);
        return { result: false, msg: '更新记录标签失敗' };
    }
}
exports.updateRecordTags = updateRecordTags;
queryPageRecords({ 'userId': 1 }).then(res => console.log(res));
//# sourceMappingURL=../src/build/RecordServer.js.map
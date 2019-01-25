"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let mysql = require('mysql');
let pool = mysql.createPool({
    host: '127.0.0.1',
    user: 'root',
    password: '80808080',
    port: 3306,
    database: 'recordme',
    connectionLimit: 100,
    multipleStatements: true
});
const query = (sql, todos) => {
    return new Promise((resolve, reject) => {
        pool.getConnection((err, connection) => {
            connection.query(sql, todos, (error, results) => {
                if (error) {
                    let param = {
                        result: false,
                        error: error
                    };
                    reject(param);
                }
                else {
                    let param = {
                        result: true,
                        data: JSON.parse(JSON.stringify(results))
                    };
                    resolve(param);
                }
            });
            connection.release();
        });
    });
};
async function insertRecord(params) {
    let sql = `insert into record(record_name, record_url, user_id) values(?, ?, ?)`;
    let todo = [params.data.title, params.data.url, params.userId];
    try {
        let res = await query(sql, todo);
        let param = {
            result: false,
            msg: '文本记录保存失败'
        };
        if (res.result) {
            if (res.data.insertId >= 0) {
                param = {
                    result: true,
                    data: {
                        recordId: res.data.insertId
                    },
                    msg: '文本记录保存成功'
                };
            }
        }
        return param;
    }
    catch (err) {
        console.log(err);
    }
}
exports.insertRecord = insertRecord;
async function queryRecord(params) {
    let sql = `select * from record where user_id = ${params.userId} and record_name = '${params.recordName}'`;
    try {
        let res = await query(sql);
        let param = {
            result: false,
            msg: '查询记录失败'
        };
        if (res.result) {
            let data = res.data;
            if (data.length > 0) {
                param = {
                    result: true,
                    data: {
                        recordId: data[0]['record_id'],
                        recordName: data[0]['record_name'],
                        recordUrl: data[0]['record_url']
                    },
                    msg: '查询记录成功'
                };
            }
        }
        return param;
    }
    catch (err) {
        console.log(err);
    }
}
exports.queryRecord = queryRecord;
async function insertMultiMark(params) {
    let todos = [];
    params.markList.forEach(val => {
        todos.push([val.markText, params.recordId]);
    });
    let sql = `insert into mark(mark_text, record_id) values ?`;
    try {
        let res = await query(sql, [todos]);
        let param = {
            result: false,
            msg: '文本标注保存失败'
        };
        if (res.result) {
            let data = res.data;
            if (data.affectedRows === params.markList.length) {
                param = {
                    result: true,
                    msg: '所有文本标注保存成功'
                };
            }
        }
        return param;
    }
    catch (err) {
        console.log(err);
    }
}
exports.insertMultiMark = insertMultiMark;
async function insertNewTags(params) {
    let todos = [];
    params.tags.forEach(val => {
        todos.push([val, params.userId]);
    });
    let sql = `insert ignore into tag(tag_name, user_id) values ?`;
    try {
        let res = await query(sql, [todos]);
        let param = {
            result: false,
            msg: '插入新标签失败'
        };
        if (res.result) {
            let data = res.data;
            if (data.affectedRows > 0) {
                let tagIds = [];
                for (let i = 0; i < data.affectedRows; i++) {
                    tagIds.push(data.insertId + i);
                }
                param = {
                    result: true,
                    data: tagIds,
                    msg: '插入新标签成功'
                };
            }
        }
        return param;
    }
    catch (err) {
        console.log(err);
    }
}
exports.insertNewTags = insertNewTags;
async function insertRecordTags(params) {
    let todos = [];
    params.tagIds.forEach(val => {
        todos.push([params.recordId, val]);
    });
    let sql = `insert into record_tag(record_id, tag_id) values ?`;
    try {
        let res = await query(sql, [todos]);
        let param = {
            result: false,
            msg: '插入记录标签失败'
        };
        if (res.result) {
            let data = res.data;
            if (data.affectedRows > 0) {
                param = {
                    result: true,
                    msg: '插入记录标签成功'
                };
            }
        }
        return param;
    }
    catch (err) {
        console.log(err);
    }
}
exports.insertRecordTags = insertRecordTags;
async function deleteOneMark(params) {
    let sql = `delete from mark where mark_id = ${params.markId}`;
    try {
        let res = await query(sql);
        let param = {
            result: false,
            msg: '删除标注失败'
        };
        if (res.result) {
            let data = res.data;
            if (data.affectedRows > 0) {
                param = {
                    result: true,
                    msg: '删除标注成功'
                };
            }
        }
        return param;
    }
    catch (err) {
        console.log(err);
    }
}
exports.deleteOneMark = deleteOneMark;
async function deleteOneRecord(params) {
    let sql = `delete from record where record_id = ${params.recordId} and user_id = ${params.userId}`;
    try {
        let res = await query(sql);
        let param = {
            result: false,
            msg: '删除记录失败'
        };
        if (res.result) {
            let data = res.data;
            if (data.affectedRows > 0) {
                param = {
                    result: true,
                    msg: '删除记录成功'
                };
            }
        }
        return param;
    }
    catch (err) {
        console.log(err);
    }
}
exports.deleteOneRecord = deleteOneRecord;
async function deleteRecordTags(params) {
    let sql = `delete from record_tag where record_id = ${params.recordId}`;
    try {
        let res = await query(sql);
        let param = {
            result: false,
            msg: '删除记录标签失败'
        };
        if (res.result) {
            let data = res.data;
            if (data.affectedRows > 0) {
                param = {
                    result: true,
                    msg: '删除记录标签成功'
                };
            }
        }
        return param;
    }
    catch (err) {
        console.log(err);
    }
}
exports.deleteRecordTags = deleteRecordTags;
async function queryTags(params) {
    let sql = '';
    params.tags.forEach(val => {
        sql += `select * from tag where tag_name = '${val}' and user_id = ${params.userId};`;
    });
    try {
        let res = await query(sql);
        let param = {
            result: false,
            msg: '查询标签失败'
        };
        if (res.result) {
            let tagArr = [];
            res.data.forEach((val) => {
                if (val instanceof Array) {
                    val.forEach(item => {
                        tagArr.push({
                            tagId: item['tag_id'],
                            tagName: item['tag_name'],
                            userId: item['user_id']
                        });
                    });
                }
                else {
                    tagArr.push({
                        tagId: val['tag_id'],
                        tagName: val['tag_name'],
                        userId: val['user_id']
                    });
                }
            });
            param = {
                result: true,
                data: tagArr,
                msg: '查询标签成功'
            };
        }
        return param;
    }
    catch (err) {
        console.log(err);
    }
}
exports.queryTags = queryTags;
async function queryRecordTags(params) {
    let sqls = '';
    params.recordIds.forEach(val => {
        sqls += `select * from tag t right join record_tag rt on t.tag_id = rt.tag_id where rt.record_id = ${val};`;
    });
    try {
        let res = await query(sqls);
        let param = {
            result: false,
            msg: '查询记录标签失败'
        };
        if (res.result) {
            let allTags = [];
            let tagArr = [];
            res.data.forEach((val) => {
                let arr = [];
                if (val instanceof Array) {
                    val.forEach(item => {
                        arr.push({
                            tagId: item['tag_id'],
                            tagName: item['tag_name']
                        });
                    });
                    allTags.push(arr);
                }
                else {
                    tagArr.push({
                        tagId: val['tag_id'],
                        tagName: val['tag_name']
                    });
                }
            });
            if (tagArr.length > 0) {
                allTags.push(tagArr);
            }
            param = {
                result: true,
                data: allTags,
                msg: '查询记录标签成功'
            };
        }
        return param;
    }
    catch (err) {
        console.log(err);
    }
}
exports.queryRecordTags = queryRecordTags;
async function queryUserRecords(params) {
    let sql = `select * from record r right join mark m on m.record_id = r.record_id where r.user_id = ${params.userId};`;
    try {
        let res = await query(sql);
        let param = {
            result: false,
            msg: '查询用户的所有记录失败'
        };
        if (res.result) {
            let arr = [];
            res.data.forEach((val) => {
                arr.push({
                    recordId: val['record_id'],
                    recordName: val['record_name'],
                    recordUrl: val['record_url'],
                    markId: val['mark_id'],
                    markText: val['mark_text']
                });
            });
            param = {
                result: true,
                data: arr,
                msg: '查询用户的所有记录成功'
            };
        }
        return param;
    }
    catch (err) {
        console.log(err);
    }
}
exports.queryUserRecords = queryUserRecords;
async function queryRecordList(params) {
    let sql = `select * from record where user_id = ${params.userId}`;
    try {
        let res = await query(sql);
        let param = {
            result: false,
            msg: '查询文本记录失败'
        };
        if (res.result) {
            let data = res.data;
            if (data instanceof Array) {
                let arr = [];
                data.forEach(val => {
                    arr.push({
                        recordId: val['record_id'],
                        recordName: val['record_name'],
                        recordUrl: val['record_url']
                    });
                });
                param = {
                    result: true,
                    data: arr,
                    msg: '查询文本记录成功'
                };
            }
        }
        return param;
    }
    catch (err) {
    }
}
exports.queryRecordList = queryRecordList;
async function queryMarkList(params) {
    let sql = '';
    params.recordIds.forEach(val => {
        sql += `select * from mark where record_id = ${val};`;
    });
    try {
        let res = await query(sql);
        let param = {
            result: false,
            msg: '查询文本标注失败'
        };
        if (res.result) {
            let allMarks = [];
            let markArr = [];
            res.data.forEach((val) => {
                if (val instanceof Array) {
                    let arr = [];
                    val.forEach(item => {
                        arr.push({
                            markId: item['mark_id'],
                            markText: item['mark_text']
                        });
                    });
                    allMarks.push(arr);
                }
                else {
                    markArr.push({
                        markId: val['mark_id'],
                        markText: val['mark_text']
                    });
                }
            });
            if (markArr.length > 0) {
                allMarks.push(markArr);
            }
            param.data = allMarks;
            param = {
                result: true,
                data: allMarks,
                msg: '查询文本标注成功'
            };
        }
        return param;
    }
    catch (err) {
        console.log(err);
    }
}
exports.queryMarkList = queryMarkList;
async function queryUser(params) {
    let sql = `select * from user where user_name = '${params.name}' and user_password = '${params.password}'`;
    try {
        let res = await query(sql);
        let param = {
            result: false,
            msg: '查询用户失败'
        };
        if (res.result) {
            if (res.data.length > 0) {
                param = {
                    result: true,
                    data: {
                        userId: res.data[0]['user_id']
                    },
                    msg: '查询用户成功'
                };
            }
        }
        return param;
    }
    catch (err) {
        console.log(err);
    }
}
exports.queryUser = queryUser;
async function insertUser(params) {
    let sql = `insert into user (user_name, user_password) values ('${params.name}', '${params.password}')`;
    try {
        let res = await query(sql);
        let param = {
            result: false,
            msg: '新增用户失败'
        };
        if (res.result) {
            if (res.data.insertId > 0) {
                param = {
                    result: true,
                    data: {
                        userId: res.data.insertId
                    },
                    msg: '新增用户成功'
                };
            }
        }
        return param;
    }
    catch (err) {
        console.log(err);
    }
}
exports.insertUser = insertUser;
//# sourceMappingURL=../src/build/DBServer.js.map
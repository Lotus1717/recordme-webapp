let http = require('http')
let querystring = require('querystring')  // 解析post请求
let url = require('url')  // 解析get请求
let Router = require('./router')

let httpObj = http.createServer((request, response) => { 
  let params
  if (request.method === 'GET') {  
    params = url.parse(request.url,true).query
    distributeHttpRequest(request.url, params).then(responseData => {
      let res = {
        data: responseData,
        result: true
      }
      response.write(JSON.stringify(res))
      response.end()
    })   
  } else { 
    let data = ''
    request.on('data', chunk => {
      data += chunk
    })
    // POST结束输出结果
    request.on('end', () => {
      console.log(data)
      // 完整的post数据
      params = JSON.parse(data) 
      // http请求分发
      distributeHttpRequest(request.url, params).then(result => {
        //定义报文头
        response.writeHead(200,{"Content-Type":"text/json;charset=UTF-8"})
        response.write(JSON.stringify(result))
        response.end()
      })   
    })   
  }
  
}).listen(8007, '127.0.0.1')

/** 
 * http请求分发
 * @param [string] url [http请求路径] 'RecordServer/updateRecordList'
 * @param [object] params http请求参数
 * @return promise 
 */
const distributeHttpRequest = (url, params) => {
  let arr = url.split('/')
  let serverName = arr[1]
  let serverFunction = arr[2]
  let server = require('./services/'+ serverName)[serverName]
  return server[serverFunction](params)
}


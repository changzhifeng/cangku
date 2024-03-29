/****
在创建第一个“Hello World”应用前，先了解下 Node.js 应用是由哪几部分组成的：  
    1.引入 required 模块：我们可以使用 require 指令来载入 HTTP 模块。并将实例化的HTTP赋值给变量http。
    2.创建服务器：服务器可以监听客户端的请求，类似于 Apache 、Nginx 等 HTTP 服务器。
    3.接收请求与响应请求： 服务器很容易创建，客户端可以使用浏览器或终端发送 HTTP 请求，服务器接收请求后返回响应数据。
*/
var http = require('http');
http.createServer(function(request,response){
	// 发送HTTP头部
	// HTTP状态值：200：ok
	// 内容类型：text/plain
	response.writeHead(200,{'Content-Type':'text/plain'});
	// 发送响应数据"Hello World"
	response.end("Hello World\n");
}).listen(8888);
// 终端打印如下信息
console.log('Server running at http://127.0.0.1:8888/');
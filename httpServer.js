var http=require('http');
var express=require('express');
var path=require('path');
var app=express();
app.use(express.static(path.resolve(__dirname,"public")));
var httpserver=http.createServer(app);
require('./socketserver')(httpserver);

httpserver.listen(3000,function(){
    console.log('服务器运行在3000端口')
})
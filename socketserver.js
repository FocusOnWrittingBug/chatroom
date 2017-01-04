/**
 * Created by hxsd on 2016/12/9.
 */
var socketIo=require('socket.io');
var users=[];
var userssocket={};
module.exports=function(httpserver){
    var socketserver=socketIo.listen(httpserver);
    socketserver.on('connect',function(socket){
        var socketname="";
        socket.on('message',function(data){
            socketname=data.name;
            var type=data.type;
            switch (type){
                case 101:
                    var check=checkname(data);
                    if(check){
                        userssocket[data.nickname]=socket;
                        users.push(data);
                        console.log(users);
                        console.log(userssocket);
                        handlelogin(socket,data);
                    }else{
                        var msg={
                            type:100,
                            checkname:false
                        }
                        socket.send(msg);
                    }



                    break;


                case 200:
                    handleSays(socket,data);
                    break;
            }

        })

        socket.on('private',function(data){
            console.log(data);
            data.type=105;
            userssocket[data.to].send(data);
            data.type=104;
            socket.send(data);
        })

        socket.on('disconnect',function(){

            for(var i=0;i<users.length;i++){
                var user=users[i];
                if(user.nickname==socket.nickname){
                    users.splice(i,1);
                    delete userssocket[socket.nickname];
                    var msg={
                        type:102,
                        nickname:socket.nickname,
                        users:users
                    }
                    socket.broadcast.send(msg);
                    break;
                }
            }

        })


    })

}
function checkname(data){
    var check=true;
    for(var i=0;i<users.length;i++){
        if(users[i].nickname==data.nickname){
            /*var msg={
                type:100,
                checkname:false*/
            check=false;
        }
            break;

    }
    return check;
}

function handlelogin(socket,data){
    socket.nickname=data.nickname;

    var msg={
        type:data.type,
        nickname:data.nickname,
        checkname:true,
        users:users
    }
    socket.broadcast.send(msg);
    msg.type=100;
    socket.send(msg);
    console.log('ok');

}
function handleSays(socket,data){
    /*var msg={
        type:200,
        chattxt:data.chattxt,
        nickname:data.nickname
    }*/
    var msg=data;
    socket.send(msg);
    msg.type=201;
    socket.broadcast.send(msg);
}

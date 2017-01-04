$(function(){

    $('.logo').on('click',function(){
        $('.logo_choose').slideToggle();
    })
    $('.logo').on('mouseover',function(){
        $('.logo_tips').fadeIn();
    })
    $('.logo').on('mouseout',function(){
        $('.logo_tips').fadeOut();
    })
    $('.sexualBtn').eq(0).on('click',function(){
        $(this).addClass('ac');
        $('.sexualBtn').eq(1).removeClass('ac');
    })
    $('.sexualBtn').eq(1).on('click',function(){
        $(this).addClass('ac');
        $('.sexualBtn').eq(0).removeClass('ac');
    })
    $('.logo_choose').find('li').on('click',function(){
        $('.logo').find('img').eq(0).attr('src',$(this).children(0).attr('src'));
        $('.logo_choose').slideUp();
    })
    $('.icons').on('click',function(){
        $('.icons_list').fadeToggle();
    })
    $('.choose_bg').on('click',function(){
        $('.bg_inner').slideToggle();
    })
    $('.bg_inner').find('li').each(function(index){
        $(this).on('click',function(){
            $('.background').fadeOut();
            $('.bg_inner').slideUp();
            setTimeout(function(){
                $('.background').css('backgroundImage','url(../images/bg'+(index+1)+'.jpg)').fadeIn();
            },400)
        })
    })

    var thisname='';
    var thislogo='';

    var clientsocket=io();
    $('.login_btn').on('click',function(){
        var myName=$('.nickname').val();
        if(myName.replace(/^\s+|\s+$/g, "")==''){  //用户名非空验证
            $('.nickname').val('');
            $('.nicknameTip').slideDown();
            setTimeout(function(){
                $('.nicknameTip').slideUp();
            },1000)
        }else {
            thisname=myName;        //保存客户端用户名
            thislogo=getlogo();     //保存客户端头像
            var msg={               //发送登录请求
                type:101,
                nickname:myName,
                usersexual:getsexual(),
                userlogo:getlogo()
            }
            clientsocket.send(msg);
        }


    })
    $('.nickname').on('keyup',function(e){
        if(e.keyCode==13){
            $('.login_btn').trigger('click');
        }
    })
    $('.send').on('click',function(){               //聊天窗口非空验证
        var chattxt=$('.chat_text').val();
        if(chattxt.replace(/^\s+|\s+$/g, "")==''){
            $('.chat_text').val('');
            $('.chatTip').slideDown();
            setTimeout(function(){
                $('.chatTip').slideUp();
            },1000)
        }else {
            var msg={                           //发送聊天请求
                type:200,
                chattxt:chattxt,
                nickname:thisname,
                logo:thislogo
            }
            clientsocket.send(msg);
            $('.chat_text').val("");
        }

    })
    $('.chat_text').on('keyup',function(e){
        if(e.keyCode==13){
            $('.send').trigger('click');
        }

    })
    $('.icons_list').find('img').each(function(){          //发送表情请求
        $(this).on('click',function(){
            var msg={
                type:200,
                icon:$(this).attr('src'),
                nickname:thisname,
                logo:thislogo
            }
            clientsocket.send(msg);
            $('.icons_list').fadeOut();
        })
    })
    $('.user_list').on('click','.private',function(){
        var chattxt=$('.chat_text').val();
        if(chattxt.replace(/^\s+|\s+$/g, "")==''){
            $('.chat_text').val('');
            $('.chatTip').slideDown();
            setTimeout(function(){
                $('.chatTip').slideUp();
            },1000)
        }else {
            if($(this).parent().parent().find('div').eq(0).text()==thisname){
                $('.chat_text').val('');
                $('.chatTip2').slideDown();
                setTimeout(function(){
                    $('.chatTip2').slideUp();
                },1000)
            }else {
                var msg={                              //发送私聊消息
                    logo:thislogo,
                    from:thisname,
                    text:$('.chat_text').val(),
                    to:$(this).parent().parent().find('div').eq(0).text()
                }
                clientsocket.emit('private',msg);
                $('.chat_text').val("");
            }
        }
    })
    var status=true;
    /*$('.user_list').on('click','.status_inner>li',function(){

        $(this).siblings().toggle();
        if($(this).attr('class').indexOf('ban')!=-1){
            status=false;
        }else if($(this).attr('class').indexOf('smile')!=-1){
            status=true;
        }
    })
    if(status){

    }*/
    //------------------------------------------------------------
    function getsexual(){
        var userSexual='';
        $('.sexualBtn').each(function(){
            if($(this).attr('class').indexOf('ac')!=-1){
                userSexual=$(this).text();
            }
        })
        return userSexual;
    }
    function scroll(){
        $('.chat_inner').scrollTop($('.chat_inner').prop('scrollHeight'));
    }
    function getlogo(){
        var userlogo=$('.logo').find('img').eq(0).attr('src');
        return userlogo;
    }
    function getsexuallogo(data){
        var sexuallogo='';
        if(data=='我是男生'){
            sexuallogo='<span class="fa fa-mars malelogo"></span>'
        }else if(data=='我是女生'){
            sexuallogo='<span class="fa fa-venus femalelogo"></span>'
        }
        return sexuallogo;
    }



    clientsocket.on('message',function(data){//请求编号

        var type=data.type;
        switch (type){
            case 100://自己登录
                selflogin(data);
                userlist(data);
                break;
            case 101://别人登录
                otherslogin(data);
                userlist(data);
                break;
            case 102://别人退出
                othersout(data);
                userlist(data);
                break;
            case 200://自己发言
                selfSays(data);
                break;
            case 201://别人发言
                othersSays(data);
                break;
            case 104://自己对别人私聊
                privateto(data);
                break;
            case 105://别人对自己私聊
                privatesays(data);
                break;
        }
    })














    function selflogin(data){
        if(data.checkname){
            $('#login_wrap').fadeOut();
            $('#chat_wrap').fadeIn();
            $('.chat_inner').html("");
            $('<div>').attr('class','system_info').html("<span>[系统消息]您已成功连接聊天室，请文明发言</span>").appendTo('.chat_inner');
        }else{
            $('.nickname').val('');
            $('.check_name').slideDown();
            setTimeout(function(){
                $('.check_name').slideUp();
            },1000)

        }

    }

    function otherslogin(data){
        $('<div>').attr('class','system_info').html("<span>[系统消息]'"+data.nickname+"'已登录</span>").appendTo('.chat_inner');
        scroll();
    }
    function othersout(data){
        $('<div>').attr('class','system_info').html("<span>[系统消息]'"+data.nickname+"'已离线</span>").appendTo('.chat_inner');
        scroll();
    }
    function selfSays(data){
        if(data.chattxt){
            $('<div>').attr('class','self_chat').html("<div class='chat_logo'><img src='"+data.logo+"'></div><div class='chat_info'><div class='chat_name'>"+data.nickname+"</div><div class='chat_txt'>"+data.chattxt+"</div></div>").appendTo('.chat_inner');
        }else{
            $('<div>').attr('class','self_chat').html("<div class='chat_logo'><img src='"+data.logo+"'></div><div class='chat_info'><div class='chat_name'>"+data.nickname+"</div><div class='chat_txt'><img src='"+data.icon+"'></div></div>").appendTo('.chat_inner');
        }
        scroll();
    }
    function othersSays(data){
        if(data.chattxt){
            $('<div>').attr('class','others_chat').html("<div class='chat_logo'><img src='"+data.logo+"'></div><div class='chat_info'><div class='chat_name'>"+data.nickname+"</div><div class='chat_txt'>"+data.chattxt+"</div></div>").appendTo('.chat_inner');
        }else{
            $('<div>').attr('class','others_chat').html("<div class='chat_logo'><img src='"+data.logo+"'></div><div class='chat_info'><div class='chat_name'>"+data.nickname+"</div><div class='chat_txt'><img src='"+data.icon+"'></div></div>").appendTo('.chat_inner');
        }
        scroll();
    }
    function privatesays(data){
        $('<div>').attr('class','others_chat').html("<div class='chat_logo'><img src='"+data.logo+"'></div><div class='chat_info'><div class='chat_name'>"+data.from+":悄悄对你说</div><div class='chat_txt'>"+data.text+"</div></div>").appendTo('.chat_inner');
        scroll();
    }
    function privateto(data){
        $('<div>').attr('class','self_chat').html("<div class='chat_logo'><img src='"+data.logo+"'></div><div class='chat_info'><div class='chat_name'>你悄悄对"+data.to+"说：</div><div class='chat_txt'>"+data.text+"</div></div>").appendTo('.chat_inner');
        scroll();
    }
    function userlist(data){
        var content='';
        for(var i=0;i<data.users.length;i++){
            content+="<li><div class='userlogo'><img src='"+data.users[i].userlogo+"'></div><div class='userinfo'><div class='username'>"+data.users[i].nickname+getsexuallogo(data.users[i].usersexual)+"</div><div class='status'><ul class='status_inner'><li><span class='fa fa-smile-o'></span></li><li><span class='fa fa-ban'></span></li></ul></div></div></li>";
        }
        $('.user_list').html(content);
        $('<a>').attr('class','private').text('[发给ta]').appendTo('.status');
        $('.online>span').text(data.users.length);
    }
    setInterval(function (){
        var oDate=new Date();
        var oYear=oDate.getFullYear();
        var oMonth=oDate.getMonth()+1;
        var oDay=oDate.getDate();
        var oHour=oDate.getHours();
        var oMin=oDate.getMinutes();
        var oSec=oDate.getSeconds();
        if(oDay<=9) oDay='0'+oDay;
        if(oHour<=9) oHour='0'+oHour;
        if(oMin<=9) oMin='0'+oMin;
        if(oSec<=9) oSec='0'+oSec;
        $('.time').text('北京时间：'+oYear+'年'+oMonth+'月'+oDay+'日'+oHour+'：'+oMin+'：'+oSec+'');
    },1000);






})
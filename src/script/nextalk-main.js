/**
 * 程序入口设置
 */
(function() {

    "use strict";

    // NexTalkWebUI初始化参数
    var main = {
        // 通信令牌 暂时不用
        // ticket : 'ticket',
        // APP_KEY 暂时不用
        // appKey : 'app_key',
        /** 是否是手机端 */
        mobile : false,
        // 引入资源文件的根路径
        resPath : window.nextalkResPath,
        // API根路径
        apiPath : '/',
        // API路由
        route : {}
    };
    main.setConfig = function(ops) {
        $.extend(this, ops || {});
    };
    main._loadHTML = function(callback) {
        $.ajax({
            type : 'GET',
            cache : false,
            url : main.resPath + 'html/main.html',
            dataType : 'html',
            success : function(ret) {
                var $ret = $(ret);
                $('img[toggle-data]', $ret).each(function(i, el) {
                    var $el = $(el);
                    if ($el.attr('toggle-data') == 'login') {
                        $el.attr('src', main.resPath + 'imgs/logo.png');
                    } else if ($el.attr('toggle-data') == 'logo') {
                        $el.attr('src', main.resPath + 'imgs/webim.72x72.png');
                    } else if ($el.attr('toggle-data') == 'head_def') {
                        $el.attr('src', main.resPath + 'imgs/head_def.png');
                    }
                });
                $('body').append($ret).css({
                    overflow : 'hidden'
                });
                callback();
            }
        });
    };
    main.go = function() {
        var _this = this;

        IM.WebAPI.route(_this.route);
        _this._loadHTML(function() {
            var ui = NexTalkWebUI.init(_this.ticket, {
                resPath : _this.resPath,
                apiPath : _this.apiPath,
                mobile : _this.mobile
            });
            ui.connectServer(_this.ticket);
        });
    };

    var top = window.top;
    if (top != window.self) {
        // 获取父窗体中的引导程序
        var iframe = top.nextalkIframe;
        main.setConfig(iframe.config);

        // 父窗口中的页面元素
        var nkMain = $('#nextalk_main', top.document);
        var nkIframe = $('#nextalk_iframe', top.document);

        var nkMainHeight = -42;
        var nkIframeHeight = -(iframe.panel.height);
        slideUp(nkMain, nkMainHeight);

        nkMain.find('a').click(function() {
            nkMain.hide();
            slideUp(nkIframe, nkIframeHeight);
        });
        nkIframe.find('a').click(function() {
            nkIframe.hide();
            slideUp(nkMain, nkMainHeight);
        });
    }

    function slideUp($el, offset) {
        $el.css({
            bottom : offset + 'px'
        });
        $el.show();
        var timerTask = window.setTimeout(function() {
            $el.css({
                bottom : '0px'
            });
            window.clearTimeout(timerTask);
        }, 5);
    }

    window.nextalkMain = main;
})();

document.write('<link rel="stylesheet" type="text/css" href="' + nextalkResPath
        + 'css/mzen.css" />');
document.write('<link rel="stylesheet" type="text/css" href="' + nextalkResPath
        + 'css/glyphicons.css" />');
document.write('<link rel="stylesheet" type="text/css" href="' + nextalkResPath
        + 'css/nextalk-webui.css" />');
document.write('<script type="text/javascript" src="' + nextalkResPath
        + 'script/jquery.min.js"></script>');
document.write('<script type="text/javascript" src="' + nextalkResPath
        + 'script/nextalk-webim.js"></script>');
document.write('<script type="text/javascript" src="' + nextalkResPath
        + 'script/nextalk-webui.js"></script>');

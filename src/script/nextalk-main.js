/**
 * 程序入口
 */
(function() {

    "use strict";

    // NexTalkWebUI初始化参数
    var main = {
        // 通信令牌 暂时不用
        // ticket : 'ticket',
        // APP_KEY 暂时不用
        // appKey : 'app_key',
        // 是否是隐藏式运行
        hidden : false,
        // 以iframe嵌入网页右下角
        iframe : false,
        // 是否是手机端
        mobile : false,
        // 简单聊天对话框
        simple : false,
        // 引入资源文件的根路径
        resPath : '/',
        // API根路径
        apiPath : '/',
        // API路由
        route : {},
        // 默认聊天对象
        chatObj : null,
        chatlinkIds : null,
        chatlinkEls : null,
        onPresences : null,
        onNotReadChange : null
    };
    main.setConfig = function(ops) {
        if (ops) {
            for (var key in ops) {
                this[key] = ops[key];
            }
        }
        this._loadDep();
    };
    // 依赖包是否加载完成
    main.depFlag = false;
    main._loadDep = function() {
        var _this = this;

		if (typeof _this.hidden == 'boolean'
            && _this.hidden == true) {
            _this._loadDepHidden();
            return;
        }
        if (typeof _this.iframe == 'boolean'
            && _this.iframe == true) {
            _this._loadDepIframe();
            return;
        }

        _this._loadDepMail();
    };
    main._loadDepMail = function() {
        var _this = this;
        document.write('<link rel="stylesheet" type="text/css" href="'
                + _this.resPath + 'css/mzen.css" />');
        document.write('<link rel="stylesheet" type="text/css" href="'
                + _this.resPath + 'css/glyphicons.css" />');
        document.write('<link rel="stylesheet" type="text/css" href="'
                + _this.resPath + 'css/nextalk-webui.css" />');
        document.write('<script type="text/javascript" src="' + _this.resPath
                + 'script/jquery.min.js"></script>');
        document.write('<script type="text/javascript" src="' + _this.resPath
                + 'script/nextalk-webim.js"></script>');
        document.write('<script type="text/javascript" src="' + _this.resPath
                + 'script/nextalk-chatbox.js"></script>');
        var task = window.setInterval(function() {
            if (!window.$) {
                return;
            }
            if (!window.NexTalkWebIM) {
                return;
            }
            if (!window.NexTalkWebUI) {
                return;
            }
            window.clearInterval(task);
            _this.depFlag = true;
        }, 200);
    };
    main._loadDepIframe = function() {
        var _this = this;
        document.write('<link rel="stylesheet" type="text/css" href="'
                + _this.resPath + 'css/nextalk-iframe.css" />');
        document.write('<script type="text/javascript" src="' + _this.resPath
                + 'script/nextalk-iframe.js"></script>');
        var task = window.setInterval(function() {
            if (!window.nextalkTop) {
                return;
            }
            window.clearInterval(task);
            _this.depFlag = true;
        }, 200);
    };
    main._loadDepHidden = function() {
        var _this = this;
        document.write('<script type="text/javascript" src="' + _this.resPath
                + 'script/nextalk-webim.js"></script>');
        var task = window.setInterval(function() {
            if (!window.NexTalkWebIM) {
                return;
            }
            window.clearInterval(task);
            _this.depFlag = true;
        }, 200);
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
        var task = window.setInterval(function() {
            if (_this.depFlag) {
                window.clearInterval(task);
                _this._go()
            }
        }, 200);
    };
    main._go = function() {
        var _this = this;
        if (typeof _this.iframe == 'boolean'
            && _this.iframe == true) {
            _this._goIframe();
        } else if (typeof _this.hidden == 'boolean'
            && _this.hidden == true) {
            _this._goHidden();
        } else {
            _this._goMain();
        }
    };
    main._goMain = function() {
        var _this = this;
        NexTalkWebIM.WebAPI.route(_this.route);
        var webui = NexTalkWebUI.init({
            resPath : _this.resPath,
            apiPath : _this.apiPath,
            mobile : _this.mobile,
            simple : _this.simple,
            chatObj : _this.chatObj,
            chatlinkIds : _this.chatlinkIds,
            chatlinkEls : _this.chatlinkEls,
            onPresences : _this.onPresences,
            onNotReadChange : _this.onNotReadChange
        });
        webui.connectServer();
    };
    main._goHidden = function() {
        var _this = this;
        NexTalkWebIM.WebAPI.route(_this.route);
        var webim = NexTalkWebIM.init({
            resPath : _this.resPath,
            apiPath : _this.apiPath,
            chatlinkIds : _this.chatlinkIds
        });
        webim.setLoginStatusListener({
            onLogin : function(ev, data) {
                
            },
            onLoginWin : function(ev, data) {
                
            },
            onLoginFail : function(ev, data) {
                
            }
        });
        webim.setConnStatusListener({
            onConnecting : function(ev, data) {
                
            },
            onConnected : function(ev, data) {
                if (_this.onPresences) {
                    _this.onPresences(webim.presences);
                }
            },
            onDisconnected : function(ev, data) {
                
            },
            onNetworkUnavailable : function(ev, data) {
                
            }
        });
        webim.setReceiveMsgListener({
            onMessage : function(ev, data) {
                
            },
            onPresences : function(ev, data) {
                if (_this.onPresences) {
                    _this.onPresences(data);
                }
            },
            onStatus : function(ev, data) {
                
            }
        });
        webim.connectServer();
    };
    main._goIframe = function() {
        var _this = this;
        nextalkTop.config = {
            // 引入资源文件的根路径
            resPath : _this.resPath,
            // API根路径
            apiPath : _this.apiPath,
            // 简易聊天UI
            simple : _this.simple,
            // 默认聊天对象
            chatObj : _this.chatObj,
            onPresences : _this.onPresences,
            chatlinkIds : _this.chatlinkIds,
            chatlinkEls : _this.chatlinkEls,
            // API路由
            route : _this.route
        };
        nextalkTop.go();
        // 将nextalkMain销毁
        delete window.nextalkMain;
    };

    var top = window.top;
    if (top != window.self) {
        // 获取父窗体中的配置
        main.setConfig(top.nextalkTop.config);
    }

    window.nextalkMain = main;
})();


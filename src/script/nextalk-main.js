/**
 * 程序入口
 */
(function() {

    "use strict";

    function extend() {
        // copy reference to target object
        var target = arguments[0] || {}, i = 1, length = arguments.length, deep = false, options;

        // Handle a deep copy situation
        if (typeof target === "boolean") {
            deep = target;
            target = arguments[1] || {};
            // skip the boolean and the target
            i = 2;
        }

        // Handle case when target is a string or something (possible in deep
        // copy)
        if (typeof target !== "object" && !isFunction(target))
            target = {};
        for (; i < length; i++)
            // Only deal with non-null/undefined values
            if ((options = arguments[i]) != null)
                // Extend the base object
                for ( var name in options) {
                    var src = target[name], copy = options[name];

                    // Prevent never-ending loop
                    if (target === copy)
                        continue;

                    // Recurse if we're merging object values
                    if (deep && copy && typeof copy === "object"
                            && !copy.nodeType)
                        target[name] = extend(deep,
                        // Never move original objects, clone them
                        src || (copy.length != null ? [] : {}), copy);

                    // Don't bring in undefined values
                    else if (copy !== undefined)
                        target[name] = copy;

                }

        // Return the modified object
        return target;
    }

    // NexTalkWebUI初始化参数
    var main = {
        // 通信令牌 暂时不用
        // ticket : 'ticket',
        // APP_KEY 暂时不用
        // appKey : 'app_key',
        // 以iframe嵌入网页
        iframe : false,
        // 简单聊天对话框
        simple : false,
        // 是否是手机端
        mobile : false,
        // 引入资源文件的根路径
        resPath : window.nextalkResPath,
        // API根路径
        apiPath : '/',
        // API路由
        route : {}
    };
    main.setConfig = function(ops) {
        extend(this, ops || {});
        this._loadDep();
    };
    // 依赖包是否加载完成
    main.depFlag = false;
    main._loadDep = function() {
        var _this = this;

        if (typeof _this.iframe == 'boolean'
            && _this.iframe == true) {
            _this._loadDepIframe();
            return;
        }
        if (typeof _this.simple == 'boolean'
            && _this.simple == true) {
            _this._loadDepChatbox();
            return;
        }

        _this._loadDepMail();
    };
    main._loadDepChatbox = function() {
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
                + 'script/nextalk-webui.js"></script>');
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
        } else if (typeof _this.simple == 'boolean'
            && _this.simple == true) {
            _this._goChatbox();
        } else {
            _this._goMain();
        }
    };
    main._goMain = function() {
        var _this = this;
        NexTalkWebIM.WebAPI.route(_this.route);
        _this._loadHTML(function() {
            var ui = NexTalkWebUI.init(_this.appKey, {
                resPath : _this.resPath,
                apiPath : _this.apiPath,
                mobile : _this.mobile,
                simple : _this.simple
            });
            ui.connectServer(_this.ticket);
        });
    };
    main._goChatbox = function() {
        var _this = this;
        NexTalkWebIM.WebAPI.route(_this.route);
        var ui = NexTalkWebUI.init(_this.appKey, {
            resPath : _this.resPath,
            apiPath : _this.apiPath,
            mobile : _this.mobile,
            simple : _this.simple
        });
        ui.connectServer(_this.ticket);
    };
    main._goIframe = function() {
        var _this = this;
        nextalkTop.config = {
            simple : _this.simple,
            // 引入资源文件的根路径
            resPath : _this.resPath,
            // API根路径
            apiPath : _this.apiPath,
            // API路由
            route : _this.route
        };
        nextalkTop.go();
        // 将nextalkMain销毁
        delete window.nextalkMain;
    };
    window.nextalkMain = main;

    var top = window.top;
    if (top != window.self) {
        // 获取父窗体中的配置
        main.setConfig(top.nextalkTop.config);
    }
})();


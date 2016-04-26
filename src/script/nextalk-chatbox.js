/*!
 * nextalk-webui.js v0.0.1
 * http://nextalk.im/
 *
 * Copyright (c) 2014 NexTalk
 *
 */

(function(IM, undefined) {

    "use strict";

    var NexTalkWebUI = function() {};
    var UI = NexTalkWebUI;
    IM.ClassEvent.on(UI);

    // ---------------------------------------

    /** 版本号 */
    UI.VERSION = UI.version = UI.v = "0.0.1";

    /** 默认配置信息 */
    UI.DEFAULTS = $.extend({}, IM.DEFAULTS, {
        // 是否是手机端
        mobile : false,
        // 简单聊天对话框
        simple : false,
        // 默认聊天对象
        chatObj : null,
        chatlinkEls : null,
        onPresences : null,
        onNotReadChange : null
    });

    // 实例化NexTalkWebUI类对象----------------

    /** 实例化一个客户端 */
    UI._instance = undefined;
    /**
     * 获取实例化的客户端
     */
    UI.getInstance = function() {
        if (!UI._instance) {
            throw new Error("NexTalkWebUI is not initialized.");
        }
        return UI._instance;
    };

    /**
     * 初始化NexTalkWebUI
     */
    UI.init = function(options) {
        if (!UI._instance) {
            UI._instance = new UI();
        }
        UI.getInstance()._init(options);
        return UI.getInstance();
    };

    UI.$ = function(html) {
        var $h = $(html);
        $('img', $h).each(function(i, el) {
            $(el).error(function() {
                $(this).attr('src', IM.imgs.HEAD);
            });
        });
        return $h;
    };

    UI.prototype.version = UI.VERSION;

    UI.prototype._init = function(options) {
        var _this = this;
        options = _this.options = $.extend({}, UI.DEFAULTS, options || {});

        // 界面元素根节点body
        _this.$body = $('body');

        _this.welcomeUI = {
            HTML : '<div class="nextalk-page nextalk-screen-full nextalk-page-login"\
                            id="nextalk_page_init">\
                            <div class="mzen-content\
                                mzen-flex-col mzen-flex-center">\
                            <img alt="logo" src="" data-toggle="logo"/>\
                            <p>一起来聊聊</p></div>\
                    </div>',
            init : function() {
                var _ui = this;
                _ui.$html = UI.$(_ui.HTML).hide();
                var $imgs = $('[data-toggle=logo]', _ui.$html);
                $imgs.each(function() {
                    $(this).attr('src', options.resPath + 'imgs/logo.png');
                });
                _ui.$html.appendTo(_this.$body);
            },
            show : function() {
                this.$html.show();
            },
            hide : function() {
                this.$html.hide();
            }
        };
        _this.welcomeUI.init();
        _this.welcomeUI.show();
        _this.loginUI = {
            HTML : '<div class="nextalk-page nextalk-screen-full nextalk-page-login"\
                            id="nextalk_page_login">\
                            <div class="mzen-content\
                                mzen-flex-col mzen-flex-center">\
                            <img alt="logo" src="" data-toggle="logo"/>\
                            <p>正在登入中...</p>\
                            <button class="mzen-btn mzen-btn-danger">重新登入</button>\
                            </div>\
                    </div>',
            init : function() {
                var _ui = this;
                _ui.$html = UI.$(_ui.HTML).hide();
                _ui.$btn = $('button', _ui.$html).hide();
                _ui.$p = $('p', _ui.$html);
                _ui._handler();
                _ui.$html.appendTo(_this.$body);
            },
            show : function() {
                this.$html.show();
            },
            hide : function() {
                this.$html.hide();
            },
            _handler : function() {
                var _ui = this;
                var $imgs = $('[data-toggle=logo]', _ui.$html);
                $imgs.each(function() {
                    $(this).attr('src', options.resPath + 'imgs/logo.png');
                });
                _ui.$btn.click(function() {
                    _this._connectServer();
                });
            }
        };
        _this.loginUI.init();
        
        // 定义主要的界面
        if (typeof options.simple == 'boolean'
                && options.simple) {
            _this.mainUI = new SimpleUI();
        } else {
            _this.mainUI = new MainUI();
        }
        _this.$body.append(_this.mainUI.$html);

        // 界面渲染完成
        // -----------------------------------------------------

        // 初始化监听器
        _this._initLisenters();
        _this._initTimerTask();

        // 初始化NexTalkWebIM
        _this.webim = IM.init(options);
        _this.webim.setLoginStatusListener({
            onLogin : function(ev, data) {
                _this.onLogin(ev, data);
            },
            onLoginWin : function(ev, data) {
                _this.onLoginWin(ev, data);
            },
            onLoginFail : function(ev, data) {
                _this.onLoginFail(ev, data);
            }
        });
        _this.webim.setConnStatusListener({
            onConnecting : function(ev, data) {
                _this.onConnecting(ev, data);
            },
            onConnected : function(ev, data) {
                _this.onConnected(ev, data);
            },
            onDisconnected : function(ev, data) {
                _this.onDisconnected(ev, data);
            },
            onNetworkUnavailable : function(ev, data) {
                _this.onNetworkUnavailable(ev, data);
            }
        });
        _this.webim.setReceiveMsgListener({
            onMessage : function(ev, data) {
                _this.onMessage(ev, data);
            },
            onPresences : function(ev, data) {
                _this.onPresences(ev, data);
                if (_this.options.onPresences) {
                    _this.options.onPresences(data);
                }
            },
            onStatus : function(ev, data) {
                _this.onStatus(ev, data);
            }
        });
        
        return _this;
    };

    /**
     * 定义或开启部分定时任务
     */
    UI.prototype._initTimerTask = function() {
        var _this = this, mainUI = _this.mainUI;
        
        // 关闭所有定时任务
        _this.stopAllTask = function() {
            _this.loginTask.stop();
            _this.showTask.stop();
        };
        
        // 正在登入的动画效果
        _this.loginTask = {
            _interval : null,

            start : function() {
                window.clearInterval(this._interval);

                var $p = _this.loginUI.$p;
                var tit = '正在登入中...';
                var point = '...';
                $p.text(tit);

                var i = 0;
                var n = point.length + 1;
                var index = tit.indexOf(point);
                this._interval = window.setInterval(function() {
                    $p.text(tit.substring(0, index + i));
                    i++;
                    if (i == n) {
                        i = 0;
                    }
                }, 600);
            },

            stop : function() {
                window.clearInterval(this._interval);
            }
        };

        // 现场状态切换动画
        _this.showTask = {
            _interval : null,
            colors : ['available', 'dnd', 'away',
                      'invisible', 'chat', 'unavailable'],

            start : function() {
                window.clearInterval(this._interval);
                
                var $avatar = $('a', mainUI.$currUser);
                var colors = this.colors;
                var num = colors.length;
                for (var k = 0; k < num; k++) {
                    $avatar.removeClass(colors[k]);
                }
                
                var i = 0;
                this._interval = window.setInterval(function() {
                    for (var k = 0; k < num; k++) {
                        $avatar.removeClass(colors[k]);
                    }
                    $avatar.addClass(colors[i]);
                    i++;
                    if (i == num) {
                        i = 0;
                    }
                }, 500);
            },

            stop : function() {
                window.clearInterval(this._interval);
                
                var $avatar = $('a', mainUI.$currUser);
                var colors = this.colors;
                for (var k = 0; k < colors.length; k++) {
                    $avatar.removeClass(colors[k]);
                }
            }
        };
        // 启动现场状态切换动画
        _this.showTask.start();
    };

    UI.prototype._initLisenters = function() {
        var _this = this;

        _this.bind('nextalk.resizable', function(ev, data) {
            _this.mainUI.resizable();
        });
        $(window).resize(function() {
            _this.trigger('nextalk.resizable', []);
        });
    };

    UI.prototype.connectServer = function() {
        var _this = this;
        window.setTimeout(function() {
            _this._connectServer();
        }, 1500);
    };

    UI.prototype._connectServer = function() {
        var _this = this;
        _this.welcomeUI.hide();
        _this.webim.connectServer();
    }

    /** 定义聊天盒子存储空间 */
    UI.prototype._chatBoxUIs = {
        // 系统通知盒子
        notification : undefined,
        // 房间聊天盒子
        room : {},
        // 私信聊天盒子
        chat : {},

        get : function(boxType, key) {
            if (boxType == ChatBoxUI.NOTIFICATION)
                return this[boxType];
            return this[boxType][key];
        },

        set : function(boxType, key, value) {
            var _this = this;
            if (boxType == ChatBoxUI.NOTIFICATION) {
                _this[boxType] = value;
                return;
            }
            _this[boxType][key] = value;
        },

        hideAll : function() {
            if (this[ChatBoxUI.NOTIFICATION]) {
                this[ChatBoxUI.NOTIFICATION].hide();
            }
            for (var key in this[ChatBoxUI.ROOM]) {
                this[ChatBoxUI.ROOM][key].hide();
            }
            for (var key in this[ChatBoxUI.CHAT]) {
                this[ChatBoxUI.CHAT][key].hide();
            }
        }
    };

    UI.prototype.openChatBoxUI = function(boxType, id, name, avatar) {
        var _this = this;
        // 隐藏所有的盒子
        _this._chatBoxUIs.hideAll();
        var boxUI = _this._chatBoxUIs.get(boxType, id);
        if (!boxUI) {
            boxUI = new ChatBoxUI(boxType, id, name, avatar);
            _this._chatBoxUIs.set(boxType, id, boxUI);
        }
        boxUI.show();
    };

    $.extend(UI.prototype, {
        onLogin : function(ev, data) {
            var _this = this;
            var mainUI = _this.mainUI;
            mainUI.hideTips();

            if (_this.webim.loginTimes > 0) {
                mainUI.showConnecting();
                return;
            }

            _this.loginTask.start();
            _this.loginUI.$btn.hide();
            _this.loginUI.show();
        },
        onLoginWin : function(ev, data) {
            var _this = this;
            _this.mainUI.setCurrName();
            _this.loginTask.stop();
            _this.loginUI.hide();
            _this.mainUI.resizable();
        },
        onLoginFail : function(ev, data) {
            var _this = this, mainUI = _this.mainUI;
            _this.stopAllTask();
            _this.loginUI.$p.text('登入失败');
            _this.loginUI.show();
            // 界面上出现重新登入按钮
            _this.loginUI.$btn.show();
        },
        onConnecting : function(ev, data) {
            var _this = this, mainUI = _this.mainUI;
            mainUI.showConnecting();
        },
        onConnected : function(ev, data) {
            var _this = this, mainUI = _this.mainUI;
            mainUI.showConnected();
            mainUI.setCurrName();
            mainUI.avatar();
            // 加载会话列表
            mainUI.loadRecently();
            // 触发状态事件
            if (_this.options.onPresences) {
                _this.options.onPresences(_this.webim.presences);
            }
            // 处理外界元素
            var chatlinkEls = _this.options.chatlinkEls;
            if (chatlinkEls) {
                for (var i = 0; i < chatlinkEls.length; i++) {
                    var $els = $(chatlinkEls[i]);
                    $els.click(function() {
                        var $btn = $(this);
                        var id = $btn.attr('data-id');
                        var name = $btn.attr('data-name');
                        var avatar = $btn.attr('data-avatar');
                        if (!avatar || avatar == '') {
                            avatar = IM.imgs.HEAD;
                        }
                        _this.openChatBoxUI(ChatBoxUI.CHAT, id, name, avatar);
                    });
                }
            }
        },
        onDisconnected : function(ev, data) {
            var _this = this, mainUI = _this.mainUI;
            mainUI.showDisconnected();
            _this.stopAllTask();
            mainUI.avatar();
        },
        onNetworkUnavailable : function(ev, data) {
            var _this = this, mainUI = _this.mainUI;
            mainUI.showNetwork();
            _this.stopAllTask();
            mainUI.avatar();
        },
        onMessage : function(ev, data) {
            var _this = this, boxUIs = _this._chatBoxUIs;
            for (var i = 0; i < data.length; i++) {
                var msg = data[i];
                var chatBoxUI;
                // 如果是自己发送出去的
                if (msg.direction == IM.msgDirection.SEND) {
                    chatBoxUI = boxUIs.get(msg.type, msg.to);
                    if (chatBoxUI) {
                        chatBoxUI.sendHTML(msg);
                        if (chatBoxUI.focus == true) {
                            // 设置为已读
                            _this.webim.setRead(msg.type, msg.to, msg);
                        }
                    }
                    // 处理会话列表
                    _this.mainUI.loadItem(msg.type, msg.to, msg);
                } else {
                    chatBoxUI = boxUIs.get(msg.type, msg.from);
                    if (chatBoxUI) {
                        chatBoxUI.receiveHTML(msg);
                        if (chatBoxUI.focus == true) {
                            // 设置为已读
                            _this.webim.setRead(msg.type, msg.from, msg);
                        }
                    }
                    // 处理会话列表
                    _this.mainUI.loadItem(msg.type, msg.from, msg);
                }
            }
        },
        onStatus : function(ev, data) {
            
        },
        onPresences : function(ev, data) {
            
        }
    });
    
    /**
     * 完整的聊天界面
     */
    var MainUI = function() {
        
    };
    /**
     * 简单的聊天界面
     */
    var SimpleUI = function() {
        var _this = this;
        _this.$html = UI.$(SimpleUI.HTML);
        _this.$header = $('header', this.$html);
        _this.$title = $('.mzen-title', _this.$header);
        _this.$currUser = $('.nextalk-user', _this.$header);
        _this.$conversations = $('#nextalk_conversations', _this.$html);
        _this.$items = $('>.mzen-list-view', _this.$conversations);
        _this.msgTipsUI = new MsgTipsUI();
        _this.$html.append(_this.msgTipsUI.$html);
        _this.handler();
    };
    SimpleUI.HTML = '<div class="mzen-border-r nextalk-page chatbox" id="nextalk_page_main">\
                        <header class="mzen-bar mzen-bar-nav mzen-bar-white">\
                                <div class="mzen-pull-right nextalk-user">\
                                <a class="mzen-img mzen-tap-active\
                                        mzen-up-hover">\
                                <img class="mzen-img-object" src="" data-toggle="head"/>\
                                </a>\
                                <ul class="dropdown-menu">\
                                <li data-show="available">在线\
                                    <i class="nextalk-show available"></i>\
                                </li>\
                                <li data-show="dnd">忙碌\
                                    <i class="nextalk-show dnd"></i>\
                                </li>\
                                <li data-show="away">离开\
                                    <i class="nextalk-show away"></i>\
                                </li>\
                                <li data-show="invisible">隐身\
                                    <i class="nextalk-show invisible"></i>\
                                </li>\
                                <li data-show="unavailable">离线\
                                    <i class="nextalk-show unavailable"></i>\
                                    <i class="mzen-iconfont mzen-icon-check"></i>\
                                </li>\
                                </ul>\
                                </div>\
                                <div class="mzen-title">???</div>\
                                <a class="mzen-pull-left mzen-img nextalk-logo">\
                                <img class="mzen-img-object" src="" data-toggle="logo"/>\
                                </a>\
                        </header>\
                        <div class="nextalk-scroll" id="nextalk_conversations">\
                        <ul class="mzen-list-view"></ul>\
                        </div>\
                    </div>';
    SimpleUI.CONVERSATION = '<li class="mzen-list-view-cell mzen-img mzen-tap-active mzen-up-hover">\
                                <img class="mzen-img-object mzen-pull-left" src="">\
                                <div class="mzen-img-body">\
                                    <p class="mzen-ellipsis-1">???</p>\
                                </div>\
                                <span class="mzen-badge mzen-badge-danger mzen-pull-right">???</span>\
                             </li>';
    SimpleUI.prototype.handler = function() {
        var _this = this, ops = UI.getInstance().options;
        $('[data-toggle=logo]', _this.$html).each(function() {
            $(this).attr('src', ops.resPath + 'imgs/webim.72x72.png');
        });
        $('[data-toggle=head]', _this.$html).each(function() {
            $(this).attr('src', ops.resPath + 'imgs/head_def.png');
        });
        _this.$currUser.click(function() {
            $('.dropdown-menu', $(this)).slideToggle();
        });
        //_this.$currUser.find('ul').css('right', 'initial');
        $('.dropdown-menu li', _this.$currUser).each(function(i, el) {
            $(el).click(function() {
                var webim = IM.getInstance();
                UI.getInstance().showTask.start();
                var show = $(el).attr('data-show');
                if (show == IM.show.UNAVAILABLE) {
                    webim.offline(function() {
                        _this.avatar();
                    });
                } else {
                    webim.online(show, function() {
                        _this.avatar();
                    });
                }
            });
        });

        _this.$items.empty();
        _this.$conversations.css({
            'background-color' : 'white',
            'overflow' : 'auto'
        });
    };
    SimpleUI.prototype.avatar = function() {
        var _this = this;
        var webim = IM.getInstance();
        var webui = UI.getInstance();
        var show = webim.getShow();

        if (webim.connStatus == IM.connStatus.CONNECTED) {
            var u = webim.getCurrUser();
            $('img', _this.$currUser).attr('src', u.avatar);
            $('img', _this.$currUser).attr('alt', u.nick);
            $('a', _this.$currUser).attr('title', u.nick);
        }

        webui.showTask.stop();
        $('a', _this.$currUser).addClass(show);
        
        $('ul li', _this.$currUser).each(function(i, el) {
            var $el = $(el);
            $('.mzen-iconfont', $el).remove();
            if ($el.attr('data-show') == show) {
                $(el).append('<i class="mzen-iconfont mzen-icon-check"></i>');
            }
        });
    };
    SimpleUI.prototype.setCurrName = function() {
        var webim = IM.getInstance();
        var u = webim.getCurrUser();
        this.$title.text(u.nick);
    };
    SimpleUI.prototype.itemHTML = function() {
        var $item = UI.$(SimpleUI.CONVERSATION);
        if (arguments.length == 1) {
            var user = arguments[0];
            $item.attr('data-toggle', ChatBoxUI.CHAT);
            $item.attr('data-id', user.id);
            $item.attr('data-name', user.nick);
            $('img', $item).attr('src', user.avatar);
            $('p', $item).text(user.nick);
            $('span', $item).remove();
        } else if (arguments.length == 2) {
            var dInfo = arguments[0];
            var body = arguments[1];
            $item.attr('data-toggle', dInfo.msgType);
            $item.attr('data-id', dInfo.other);
            $item.attr('data-name', dInfo.name);
            $('img', $item).attr('src', dInfo.avatar);
            $('p', $item).text(dInfo.name);
            if (dInfo.notCount != 0) {
                $('span', $item).text(dInfo.notCount);
            } else {
                $('span', $item).remove();
            }
        }
        return $item;
    };
    SimpleUI.prototype.resizable = function() {
        var _this = this, $html = this.$html;
        var $w = $(window);
        var wh = $w.height();
        var ww = $w.width();
        $html.width(270);
        var hh = _this.$header.height();
        _this.$conversations.height(wh - hh);
    };
    SimpleUI.prototype.itemsClick = function() {
        var webui = UI.getInstance();
        var $items = this.$items;

        $('>li', $items).each(function(i, el) {
            var item = $(el);
            if (item.data('events') &&
                    item.data('events')['click'])
                return;

            // 点击启动一个新的聊天盒子
            item.click(function() {
                var imgSrc = item.find('img').attr('src');
                if (item.attr('data-toggle') == ChatBoxUI.NOTIFICATION) {
                    webui.openChatBoxUI(ChatBoxUI.NOTIFICATION,
                            ChatBoxUI.NOTIFICATION,
                            IM.name.NOTIFICATION, imgSrc);
                    return;
                }

                var dataId = item.attr('data-id');
                if (!dataId || dataId == '') {
                    return;
                }

                var name = item.attr('data-name');
                if (item.attr('data-toggle') == ChatBoxUI.ROOM) {
                    webui.openChatBoxUI(ChatBoxUI.ROOM,
                            dataId, name, imgSrc);
                    return;
                }
                if (item.attr('data-toggle') == ChatBoxUI.CHAT) {
                    webui.openChatBoxUI(ChatBoxUI.CHAT,
                            dataId, name, imgSrc);
                    return;
                }
            });
        });
    };
    SimpleUI.prototype.loadItem = function(msgType, other, msg) {
        var _this = this, webim = IM.getInstance();
        var $items = _this.$items;

        $('>li', $items).each(function(i, el) {
            var $el = $(el);
            if ($el.attr('data-toggle') == msgType
                    && $el.attr('data-id') == other) {
                $el.remove();
                // break
                return false;
            }
        });
        var dInfo = webim.getDialogInfo(msgType, other);
        _this.itemHTML(dInfo, msg.body).prependTo($items);

        // 设置底部的未读数据
        _this.showNotReadTotal();
        _this.itemsClick();
    };
    SimpleUI.prototype.loadRecently = function() {
        var _this = this, webim = IM.getInstance();
        var webui = UI.getInstance();
        var ops = webui.options;
        var $items = _this.$items.empty();
        
        var buddies = webim.getBuddies();
        if (buddies && buddies.length > 0) {
            for (var i = 0; i < buddies.length; i++) {
                $items.append(_this.itemHTML(buddies[i]));
            }
        }
        if (webim.connectedTimes == 1 && ops.chatObj) {
            $('>li', $items).each(function(i, el) {
                var $el = $(el);
                if ($el.attr('data-toggle') == IM.msgType.CHAT
                        && $el.attr('data-id') == ops.chatObj.id) {
                    $el.remove();
                    // break
                    return false;
                }
            });
            var avatar = ops.chatObj.avatar;
            if (!avatar || avatar == '') {
                avatar = IM.imgs.HEAD;
            }
            _this.itemHTML({
                id : ops.chatObj.id,
                nick : ops.chatObj.name,
                avatar : avatar}).prependTo($items);
            webui.openChatBoxUI(ChatBoxUI.CHAT, ops.chatObj.id,
                    ops.chatObj.name, avatar);
        }
        _this.itemsClick();
    };
    SimpleUI.prototype.showNotReadTotal = function() {
        //.???<span class="aui-badge aui-badge-danger">12</span>
        var webui = UI.getInstance();
        var webim = IM.getInstance();
        var total = webim.getNotReadTotal();
        if (webui.options.onNotReadChange) {
            webui.options.onNotReadChange(total);
        }
    };
    SimpleUI.prototype.showTipsTask = undefined;
    SimpleUI.prototype.showConnecting = function() {
        window.clearTimeout(this.showTipsTask);
        this.msgTipsUI.show('正在连接...', 'mzen-tips-info');
    };
    SimpleUI.prototype.showConnected = function() {
        var _this = this;
        window.clearTimeout(_this.showTipsTask);
        _this.msgTipsUI.show('连接成功...', 'mzen-tips-success');
        _this.showTipsTask = setTimeout(function() {
            _this.hideTips();
        }, 5000);
    };
    SimpleUI.prototype.showDisconnected = function() {
        window.clearTimeout(this.showTipsTask);
        this.msgTipsUI.show('连接断开...', 'mzen-tips-danger');
    };
    SimpleUI.prototype.showNetwork = function() {
        window.clearTimeout(this.showTipsTask);
        this.msgTipsUI.show('网络不可用...', 'mzen-tips-danger');
    };
    SimpleUI.prototype.hideTips = function() {
        this.msgTipsUI.hide();
    };

    /**
     * 各种消息提示条
     */
    var MsgTipsUI = function() {
        var _this = this;
        _this.$html = UI.$(MsgTipsUI.HTML);
        _this.$html.hide();
    };
    MsgTipsUI.HTML = '<div class="mzen-tips mzen-tips-info nextalk-msg-tips">\
                        <div class="mzen-tips-content mzen-ellipsis-1">\
                            <i class="mzen-iconfont mzen-icon-warnfill"></i>\
                            <span>???</span>\
                        </div>\
                      </div>';
    MsgTipsUI.CLASSES = ['mzen-tips-danger',
                         'mzen-tips-info',
                         'mzen-tips-success'];
    MsgTipsUI.prototype.show = function(title, cla) {
        var _this = this, $html = _this.$html;
        var claes = MsgTipsUI.CLASSES;
        
        for (var i = 0; i < claes.length; i++) {
            $html.removeClass(claes[i]);
        }
        
        $('span', $html).text(title);
        $html.addClass(cla);
        $html.show();
    };
    MsgTipsUI.prototype.hide = function() {
        this.$html.hide();
    };

    /**
     * 聊天盒子类
     */
    var ChatBoxUI = function(type, id, name, avatar) {
        var _this = this;
        _this.type = type;
        _this.id = id;
        _this.name = name;
        _this.avatar = avatar;
        _this.focus = false;
        _this.times = 0;

        var $body = UI.getInstance().$body;
        var $html = UI.$(ChatBoxUI.HTML);
        _this.$html = $html;

        _this.$bBody = $('.nextalk-wrap', $html);
        _this.$bBody.empty();

        _this.handleHTML();
        $html.appendTo($body);

        UI.getInstance().bind('nextalk.resizable',
                function(ev, data) {
                    _this.resizable();
        });
    };

    // 聊天盒子类型
    ChatBoxUI.NOTIFICATION = IM.msgType.NOTIFICATION;
    ChatBoxUI.CHAT = IM.msgType.CHAT;
    ChatBoxUI.ROOM = IM.msgType.ROOM;
    // 聊天盒子模板
    ChatBoxUI.HTML = '<div class="nextalk-page nextalk-screen-right chatbox"\
                            id="nextalk_page_chatbox" style="display: none;">\
                        <!--头部集合 BEGIN-->\
                        <header class="mzen-bar mzen-bar-nav mzen-bar-white">\
                            <div class="mzen-pull-left mzen-tap-active nextalk-user">\
                            <a class="mzen-img unavailable">\
                            <img class="mzen-img-object" src="" data-toggle="head">\
                            </a>\
                            </div>\
                            <div class="mzen-title">???</div>\
                        </header>\
                        <!--头部集合 END-->\
                        <div class="nextalk-scroll" id="nextalk_content_chatbox">\
                            <div class="mzen-content-padded nextalk-wrap"></div>\
                        </div>\
                        <!-- 聊天输入筐BEGIN -->\
                        <footer class="mzen-nav">\
                            <form class="mzen-form" onsubmit="return false;">\
                            <div class="nextalk mzen-input-row">\
                                <input type="text" class="mzen-input" placeholder="输入消息内容..."/>\
                            </div>\
                            </form>\
                        </footer>\
                        <!-- 聊天输入筐END -->\
                      </div>';
    ChatBoxUI.SEND = '<p class="mzen-text-center"><span class="time">???</span></p>\
                      <div class="mzen-chat-sender">\
                        <div class="mzen-chat-sender-avatar"><img src=""></div>\
                        <div style="padding-right:70px;text-align:right;" class="nick">???</div>\
                        <div class="mzen-chat-sender-cont">\
                            <div class="mzen-chat-right-triangle"></div>\
                            <span class="body">???</span>\
                        </div>\
                      </div>';
    ChatBoxUI.RECEIVE = '<p class="mzen-text-center"><span class="time">???</span></p>\
                         <div class="mzen-chat-receiver">\
                            <div class="mzen-chat-receiver-avatar"><img src=""></div>\
                            <div style="padding-left:70px;text-align:left;" class="nick">???</div>\
                            <div class="mzen-chat-receiver-cont">\
                                <div class="mzen-chat-left-triangle"></div>\
                                <span class="body">???</span>\
                            </div>\
                         </div>';

    ChatBoxUI.prototype.resizable = function() {
        var _this = this;
        var $html = _this.$html;
        var $w = $(window);
        var wh = $w.height();
        var ww = $w.width();

        $html.width(ww - 270 -1);

        var hh = $('header', $html).height();
        var fh = $('footer', $html).height();
        var $content = $('#nextalk_content_chatbox', $html);
        $content.height(wh - hh - fh);
    };
    ChatBoxUI.prototype.toBottom = function() {
        var $html = this.$html;
        var $content = $('#nextalk_content_chatbox', $html);
        var $innerContent = $('>.nextalk-wrap', $content);
        var height = $innerContent.height();
        $content.animate({scrollTop : height}, 300);
    };
    ChatBoxUI.prototype.show = function() {
        var _this = this;
        _this.$html.show();
        _this.focus = true;
        _this.times++;

        _this.resizable();
        _this.toBottom();

        var webim = IM.getInstance();
        var webui = UI.getInstance();
        var dInfo = webim.getDialogInfo(_this.type, _this.id);
        if (!dInfo) {
            return;
        }
        // 去除红色的未读数据
        var record = webim.readAll(_this.type, _this.id);
        var $items = webui.mainUI.$items;
        $('>li', $items).each(function(i, el) {
            var $el = $(el);
            if ($el.attr('data-toggle') == _this.type
                    && $el.attr('data-id') == _this.id) {
                if (dInfo.notCount > 0) {
                    $el.find('span.mzen-badge-danger').text(dInfo.notCount);
                } else {
                    $el.find('span.mzen-badge-danger').remove();
                }
                // break
                return false;
            }
        });
        // 设置底部的未读数据
        webui.mainUI.showNotReadTotal();

        // 如果聊天盒子第一次显示，加载内存对话记录和历史对话记录
        if (_this.times > 1) {
            return;
        }

        for (var i = 0, len = record.length; i < len; i++) {
            var msg = record[i];
            if (msg.direction == IM.msgDirection.SEND) {
                _this.sendHTML(msg);
            } else {
                _this.receiveHTML(msg);
            }
        }
    };
    ChatBoxUI.prototype.hide = function() {
        var _this = this;
        _this.$html.hide();
        _this.focus = false;
    };
    ChatBoxUI.prototype.receiveHTML = function(msg) {
        var _this = this;
        var $receive = UI.$(ChatBoxUI.RECEIVE);
        $receive.find('.time').text(msg.timestamp);
        $receive.find('.nick').text(msg.nick);
        $receive.find('img').attr('src', msg.avatar);
        $receive.find('.body').text(msg.body);
        _this.$bBody.append($receive);
        _this.toBottom();
    };
    ChatBoxUI.prototype.sendHTML = function(msg) {
        var _this = this;
        var $send = UI.$(ChatBoxUI.SEND);
        $send.find('.time').text(msg.timestamp);
        $send.find('.nick').text(msg.nick);
        $send.find('img').attr('src', msg.avatar);
        $send.find('.body').text(msg.body);
        _this.$bBody.append($send);
        _this.toBottom();
    };
    ChatBoxUI.prototype.sendMsg = function(body) {
        var _this = this, webim = IM.getInstance();
        var webui = UI.getInstance();
        var currUser = webim.getCurrUser();

        var msg = {
            type : _this.type,
            from : currUser.id,
            nick : currUser.nick,
            avatar : currUser.avatar,
            to : _this.id,
            to_nick : _this.name,
            to_avatar : _this.avatar,
            body : body,
            timestamp : IM.nowStamp()
        };
        _this.sendHTML(msg);
        webim.sendMessage(msg);
        // 处理会话列表
        webui.mainUI.loadItem(msg.type, msg.to, msg);
    };
    ChatBoxUI.prototype.handleHTML = function() {
        var _this = this, $html = _this.$html;
        var ops = UI.getInstance().options;

        if (_this.type == ChatBoxUI.NOTIFICATION) {
            $('footer', $html).hide();
        }
        $html.attr('data-type', _this.type);
        $html.attr('data-id', _this.id);
        $html.attr('data-name', _this.name);
        $('header>.mzen-title', $html).text(_this.name);
        $('[data-toggle=head]', $html).each(function() {
            $(this).attr('src', ops.resPath + 'imgs/head_def.png');
        });
        // 设置在线状态和头像
        $('>header .mzen-pull-left img', $html)
            .attr('src', _this.avatar);

        var $content = $('#nextalk_content_chatbox', $html);
        $content.css('overflow', 'auto');

        $('header>a:first', $html).click(function() {
            _this.hide();
        });
        $('footer form', $html).submit(function() {
            var input = $('input', $(this));
            if ($.trim(input.val()) != '') {
                _this.sendMsg(input.val());
            }
            input.val('');
            return false;
        });
    };

    window.NexTalkWebUI = UI;
})(NexTalkWebIM);

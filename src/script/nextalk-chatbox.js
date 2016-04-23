/*!
 * nextalk-chatbox.js v0.0.1
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
        mobile : false,
        simple : false
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
     * 初始化NexTalkWebUI，在整个应用全局只需要调用一次。
     * 
     * @param {string}
     *                appKey 开发者的appKey
     * @param {object}
     *                options
     * @example NexTalkWebUI.init("app_key");
     */
    UI.init = function(appKey, options) {
        if (!UI._instance) {
            UI._instance = new UI();
        }
        UI.getInstance()._init(appKey, options);
        return UI.getInstance();
    };

    UI.prototype.version = UI.VERSION;

    UI.prototype._init = function(appKey, options) {
        var _this = this;
        options = _this.options = $.extend({}, UI.DEFAULTS, options || {});

        // 界面元素根节点body
        _this.$body = $('body');

        _this.welcomeUI = {
            HTML : '<div class="nextalk-page nextalk-screen-full nextalk-page-login"\
                            id="nextalk_page_init">\
                            <div class="mzen-content\
                                mzen-flex-col mzen-flex-center">\
                            <img alt="logo" src="imgs/logo.png" toggle-data="login"/>\
                            <p>一起来聊聊</p></div>\
                    </div>',
            init : function() {
                var _ui = this;
                _ui.$html = $(_ui.HTML);
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
        _this.loginUI = {
            HTML : '<div class="nextalk-page nextalk-screen-full nextalk-page-login"\
                            id="nextalk_page_login">\
                            <div class="mzen-content\
                                mzen-flex-col mzen-flex-center">\
                            <img alt="logo" src="imgs/logo.png" toggle-data="login"/>\
                            <p>正在登入中...</p>\
                            <button class="mzen-btn mzen-btn-danger">重新登入</button>\
                            </div>\
                    </div>',
            init : function() {
                var _ui = this;
                _ui.$html = $(_ui.HTML);
                _ui.$btn = $('>button', _ui.$html).hide();
                _ui.$p = $('>p.mzen-btn', _ui.$html);
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
                _ui.$btn.click(function() {
                    _this._connectServer(_this._ticket);
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
        _this.webim = IM.init(appKey, options);
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
        var _this = this;
        
        // 关闭所有定时任务
        _this.stopAllTask = function() {
            _this.loginTask.stop();
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

    UI.prototype.connectServer = function(ticket) {
        var _this = this;
        _this._ticket = ticket;
        window.setTimeout(function() {
            _this._connectServer(ticket);
        }, 500);
    };

    UI.prototype._connectServer = function(ticket) {
        var _this = this;
        _this.welcomeUI.hide();
        _this.webim.connectServer({ticket : ticket});
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

    $.extend(UI.prototype, {
        onLogin : function(ev, data) {
            var _this = this, mainUI = _this.mainUI;
            mainUI.hideTips();

            if (_this.webim.loginTime > 0) {
                mainUI.showConnecting();
                return;
            }

            _this.loginUI.$btn.hide();
            _this.loginTask.start();
            _this.loginUI.show();
        },
        onLoginWin : function(ev, data) {
            var _this = this, mainUI = _this.mainUI;
            _this.loginTask.stop();
            _this.loginUI.hide();
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
            setTimeout(function() {
                mainUI.hideTips();
            }, 5000);

            // 加载会话列表
            _this.loadConversations();
        },
        onDisconnected : function(ev, data) {
            var _this = this, mainUI = _this.mainUI;
            mainUI.showDisconnected();
            _this.stopAllTask();
        },
        onNetworkUnavailable : function(ev, data) {
            var _this = this, mainUI = _this.mainUI;
            mainUI.showNetwork();
            _this.stopAllTask();
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
                    _this.loadConversations(msg.type, msg.to, msg);
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
                    _this.loadConversations(msg.type, msg.from, msg);
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
        _this.$html = $(SimpleUI.HTML);
        _this.$conversations = $('#nextalk_conversations', _this.$html);
        _this.$items = $('>.mzen-list-view', _this.$conversations);
        _this.msgTipsUI = new MsgTipUI();
        _this.$conversations.append(_this.msgTipsUI.$html);
    };
    SimpleUI.HTML = '<div class="nextalk-page chatbox" id="nextalk_page_main">\
                        <div class="mzen-border-r">\
                        <header class="mzen-bar mzen-bar-nav mzen-bar-white">\
                                <div class="mzen-pull-left nextalk-user">\
                                <a class="mzen-img mzen-tap-active\
                                        mzen-up-hover">\
                                <img class="mzen-img-object" src=""/>\
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
                            </header>\
                        <div class="nextalk-scroll" id="nextalk_conversations">\
                        <ul class="mzen-list-view">\
                        </ul>\
                        </div>\
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
        var _this = this, $html = this.$html;
        _this.$items.empty();
        _this.$conversations.css({
            'background-color' : 'white',
            'overflow' : 'auto'
        });
    };
    SimpleUI.prototype.itemHTML = function() {
        var $item = $(SimpleUI.CONVERSATION);
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
    }
    SimpleUI.prototype.resizable() {
        var _this = this, $html = this.$html;
        var $w = $(window);
        var wh = $w.height();
        var ww = $w.width();
        $html.width(270);
        var hh = $('header', $html).height();
        _this.$conversations.height(wh - hh);
    };
    SimpleUI.prototype.itemsClick() {
        var webui = UI.getInstance();
        var $items = this.$items;

        $items.each(function(i, el) {
            var item = $(el);
            if (item.data('events') &&
                    item.data('events')['click'])
                return;

            // 点击启动一个新的聊天盒子
            item.click(function() {
                // 隐藏所有的盒子
                webui._chatBoxUIs.hideAll();

                var imgSrc = item.find('img').attr('src');
                if (item.attr('data-toggle') == ChatBoxUI.NOTIFICATION) {
                    var boxUI = webui._chatBoxUIs.get(ChatBoxUI.NOTIFICATION);
                    if (!boxUI) {
                        boxUI = new ChatBoxUI(ChatBoxUI.NOTIFICATION
                                , ChatBoxUI.NOTIFICATION
                                , IM.name.NOTIFICATION, imgSrc);
                        webui._chatBoxUIs.set(ChatBoxUI.NOTIFICATION
                                , ChatBoxUI.NOTIFICATION, boxUI);
                    }
                    boxUI.show();
                    return;
                }

                var dataId = item.attr('data-id');
                if (!dataId || dataId == '') {
                    return;
                }

                var name = item.attr('data-name');
                if (item.attr('data-toggle') == ChatBoxUI.ROOM) {
                    var boxUI = webui._chatBoxUIs.get(ChatBoxUI.ROOM, dataId);
                    if (!boxUI) {
                        boxUI = new ChatBoxUI(ChatBoxUI.ROOM, dataId, name, imgSrc);
                        webui._chatBoxUIs.set(ChatBoxUI.ROOM, dataId, boxUI);
                    }
                    boxUI.show();
                    return;
                }
                if (item.attr('data-toggle') == ChatBoxUI.CHAT) {
                    var boxUI = webui._chatBoxUIs.get(ChatBoxUI.CHAT, dataId);
                    if (!boxUI) {
                        boxUI = new ChatBoxUI(ChatBoxUI.CHAT, dataId, name, imgSrc);
                        webui._chatBoxUIs.set(ChatBoxUI.CHAT, dataId, boxUI);
                    }
                    boxUI.show();
                    return;
                }
            });
        });
    };
    SimpleUI.prototype.loadItem = function(msgType, other, msg) {
        var _this = this, webim = UI.getInstance();
        var $items = _this.items;

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
        itemHTML(dInfo, msg.body).prependTo($items);

        // 设置底部的未读数据
        _this.showNotReadTotal();
        _this.itemsClick();
    };
    SimpleUI.prototype.loadRecently = function() {
        var _this = this, webim = IM.getInstance();
        var $items = _this.$items.empty();
        
        var buddies = webim.getBuddies();
        if (buddies && buddies.length > 0) {
            for (var i = 0; i < buddies.length; i++) {
                $items.append(itemHtml(buddies[i]));
            }
        }
        _this.itemsClick();
    };
    SimpleUI.prototype.showNotReadTotal = function() {
        //.???<span class="aui-badge aui-badge-danger">12</span>
    };
    SimpleUI.prototype.showConnecting = function() {
        this.msgTipsUI.show('正在连接...', 'mzen-tips-info');
    };
    SimpleUI.prototype.showConnected = function() {
        this.msgTipsUI.show('连接成功...', 'mzen-tips-success');
    };
    SimpleUI.prototype.showDisconnect = function() {
        this.msgTipsUI.show('连接断开...', 'mzen-tips-danger');
    };
    SimpleUI.prototype.showNetwork = function() {
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
        _this.$html = $(MsgTipsUI.HTML);
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
        var $html = $(ChatBoxUI.HTML);
        _this.$html = $html;

        _this.$boxBody = $('>.nextalk-wrap', $html);
        _this.$boxBody.empty();

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
                            <img class="mzen-img-object" src="">\
                            </a>\
                            </div>\
                            <div class="mzen-title">???</div>\
                        </header>\
                        <!--头部集合 END-->\
                        <div class="nextalk-scroll" id="nextalk_content_chatbox">\
                            <div class="mzen-content-padded nextalk-wrap">\
                            </div>\
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
    ChatBoxUI.SEND = '<p class="mzen-text-center">???</p>\
                      <div class="mzen-chat-sender">\
                        <div class="mzen-chat-sender-avatar"><img src=""></div>\
                        <div class="mzen-chat-sender-cont">\
                            <div class="mzen-chat-right-triangle"></div>\
                            <span>???</span>\
                        </div>\
                      </div>';
    ChatBoxUI.RECEIVE = '<p class="mzen-text-center">???</p>\
                         <div class="mzen-chat-receiver">\
                            <div class="mzen-chat-receiver-avatar"><img src=""></div>\
                            <div class="mzen-chat-receiver-cont">\
                                <div class="mzen-chat-left-triangle"></div>\
                                <span>???</span>\
                            </div>\
                         </div>';

    ChatBoxUI.prototype.resizable = function() {
        var _this = this;
        var $html = _this.$html;
        var $w = $(window);
        var wh = $w.height();
        var ww = $w.width();

        $html.width(ww - 270);

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
        var webui = IM.getInstance();
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
        var html = '<div class="mzen-chat-receiver">'
            + '<div class="mzen-chat-receiver-avatar">'
            + '<img src="' + msg.avatar + '"></div>'
            + '<div class="mzen-chat-receiver-cont">'
            + '<div class="mzen-chat-left-triangle"></div>'
            + '<span>' + msg.body + '</span></div></div>';
        _this.$boxBody.append(html);
        _this.toBottom();
    };
    ChatBoxUI.prototype.sendHTML = function(msg) {
        var _this = this;
        var html = '<div class="mzen-chat-sender">'
            + '<div class="mzen-chat-sender-avatar">'
            + '<img src="' + msg.avatar + '"></div>'
            + '<div class="mzen-chat-sender-cont">'
            + '<div class="mzen-chat-right-triangle"></div>'
            + '<span>' + msg.body + '</span></div></div>';
        _this.$boxBody.append(html);
        _this.toBottom();
    }
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
        webui.loadConversations(msg.type, msg.to, msg);
    };
    ChatBoxUI.prototype.handleHTML = function() {
        var _this = this, $html = _this.$html;

        if (_this.type == ChatBoxUI.NOTIFICATION) {
            $('footer', $html).hide();
        }
        $html.attr('data-type', _this.type);
        $html.attr('data-id', _this.id);
        $html.attr('data-name', _this.name);
        $('header>.mzen-title', $html).text(_this.name);

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

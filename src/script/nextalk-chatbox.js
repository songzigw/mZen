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
    UI.DEFAULTS = $.extend({}, IM.DEFAULTS);

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

    /**
     * 初始化NexTalkWebUI
     */
    UI.prototype._init = function(appKey, options) {
        var _this = this;
        options = _this.options = $.extend({}, UI.DEFAULTS, options || {});

        // 界面元素定义
        var els = _this.els = {};
        // 元素根节点body
        els.$body = $('body');
        // 消息通知框
        els.$msgBox = $('.mzen-tips.nextalk-msg-box', els.$body).hide();
        // 初始化页面
        els.$initPage = $('#nextalk_page_init', els.$body).show();
        // 登入页面
        els.$loginPage = $('#nextalk_page_login', els.$body).hide();
        els.$loginP = $('.mzen-content p', els.$loginPage);
        els.$loginBtn = $('.mzen-content .mzen-btn', els.$loginPage).hide();
        // 主要界面入口mainPage
        els.$mainPage = $('#nextalk_page_main', els.$body);
        // 联系人回话列表
        els.$mainConversations = $('#nextalk_conversations', els.$mainPage);

        _this.handlerLogin();
        _this.handlerMain();

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
        var _this = this, els = _this.els;
        
        // 关闭所有定时任务
        _this.stopAllTask = function() {
            _this.loginTask.stop();
        };
        
        // 正在登入的动画效果
        _this.loginTask = {
            _interval : null,
            
            start : function() {
                window.clearInterval(this._interval);
                
                var $p = els.$loginP;
                var text = '正在登入中...';
                var point = '...';
                $p.html(text);

                var i = 0;
                var n = point.length + 1;
                var index = text.indexOf(point);
                this._interval = window.setInterval(function() {
                    $p.html(text.substring(0, index + i));
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
            resizableMain(_this.els);
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
        _this.els.$initPage.hide();
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
            var _this = this, els = _this.els;
            hideMsgBox();

            if (_this.webim.loginTime > 0) {
                showMsgBox('正在连接...', 'mzen-tips-info');
                return;
            }

            els.$loginBtn.hide();
            _this.loginTask.start();
            els.$loginPage.show();
        },
        onLoginWin : function(ev, data) {
            var _this = this, els = _this.els;
            _this.loginTask.stop();
            els.$loginPage.hide();
        },
        onLoginFail : function(ev, data) {
            var _this = this, els = _this.els;
            _this.stopAllTask();
            els.$loginP.html('登入失败');
            els.$loginPage.show();
            // 界面上出现重新登入按钮
            els.$loginBtn.show();
        },
        onConnecting : function(ev, data) {
            var _this = this, els = _this.els;
            showMsgBox('正在连接...', 'mzen-tips-info');
        },
        onConnected : function(ev, data) {
            var _this = this, els = _this.els;
            showMsgBox('连接成功...', 'mzen-tips-success');
            setTimeout(function() {
                hideMsgBox();
            }, 5000);

            // 加载会话列表
            _this.loadConversations();
        },
        onDisconnected : function(ev, data) {
            var _this = this, els = _this.els;
            showMsgBox('连接断开...', 'mzen-tips-danger');
            _this.stopAllTask();
        },
        onNetworkUnavailable : function(ev, data) {
            var _this = this, els = _this.els;
            showMsgBox('网络不可用...', 'mzen-tips-danger');
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
     * 各种UI元素的处理方法
     */
    $.extend(UI.prototype, {
        handlerLogin : function() {
            var _this = this, els = _this.els;
            els.$loginBtn.click(function() {
                _this._connectServer(_this._ticket);
            });
        },

        handlerMain : function() {
            var _this = this, els = this.els;
            var $mainConversations = els.$mainConversations;
            var $items = $('>.mzen-list-view', $mainConversations).empty();
            _this._toggleConversations($('>li', $items));

            resizableMain(els);
            els.$mainConversations.css({
                'background-color' : 'white',
                'overflow' : 'auto'
            });
        },

        _showNotReadTotal : function() {
            //.???<span class="aui-badge aui-badge-danger">12</span>
        },

        _toggleConversations : function($items) {
            var _this = this;
            $items.each(function(i, el) {
                var item = $(el);
                if (item.data('events') &&
                        item.data('events')['click'])
                    return;

                // 点击启动一个新的聊天盒子
                item.click(function() {

                    // 隐藏所有的盒子
                    _this._chatBoxUIs.hideAll();

                    var imgSrc = item.find('img').attr('src');
                    if (item.attr('data-toggle') == ChatBoxUI.NOTIFICATION) {
                        var boxUI = _this._chatBoxUIs.get(ChatBoxUI.NOTIFICATION);
                        if (!boxUI) {
                            boxUI = new ChatBoxUI(ChatBoxUI.NOTIFICATION
                                    , undefined
                                    , IM.name.NOTIFICATION, imgSrc);
                            _this._chatBoxUIs.set(ChatBoxUI.NOTIFICATION
                                    , undefined, boxUI);
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
                        var boxUI = _this._chatBoxUIs.get(ChatBoxUI.ROOM, dataId);
                        if (!boxUI) {
                            boxUI = new ChatBoxUI(ChatBoxUI.ROOM, dataId, name, imgSrc);
                            _this._chatBoxUIs.set(ChatBoxUI.ROOM, dataId, boxUI);
                        }
                        boxUI.show();
                        return;
                    }
                    if (item.attr('data-toggle') == ChatBoxUI.CHAT) {
                        var boxUI = _this._chatBoxUIs.get(ChatBoxUI.CHAT, dataId);
                        if (!boxUI) {
                            boxUI = new ChatBoxUI(ChatBoxUI.CHAT, dataId, name, imgSrc);
                            _this._chatBoxUIs.set(ChatBoxUI.CHAT, dataId, boxUI);
                        }
                        boxUI.show();
                        return;
                    }
                });
            });
        },
        
        loadConversations : function(msgType, other, msg) {
            var _this = this, els = _this.els, webim = _this.webim;
            var $mainConversations = els.$mainConversations;
            
            if (typeof msgType == 'undefined') {
                _this.loadRecently();
                return;
            }
            
            //???
            var $items = $('>.mzen-list-view', $mainConversations);
            
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
            htmlConversation(dInfo, msg.body).prependTo($items);
            var $cvnLis = $('>li', $items);
            
            // 设置底部的未读数据
            _this._showNotReadTotal();
            _this._toggleConversations($cvnLis);
        },
        
        loadRecently : function() {
            var _this = this, els = _this.els, webim = _this.webim;
            var $mainConversations = els.$mainConversations;
            var $items = $('>.mzen-list-view', $mainConversations).empty();
            var buddies = webim.getBuddies();
            if (buddies && buddies.length > 0) {
                for (var i = 0; i < buddies.length; i++) {
                    $items.append(htmlConversation(buddies[i]));
                }
            }
            _this._toggleConversations($('>li', $items));
        }

    });

    UI.CONVERSATION = '<li class="mzen-list-view-cell mzen-img mzen-tap-active mzen-up-hover">\
                            <img class="mzen-img-object mzen-pull-left" src="">\
                            <div class="mzen-img-body">\
                                <p class="mzen-ellipsis-1">UserName</p>\
                            </div>\
                            <span class="mzen-badge mzen-badge-danger mzen-pull-right">3</span>\
                        </li>';
    function htmlConversation() {
        var $c = $(UI.CONVERSATION);
        if (arguments.length == 1) {
            var buddy = arguments[0];
            $c.attr('data-toggle', ChatBoxUI.CHAT);
            $c.attr('data-id', buddy.id);
            $c.attr('data-name', buddy.nick);
            $('img', $c).attr('src', buddy.avatar);
            $('p', $c).text(buddy.nick);
            $('span', $c).remove();
        } else if (arguments.length == 2) {
            var dInfo = arguments[0];
            var body = arguments[1];
            $c.attr('data-toggle', dInfo.msgType);
            $c.attr('data-id', dInfo.other);
            $c.attr('data-name', dInfo.name);
            $('img', $c).attr('src', dInfo.avatar);
            $('p', $c).text(dInfo.name);
            if (dInfo.notCount != 0) {
                $('span', $c).text(dInfo.notCount);
            } else {
                $('span', $c).remove();
            }
        }
        return $c;
    }

    function showMsgBox(msg, addClass) {
        var els = UI.getInstance().els;
        var $msgBox = els.$msgBox;
        var tips = ['mzen-tips-danger',
                    'mzen-tips-info',
                    'mzen-tips-success'];
        for (var i = 0; i < tips.length; i++) {
            $msgBox.removeClass(tips[i]);
        }
        
        $msgBox.addClass(addClass);
        $('span', $msgBox).text(msg);
        $msgBox.show();
    }
    function hideMsgBox() {
        var els = UI.getInstance().els;
        var $msgBox = els.$msgBox;
        $msgBox.hide();
    }

    function resizableMain(els) {
        var webui = UI.getInstance();
        var $w = $(window);
        var wh = $w.height();
        var ww = $w.width();
        
        els.$mainPage.width(270);
        
        els.$mainConversations.height(wh - 45 - 1);
    }
    
    /**
     * 各种消息提示条
     */
    var MsgTips = function() {
        
    }

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

        var els = UI.getInstance().els;
        var $cbPage = $(ChatBoxUI.HTML);
        _this.$cbPage = $cbPage;

        _this.$boxBody = $('>.nextalk-wrap', $cbPage);
        _this.$boxBody.empty();

        _this.handleHTML();
        $cbPage.appendTo(els.$body);

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
        var $cbPage = _this.$cbPage;
        var $w = $(window);
        var wh = $w.height();
        var ww = $w.width();

        $cbPage.width(ww - 270);

        var hh = $('header', $cbPage).height();
        var fh = $('footer', $cbPage).height();
        var $chatboxContent = $('#nextalk_content_chatbox', $cbPage);
        $chatboxContent.height(wh - hh - fh);
    };
    ChatBoxUI.prototype.toBottom = function() {
        var $cbPage = this.$cbPage;
        var $chatboxContent = $('#nextalk_content_chatbox', $cbPage);
        var $innerContent = $('>.nextalk-wrap', $chatboxContent);
        var height = $innerContent.height();
        $chatboxContent.animate({scrollTop : height}, 300);
    };
    ChatBoxUI.prototype.show = function() {
        var _this = this;
        _this.$cbPage.show();
        _this.focus = true;
        _this.times++;

        _this.resizable();
        _this.toBottom();

        var webim = IM.getInstance();
        var dInfo = webim.getDialogInfo(_this.type, _this.id);
        if (dInfo == undefined) {
            return;
        }
        // 去除红色的未读数据
        var record = webim.readAll(_this.type, _this.id);
        var els = UI.getInstance().els;
        var $items = $('>.mzen-list-view', els.$mainConversations);
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
        UI.getInstance()._showNotReadTotal();

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
        _this.$cbPage.hide();
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
        var _this = this, $cbPage = _this.$cbPage;

        if (_this.type == ChatBoxUI.NOTIFICATION) {
            $('footer', $cbPage).hide();
        }
        $cbPage.attr('data-type', _this.type);
        $cbPage.attr('data-id', _this.id);
        $cbPage.attr('data-name', _this.name);
        $('header>.mzen-title', $cbPage).text(_this.name);

        var $chatboxContent = $('#nextalk_content_chatbox', $cbPage);
        $chatboxContent.css('overflow', 'auto');

        $('header>a:first', $cbPage).click(function() {
            _this.hide();
        });
        $('footer form', $cbPage).submit(function() {
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

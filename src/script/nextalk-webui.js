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
        mobile : false
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
        els.$mainHeader = $('header', els.$mainPage);
        els.$mainCurrUser = $('.mzen-pull-right.nextalk-user', els.$mainHeader);
        els.$mainFooter = $('footer', els.$mainPage);
        els.$mainContent = $('#nextalk_content_main', els.$mainPage);
        // 主界面frame
        els.$frameMessage = $('#message_wrap', els.$mainPage).show();
        els.$frameBuddies = $('#buddies_wrap', els.$mainPage).hide();
        els.$frameSettings = $('#settings_wrap', els.$mainPage).hide();
        // 聊天盒子界面chatboxPage（这只是一个模板）
        els.$chatboxPage = $('#nextalk_page_chatbox', els.$body);

        _this.handlerLogin();
        _this.handlerMain();

        // 界面渲染完成
        // -----------------------------------------------------

        // 初始化监听器
        _this._initLisenters();
        _this._initTimerTask();
        $(window).resize(function() {
            _this.trigger('nextalk.resizeable', []);
        });

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
            _this.showTask.stop();
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
        
        // 现场状态切换动画
        _this.showTask = {
            _interval : null,
            colors : ['available', 'dnd', 'away',
                          'invisible', 'chat', 'unavailable'],
            
            start : function() {
                window.clearInterval(this._interval);
                
                var $avatar = $('a', els.$mainCurrUser);
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
                
                var $avatar = $('a', els.$mainCurrUser);
                var colors = this.colors;
                for (var k = 0; k < colors.length; k++) {
                    $avatar.removeClass(colors[k]);
                }
            }
        };
        // 启动现场状态切换动画
        //_this.showTask.start();
    };

    UI.prototype._initLisenters = function() {
        var _this = this;
        
        _this.bind('nextalk.resizeable', function(ev, data) {
            resizeableMain(_this.els);
        });
    };

    UI.prototype.connectServer = function(ticket) {
        var _this = this;
        _this._ticket = ticket;
        window.setTimeout(function() {
            _this._connectServer(ticket);
        }, 1100);
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

            // 处理avatar
            _this.handlerAvatar();

            // 加载会话列表
            _this.loadConversations();

            // 加载联系人列表
            _this.loadBuddies();
        },
        onDisconnected : function(ev, data) {
            var _this = this, els = _this.els;
            showMsgBox('连接断开...', 'mzen-tips-danger');
            _this.stopAllTask();
            _this.handlerAvatar();
        },
        onNetworkUnavailable : function(ev, data) {
            var _this = this, els = _this.els;
            showMsgBox('网络不可用...', 'mzen-tips-danger');
            _this.stopAllTask();
            _this.handlerAvatar();
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
                        chatBoxUI.__send(msg);
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
                        chatBoxUI.receive(msg);
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
            var _this = this, els = _this.els;
            els.$mainCurrUser.click(function() {
                $('.dropdown-menu', $(this)).slideToggle();
            });
            $('.dropdown-menu li', els.$mainCurrUser).each(function(i, el) {
                $(el).click(function() {
                    _this.showTask.start();
                    var show = $(el).attr('data-show');
                    var webim = _this.webim
                    if (show == IM.show.UNAVAILABLE) {
                        webim.offline(function() {
                            _this.handlerAvatar();
                        });
                    } else {
                        webim.online(show, function() {
                            _this.handlerAvatar();
                        });
                    }
                });
            });
            $('ul.mzen-bar-tab>li', els.$mainFooter).each(function(i, el) {
                $(el).css({
                    cursor : 'pointer'
                }).click(function() {
                    els.$frameMessage.hide();
                    els.$frameBuddies.hide();
                    els.$frameSettings.hide();
                    $('ul.mzen-bar-tab>li', els.$mainFooter).each(function() {
                        $(this).removeClass('active');
                    });

                    var tit = $('.mzen-title', els.$mainHeader);
                    var tog = $(this).attr('data-toggle');
                    if (tog == 'message') {
                        $(this).addClass('active');
                        tit.text('消息');
                        els.$frameMessage.show();
                    } else if (tog == 'buddies') {
                        $(this).addClass('active');
                        tit.text('联系人');
                        els.$frameBuddies.show();
                    } else if (tog == 'settings') {
                        $(this).addClass('active');
                        tit.text('设置');
                        els.$frameSettings.show();
                    }
                });
            });
            resizeableMain(els);
            els.$mainContent.css('overflow', 'auto');

            // message
            _this.toggleMainMessage();
            // buddies
            _this.toggleMainBuddies();
            // settings
            _this.toggleMainSettings();
        },

        _showNotReadTotal : function() {
            //.???<span class="aui-badge aui-badge-danger">12</span>
        },

        handlerAvatar : function() {
            var _this = this, els = _this.els;
            var show = _this.webim.getShow();

            if (_this.webim.connStatus == IM.connStatus.CONNECTED) {
                var u = _this.webim.getCurrUser();
                $('img', els.$mainCurrUser).attr('src', u.avatar);
                $('img', els.$mainCurrUser).attr('alt', u.nick);
                $('a', els.$mainCurrUser).attr('title', u.nick);
            }
            
            _this.showTask.stop();
            $('a', els.$mainCurrUser).addClass(show);
            
            $('ul li', els.$mainCurrUser).each(function(i, el) {
                var $el = $(el);
                $('.mzen-iconfont', $el).remove();
                if ($el.attr('data-show') == show) {
                    $(el).append('<i class="mzen-iconfont mzen-icon-check"></i>');
                }
            });
        },
        
        toggleMainMessage : function() {
            var _this = this, els = this.els;
            var $frameMessage = els.$frameMessage;
            var $items = $('.nextalk-message-items', $frameMessage).empty();
            _this._toggleConversations($('>li', $items));
        },
        
        toggleMainBuddies : function() {
            var _this = this, els = this.els;
            var $frameBuddies = els.$frameBuddies;
            var $nextalkSearch = $('#nextalk_search', $frameBuddies);
            new SearchUI($nextalkSearch);
            
            var $items = $('ul.mzen-user-view>li', $frameBuddies);
            _this._toggleConversations($items);
        },
        
        toggleMainSettings : function() {
            var _this = this, els = this.els;
            $('#set_version', els.frameSettings).text(UI.v);
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
            var $frameMessage = els.$frameMessage;
            
            if (typeof msgType == 'undefined') {
                $('.mzen-tips-warning', $frameMessage).show();
                return;
            }
            
            //???
            var $items = $('.nextalk-message-items', $frameMessage);
            
            $('>li', $items).each(function(i, el) {
                var $el = $(el);
                if ($el.attr('data-toggle') == IM.msgType.NOTIFICATION
                        && msgType == IM.msgType.NOTIFICATION) {
                    $el.remove();
                    // break
                    return false;
                }
                if ($el.attr('data-toggle') == msgType
                        && $el.attr('data-id') == other) {
                    $el.remove();
                    // break
                    return false;
                }
            });
            var dInfo = webim.getDialogInfo(msgType, other);
            conversationHTML(dInfo, msg.body).prependTo($items);
            var $cvnLis = $('>li', $items);
            if ($cvnLis.length > 0) {
                $('.mzen-tips-warning', $frameMessage).hide();
            } else {
                $('.mzen-tips-warning', $frameMessage).show();
            }
            // 设置底部的未读数据
            _this._showNotReadTotal();
            _this._toggleConversations($cvnLis);
        },
        
        loadBuddies : function() {
            var _this = this, els = _this.els, webim = _this.webim;
            var $frameBuddies = els.$frameBuddies;
            var $items = $('ul.mzen-user-view', $frameBuddies).empty();
            var buddies = webim.getBuddies();
            if (buddies && buddies.length > 0) {
                $('.mzen-tips-warning', $frameBuddies).hide();
                for (var i = 0; i < buddies.length; i++) {
                    $items.append(buddyHTML(buddies[i]));
                }
            } else {
                $('.mzen-tips-warning', $frameBuddies).show();
            }
            _this._toggleConversations($('>li', $items));
        }

    });
    
    function conversationHTML(dInfo, text) {
        var html = '<li class="mzen-list-view-cell mzen-img mzen-tap-active mzen-up-hover"'
                + ' data-toggle="' + dInfo.msgType + '" ' + getDataId(dInfo.msgType, dInfo.other)
                + ' data-name="' + dInfo.name + '">'
                + '<img class="mzen-img-object mzen-pull-left" src="' + dInfo.avatar + '">'
                + '<div class="mzen-img-body mzen-arrow-right">'
                + '<label>' + dInfo.name + '</label>'
                + '<em class="mzen-pull-right msg-time">'+ dInfo.timestamp +'</em>'
                + getNotCount(dInfo.notCount)
                + '<p class="mzen-ellipsis-1">'+ text +'</p></div></li>';

        return $(html);
    }
    function getDataId(msgType, other) {
        if (msgType == IM.msgType.NOTIFICATION)
            return '';

        return 'data-id=' + other;
    }
    function getNotCount(notCount) {
        if (notCount == 0)
            return '';

        return '<span class="mzen-badge mzen-badge-danger">'+ notCount +'</span>';
    }

    function buddyHTML(u) {
        var html = '<li class="mzen-user-view-cell mzen-img mzen-up-hover" '
                + 'data-toggle="' + ChatBoxUI.CHAT + '" data-id="'
                + u.id + '" data-name="' + u.nick + '">'
                + '<img class="mzen-img-object mzen-pull-left" src="'+u.avatar+'">'
                + '<div class="mzen-img-body mzen-arrow-right">'
                + '<span>'+u.nick+'</span>' + showHTML(u) +' </div></li>';
        return html;
    }
    
    function showHTML(u) {
        if (u.show == IM.show.AVAILABLE) {
            return '<i class="nextalk-show available"></i>';
        }
        if (u.show == IM.show.DND) {
            return '<i class="nextalk-show dnd"></i>';
        }
        if (u.show == IM.show.AWAY) {
            return '<i class="nextalk-show away"></i>';
        }
        if (u.show == IM.show.INVISIBLE) {
            return '<i class="nextalk-show invisible"></i>';
        }
        if (u.show == IM.show.CHAT) {
            return '<i class="nextalk-show chat"></i>';
        }
        if (u.show == IM.show.UNAVAILABLE) {
            return '<i class="nextalk-show unavailable"></i>';
        }
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

    function resizeableMain(els) {
        var webui = UI.getInstance();
        var mobile = webui.options.mobile;
        var $w = $(window);
        var wh = $w.height();
        var ww = $w.width();
        if (mobile) {
            els.$mainPage.width(ww);
        } else {
            if (ww <= 320) {
                els.$mainPage.width(ww);
            } else {
                els.$mainPage.width(270);
            }
        }

        var hh = els.$mainHeader.height();
        var fh = els.$mainFooter.height();
        // els.$mainPage.height(wh);
        els.$mainContent.height(wh - hh - fh - 1);
    }
    
    function resizeableChatbox($chatboxPage) {
        var webui = UI.getInstance();
        var mobile = webui.options.mobile;
        var $w = $(window);
        var wh = $w.height();
        var ww = $w.width();
        if (mobile) {
            $chatboxPage.width(ww);
        } else {
            if (ww <= 320) {
                $chatboxPage.width(ww);
            } else {
                $chatboxPage.width(ww - 270 - 5);
            }
        }

        var hh = $('header', $chatboxPage).height();
        var fh = $('footer', $chatboxPage).height();
        var $chatboxContent = $('#nextalk_content_chatbox', $chatboxPage);
        $chatboxContent.height(wh - hh - fh - 1);        
    }

    function toChatboxContentBottom($cbPage) {
        var $chatboxContent = $('#nextalk_content_chatbox', $cbPage);
        var $innerContent = $('>.nextalk-wrap', $chatboxContent);
        var height = $innerContent.height();
        $chatboxContent.animate({scrollTop : height}, 300);
    }

    var ChatBoxUI = function(type, id, name, avatar) {
        var _this = this;
        _this.type = type;
        _this.name = name;
        _this.avatar = avatar;
        _this.focus = false;
        _this.times = 0;
        if (id) {
            _this.id = id;
        }

        var els = UI.getInstance().els;
        var $cbPage = els.$chatboxPage.clone();
        _this.$cbPage = $cbPage;
        
        _this.$boxBody = $('#nextalk_content_chatbox>.nextalk-wrap', $cbPage);
        _this.$boxBody.empty();

        if (type == ChatBoxUI.NOTIFICATION) {
            $cbPage.attr('id', ChatBoxUI.NOTIFICATION);
            $('footer', $cbPage).hide();
            _this.avatar = IM.imgs.NOTICE;
        } else if (type == ChatBoxUI.ROOM) {
            $cbPage.attr('id', ChatBoxUI.ROOM + '_' + id);
            _this.avatar = IM.imgs.GROUP;
        } else if (type == ChatBoxUI.CHAT) {
            $cbPage.attr('id', ChatBoxUI.CHAT + '_' + id);
        }
        $('header>.mzen-title', $cbPage).text(_this.name);
        
        _this.handleHTML();
        $cbPage.appendTo(els.$body);
        
        UI.getInstance().bind('nextalk.resizeable',
                function(ev, data) {
                    resizeableChatbox($cbPage);
        });
    };

    // 聊天盒子类型
    ChatBoxUI.NOTIFICATION = IM.msgType.NOTIFICATION;
    ChatBoxUI.CHAT = IM.msgType.CHAT;
    ChatBoxUI.ROOM = IM.msgType.ROOM;

    ChatBoxUI.prototype.show = function() {
        var _this = this;
        _this.$cbPage.show();
        _this.focus = true;
        resizeableChatbox(_this.$cbPage);
        toChatboxContentBottom(_this.$cbPage);

        var webim = IM.getInstance();
        var record = webim.readAll(_this.type, _this.id);
        // 去除红色的未读数据
        var dInfo = webim.getDialogInfo(_this.type, _this.id);
        var els = UI.getInstance().els;
        var $items = $('.nextalk-message-items', els.$frameMessage);
        $('>li', $items).each(function(i, el) {
            var $el = $(el);
            if ($el.attr('data-toggle') == ChatBoxUI.NOTIFICATION
                    && _this.type == ChatBoxUI.NOTIFICATION) {
                if (dInfo.notCount > 0) {
                    $el.find('span.mzen-badge-danger').text(dInfo.notCount);
                } else {
                    $el.find('span.mzen-badge-danger').remove();
                }
                // break
                return false;
            }
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

        _this.times++;
        // 如果聊天盒子第一次显示，加载内存对话记录和历史对话记录
        if (_this.times > 1) {
            return;
        }

        for (var i = 0, len = record.length; i < len; i++) {
            var msg = record[i];
            if (msg.direction == IM.msgDirection.SEND) {
                _this.__send(msg);
            } else {
                _this.receive(msg);
            }
        }
    };
    ChatBoxUI.prototype.hide = function() {
        var _this = this;
        _this.$cbPage.hide();
        _this.focus = false;
    };
    ChatBoxUI.prototype.receive = function(msg) {
        var _this = this;
        var html = '<div class="mzen-chat-receiver">'
            + '<div class="mzen-chat-receiver-avatar">'
            + '<img src="' + msg.avatar + '"></div>'
            + '<div class="mzen-chat-receiver-cont">'
            + '<div class="mzen-chat-left-triangle"></div>'
            + '<span>' + msg.body + '</span></div></div>';
        _this.$boxBody.append(html);
        toChatboxContentBottom(_this.$cbPage);
    };
    ChatBoxUI.prototype.__send = function(msg) {
        var _this = this;
        var html = '<div class="mzen-chat-sender">'
            + '<div class="mzen-chat-sender-avatar">'
            + '<img src="' + msg.avatar + '"></div>'
            + '<div class="mzen-chat-sender-cont">'
            + '<div class="mzen-chat-right-triangle"></div>'
            + '<span>' + msg.body + '</span></div></div>';
        _this.$boxBody.append(html);
        toChatboxContentBottom(_this.$cbPage);
    }
    ChatBoxUI.prototype._send = function(body) {
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
        _this.__send(msg);
        webim.sendMessage(msg);
        // 处理会话列表
        webui.loadConversations(msg.type, msg.to, msg);
    };
    ChatBoxUI.prototype.handleHTML = function() {
        var _this = this, $chatboxPage = _this.$cbPage;

        var $chatboxContent = $('#nextalk_content_chatbox', $chatboxPage);
        $chatboxContent.css('overflow', 'auto');

        $('header>a:first', $chatboxPage).click(function() {
            _this.hide();
        });
        $('footer form', $chatboxPage).submit(function() {
            var input = $('input', $(this));
            if ($.trim(input.val()) != '') {
                _this._send(input.val());
            }
            input.val('');
            return false;
        });
    };

    var SearchUI = function($search, callback) {
        var _this = this;
        _this.$search = $search;
        $('.mzen-searchbar', $search).click(function() {
            _this.doSearch();
        }); 
        $('.mzen-searchbar-cancel', $search).click(function() {
            _this.cancelSearch();
        });
        $('.mzen-icon-roundclosefill', $search).click(function() {
            _this.clearSearch();
        });
        $('.mzen-searchbar-input>form', $search).submit(function() {
            return false;
        });
        $('.mzen-searchbar-input input', $search).change(function() {
            _this.search();
        });
    }

    SearchUI.prototype.search = function() {
        
    };

    SearchUI.prototype.doSearch = function() {
        var _this = this, $search = _this.$search;
        $search.addClass('focus');
        $('.mzen-searchbar-input input', $search).focus();
    };

    SearchUI.prototype.clearSearch = function() {
        var _this = this, $search = _this.$search;
        $('.mzen-searchbar-input input', $search).val('');
    };

    SearchUI.prototype.cancelSearch = function() {
        var _this = this, $search = _this.$search;
        $('.mzen-searchbar-input input', $search).blur().val('');
        $search.removeClass('focus');
    };

    window.NexTalkWebUI = UI;
})(NexTalkWebIM);

/*!
 * nextalk-webui.js v0.0.1
 * http://nextalk.im/
 *
 * Copyright (c) 2014 NexTalk
 *
 */

var NexTalkWebUI = function() {
};

(function(UI, IM, undefined) {

    "use strict";

    IM.ClassEvent.on(UI);

    // ---------------------------------------

    /** 版本号 */
    UI.VERSION = UI.version = UI.v = "0.0.1";

    /** 默认配置信息 */
    UI.DEFAULTS = $.extend(IM.DEFAULTS, {});

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

        toggleMain(els);
        els.$loginBtn.click(function() {
            _this._connectServer(_this._uid);
        });
        // 界面渲染完成
        // -----------------------------------------------------

        // 定义聊天盒子存储空间
        _this.chatBoxUIs = {};
        // 系统消息盒子
        _this.chatBoxUIs[ChatBoxUI.SYS_MSG] = new ChatBoxUI(ChatBoxUI.SYS_MSG);

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
    
    UI.prototype.connectServer = function(uid) {
        var _this = this;
        _this._uid = uid;
        window.setTimeout(function() {
            _this._connectServer(uid);
        }, 1100);
    };
    
    UI.prototype._connectServer = function(uid) {
        var _this = this;
        _this.els.$initPage.hide();
        _this.webim.connectServer({uid : uid});
    }
    
    $.extend(UI.prototype, {
        onLogin : function(ev, data) {
            var _this = this, els = _this.els;
            els.$msgBox.hide();
            
            if (_this.webim.loginTime > 0) {
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
            showMsgBox(els.$msgBox, '正在连接...', 'mzen-tips-info');
        },
        onConnected : function(ev, data) {
            var _this = this, els = _this.els;
            showMsgBox(els.$msgBox, '连接成功...', 'mzen-tips-success');
            setTimeout(function() {
                els.$msgBox.hide();
            }, 5000);
            
            // 处理avatar
            _this.handlerAvatar();
            
            // 加载联系人列表
            var $frameBuddies = els.$frameBuddies;
            var $items = $('ul.mzen-user-view', $frameBuddies).empty();
            var buddies = _this.webim.getBuddies();
            if (buddies && buddies.length > 0) {
                $('.mzen-tips-warning', $frameBuddies).hide();
                for (var i = 0; i < buddies.length; i++) {
                    $items.append(getBuddyHTML(buddies[i]));
                }
            } else {
                $('.mzen-tips-warning', $frameBuddies).show();
            }
            toggleConversation($('>li', $items));
            
            // 加载会话列表
        },
        onDisconnected : function(ev, data) {
            var _this = this, els = _this.els;
            showMsgBox(els.$msgBox, '连接断开...', 'mzen-tips-danger');
            _this.stopAllTask();
            _this.handlerAvatar();
        },
        onNetworkUnavailable : function(ev, data) {
            var _this = this, els = _this.els;
            showMsgBox(els.$msgBox, '网络不可用...', 'mzen-tips-danger');
            _this.stopAllTask();
            _this.handlerAvatar();
        },
        onMessage : function(ev, data) {
            var _this = this;
            for (var i = 0; i < data.length; i++) {
                var msg = data[i];
                if (msg.type == 'chat') {
                    var chatBoxUI = _this.chatBoxUIs[ChatBoxUI.USER_MSG + msg.from];
                    if (chatBoxUI) {
                        chatBoxUI.receive(msg);
                        msg.read = true;
                    }
                    // 处理会话通知
                } else if (msg.type == 'room') {
                    // 处理会话通知
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
        handlerAvatar : function() {
            var _this = this, els = _this.els;
            var show = _this.webim.getShow();
            var path = _this.options.path;

            if (_this.webim.connStatus == IM.connStatus.CONNECTED) {
                var u = _this.webim.getCurrUser();
                $('img', els.$mainCurrUser).attr('src', path + u.avatar);
                $('img', els.$mainCurrUser).attr('alt', u.nick);
                $('a', els.$mainCurrUser).attr('title', u.nick);
            }
            
            _this.showTask.stop();
            $('a', els.$mainCurrUser).addClass(show);
            
            $('ul li', els.$mainCurrUser).each(function(i, el) {
                var $el = $(el);
                $('.mzen-iconfont', $el).remove();
                if ($el.attr('value') == show) {
                    $(el).append('<i class="mzen-iconfont mzen-icon-check"></i>');
                }
            });
        }
    });

    function getBuddyHTML(u) {
        var path = IM.getInstance().options.path;
        var html = '<li class="mzen-user-view-cell mzen-img mzen-up-hover" '
                + 'data-toggle="user_msg" data-id="' + u.id + '">'
                + '<img class="mzen-img-object mzen-pull-left" src="'+path+u.avatar+'">'
                + '<div class="mzen-img-body mzen-arrow-right">'
                + '<span>'+u.nick+'</span>'
                + showHTML(u)
                +' </div></li>';
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
    
    function showMsgBox($msgBox, msg, addClass) {
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

    function resizeableMain(els) {
        var wh = $(window).height();

        var hh = els.$mainHeader.height();
        var fh = els.$mainFooter.height();
        els.$mainContent.height(wh - hh - fh - 1);

        if ($.isFunction($.fn.perfectScrollbar)) {
            setTimeout(function() {
                // els.$mainContent.perfectScrollbar({
                //     wheelPropagation : false
                // });
                els.$mainContent.css('overflow', 'auto');
            }, 1);
        }
    }
    
    function resizeableChatbox($chatboxPage) {
        var wh = $(window).height();

        var hh = $('header', $chatboxPage).height();
        var fh = $('footer', $chatboxPage).height();
        var $chatboxContent = $('#nextalk_content_chatbox', $chatboxPage);
        $chatboxContent.height(wh - hh - fh);
        
        if ($.isFunction($.fn.perfectScrollbar)) {
            setTimeout(function() {
                // $chatboxContent.perfectScrollbar({
                //     wheelPropagation : false
                // });
                $chatboxContent.css('overflow', 'auto');
            }, 1);
        }
    }

    function toggleMain(els) {
        els.$mainCurrUser.click(function() {
            $('.dropdown-menu', $(this)).slideToggle();
        });
        $('.dropdown-menu li', els.$mainCurrUser).each(function(i, el) {
            $(el).click(function() {
                var show = $(el).attr('value');
                UI.getInstance().showTask.start();
                if (show == IM.show.UNAVAILABLE) {
                    IM.getInstance().offline(function() {
                        UI.getInstance().handlerAvatar();
                    });
                } else {
                    IM.getInstance().online(show, function() {
                        UI.getInstance().handlerAvatar();
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

        // message
        toggleMainMessage(els);
        // buddies
        toggleMainBuddies(els);
        // settings
        $('#set_version', els.frameSettings).text(UI.v);
    }

    function toggleMainMessage(els) {
        var $frameMessage = els.$frameMessage;
        var $items = $('ul.nextalk-message-items>li', $frameMessage);
        toggleConversation($items);
    }

    function toggleMainBuddies(els) {
        var $frameBuddies = els.$frameBuddies;
        var $nextalkSearch = $('#nextalk_search', $frameBuddies);
        new SearchUI($nextalkSearch);
        
        var $items = $('ul.mzen-user-view>li', $frameBuddies);
        toggleConversation($items);
    }

    function toggleConversation($items) {
        var els = UI.getInstance().els;
        $items.each(function(i, el) {
            var item = $(el);
            if (item.data('events') &&
                    item.data('events')['click'])
                return;

            // 点击启动一个新的聊天盒子
            item.click(function() {
                var webui = UI.getInstance();
                if (item.attr('data-toggle') == ChatBoxUI.SYS_MSG) {
                    webui.chatBoxUIs[ChatBoxUI.SYS_MSG].show();
                    return;
                }
                var dataId = item.attr('data-id');
                if (!dataId || dataId == '') {
                    return;
                }
                if (item.attr('data-toggle') == ChatBoxUI.ROOM_MSG) {
                    if (!webui.chatBoxUIs[ChatBoxUI.ROOM_MSG + dataId]) {
                        webui.chatBoxUIs[ChatBoxUI.ROOM_MSG + dataId] =
                            new ChatBoxUI(ChatBoxUI.ROOM_MSG, dataId);
                    }
                    webui.chatBoxUIs[ChatBoxUI.ROOM_MSG + dataId].show();
                    return;
                }
                if (item.attr('data-toggle') == ChatBoxUI.USER_MSG) {
                    if (!webui.chatBoxUIs[ChatBoxUI.USER_MSG + dataId]) {
                        webui.chatBoxUIs[ChatBoxUI.USER_MSG + dataId] =
                            new ChatBoxUI(ChatBoxUI.USER_MSG, dataId);
                    }
                    webui.chatBoxUIs[ChatBoxUI.USER_MSG + dataId].show();
                    return;
                }
            });
        });
    }

    var ChatBoxUI = function(type, id) {
        var _this = this;
        _this.type = type;
        if (id) {
            _this.id = id;
        }

        var els = UI.getInstance().els;
        var $cbPage = els.$chatboxPage.clone();
        _this.$cbPage = $cbPage;
        
        _this.$boxBody = $('#nextalk_content_chatbox>.nextalk-wrap', $cbPage);
        _this.$boxBody.empty();

        if (type == ChatBoxUI.SYS_MSG) {
            $cbPage.attr('id', ChatBoxUI.SYS_MSG);
            $('footer', $cbPage).hide();
            _this.avatar = '';
            _this.name = '系统通知';
        } else if (type == ChatBoxUI.ROOM_MSG) {
            $cbPage.attr('id', ChatBoxUI.ROOM_MSG + id);
            _this.avatar = '';
            _this.name = '我的房间';
        } else if (type == ChatBoxUI.USER_MSG) {
            $cbPage.attr('id', ChatBoxUI.USER_MSG + id);
            _this.avatar = IM.getInstance().getBuddy(id).avatar;
            _this.name = IM.getInstance().getBuddy(id).nick;
            _this.nickname = _this.name;
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
    ChatBoxUI['SYS_MSG'] = 'sys_msg';
    ChatBoxUI['USER_MSG'] = 'user_msg';
    ChatBoxUI['ROOM_MSG'] = 'room_msg';

    ChatBoxUI.prototype.show = function() {
        var _this = this;
        _this.$cbPage.show();
        resizeableChatbox(_this.$cbPage);
    };
    ChatBoxUI.prototype.receive = function(msg) {
        var _this = this, ops = UI.getInstance().options;
        var html = '<div class="mzen-chat-receiver">'+
                '<div class="mzen-chat-receiver-avatar">'+
                '<img src="' + ops.path + _this.avatar + '"></div>'+
                '<div class="mzen-chat-receiver-cont">'+
                '   <div class="mzen-chat-left-triangle"></div>'+
                '   <span>' + msg.body + '</span>'+
                '</div></div>';
        _this.$boxBody.append(html);
    };
    ChatBoxUI.prototype._send = function(body) {
        var _this = this;
        var webim = IM.getInstance();
        var ops = webim.options;
        var currUser = webim.getCurrUser();
        
        var html = '<div class="mzen-chat-sender">'
            + '<div class="mzen-chat-sender-avatar">'
            + '<img src="' + ops.path + currUser.avatar + '"></div>'
            + '<div class="mzen-chat-sender-cont">'
            + '    <div class="mzen-chat-right-triangle"></div>'
            + '    <span>' + body + '</span>'
            + '</div>'
            + '</div>';
        _this.$boxBody.append(html);
        
        var msg = {
            type : 'chat',
            from : currUser.id,
            to : _this.id,
            nick : currUser.nick,
            to_nick : _this.nickname,
            body : body,
            timestamp : IM.nowStamp()
        };
        webim.sendMessage(msg);
    };
    ChatBoxUI.prototype.handleHTML = function() {
        var _this = this, $chatboxPage = _this.$cbPage;
        
        $('header>a:first', $chatboxPage).click(function() {
            $chatboxPage.hide();
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

})(NexTalkWebUI, NexTalkWebIM);

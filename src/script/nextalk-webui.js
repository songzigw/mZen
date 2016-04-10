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
     *                appId 开发者的appId
     * @param {object}
     *                options
     * @example NexTalkWebUI.init("app_id");
     */
    UI.init = function(appId, options) {
        if (!UI._instance) {
            UI._instance = new UI();
        }
        UI.getInstance()._init(appId, options);
        return UI.getInstance();
    };

    UI.prototype.version = UI.VERSION;

    /**
     * 初始化NexTalkWebUI
     */
    UI.prototype._init = function(appId, options) {
        var _this = this;

        // 界面元素定义
        var els = _this.els = {};
        // 元素根节点body
        els.$body = $('body');
        // 消息通知框
        els.$msgBox = $('.mzen-tips.nextalk-msg-box', els.$body).hide();
        // 初始化页面
        els.$initPage = $('#nextalk_page_init', els.$body);
        // 主要界面入口mainPage
        els.$mainPage = $('#nextalk_page_main', els.$body);
        els.$mainHeader = $('header', els.$mainPage);
        els.$mainFooter = $('footer', els.$mainPage);
        els.$mainContent = $('#nextalk_content_main', els.$mainPage);
        // 主界面frame
        els.$frameMessage = $('#message_wrap', els.$mainPage).show();
        els.$frameBuddies = $('#buddies_wrap', els.$mainPage).hide();
        els.$frameSettings = $('#settings_wrap', els.$mainPage).hide();

        // 聊天盒子界面chatboxPage（这只是一个模板）
        els.$chatboxPage = $('#nextalk_page_chatbox', els.$body);

        toggleMain(els);
        toggleChatbox(els);
        // 界面渲染完成
        // -----------

        // 初始化监听器
        _this._initLisenters();
        $(window).resize(function() {
            _this.trigger('nextalk.resizeable', []);
        });

        // 初始化NexTalkWebIM
        _this.webim = IM.init(appId, options);
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
                _this.NetworkUnavailable(ev, data);
            }
        });
        _this.webim.setReceiveMsgListener({
            onMessage : function(ev, data) {
                _this.onMessage();
            },
            onPresences : function(ev, data) {
                _this.onPresences();
            },
            onStatus : function(ev, data) {
                _this.onStatus();
            }
        });
        
        return _this;
    };
    
    UI.prototype._initLisenters = function() {
        var _this = this;
        
        _this.bind('nextalk.resizeable', function(ev, data) {
            resizeableMain(_this.els);
            resizeableChatbox(_this.els);
        });
    };
    
    UI.prototype.connectServer = function(uid) {
        this.webim.connectServer({uid : uid});
    };
    
    $.extend(UI.prototype, {
        onConnecting : function(ev, data) {
            var _this = this;
            var els = _this.els;
            els.$initPage.hide();
            showMsgBox(els.$msgBox, '正在连接中...', 'mzen-tips-info');
        },
        onConnected : function(ev, data) {
            var _this = this;
            var els = _this.els;
            showMsgBox(els.$msgBox, '连接成功...', 'mzen-tips-info');
            setTimeout(function() {
                els.$msgBox.hide();
            }, 2000);
        },
        onDisconnected : function(ev, data) {
            var _this = this;
            var els = _this.els;
            // 连接未成功断开
            showMsgBox(els.$msgBox, '连接失败...', 'mzen-tips-danger');
            // 连接成功后断开
        },
        onNetworkUnavailable : function(ev, data) {
            var _this = this;
            var els = _this.els;
            showMsgBox(els.$msgBox, '网络不可用...', 'mzen-tips-danger');
        },
        onMessage : function(ev, data) {
            
        },
        onPresences : function(ev, data) {
            
        },
        onStatus : function(ev, data) {
            
        }
    });
    
    function showMsgBox($msgBox, msg, addClass) {
        $msgBox.removeClass('mzen-tips-danger');
        $msgBox.removeClass('mzen-tips-info');
        $msgBox.addClass(addClass);
        $('span', $msgBox).text(msg);
        $msgBox.show();
    }

    function resizeableMain(els) {
        var wh = $(window).height();

        var hh = els.$mainHeader.height();
        var fh = els.$mainFooter.height();
        els.$mainContent.height(wh - hh - fh);

        if ($.isFunction($.fn.perfectScrollbar)) {
            setTimeout(function() {
                els.$mainContent.perfectScrollbar({
                    wheelPropagation : false
                });
            }, 1);
        }
    }
    
    function resizeableChatbox(els) {
        var $chatboxPage = els.$chatboxPage;
        var wh = $(window).height();

        var hh = $('header', $chatboxPage).height();
        var fh = $('footer', $chatboxPage).height();
        var $chatboxContent = $('#nextalk_content_chatbox', $chatboxPage);
        $chatboxContent.height(wh - hh - fh);
        
        if ($.isFunction($.fn.perfectScrollbar)) {
            setTimeout(function() {
                $chatboxContent.perfectScrollbar({
                    wheelPropagation : false
                });
            }, 1);
        }
    }

    function toggleMain(els) {
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
        
        $('.nextalk-message-items', $frameMessage).each(function(i, el) {
            $(el).click(function() {
                els.$chatboxPage.show();
                resizeableChatbox(els.$chatboxPage);
            });
        });
    }
    function toggleMainBuddies(els) {
        var $frameBuddies = els.$frameBuddies;
        var $nextalkSearch = $('#nextalk_search', $frameBuddies);
        new SearchUI($nextalkSearch);
    }

    function toggleChatbox(els) {
        var $chatboxPage = els.$chatboxPage;
        $('header>a:first', $chatboxPage).click(function() {
            $chatboxPage.hide();
        });
    }
    
    function SearchUI($search, callback) {
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
        var _this = this;
        var $search = _this.$search;
        $search.addClass('focus');
        $('.mzen-searchbar-input input', $search).focus();
    };
    
    SearchUI.prototype.clearSearch = function() {
        var _this = this;
        var $search = _this.$search;
        $('.mzen-searchbar-input input', $search).val('');
    };
    
    SearchUI.prototype.cancelSearch = function() {
        var _this = this;
        var $search = _this.$search;
        $('.mzen-searchbar-input input', $search).blur().val('');
        $search.removeClass('focus');
    };

})(NexTalkWebUI, NexTalkWebIM);

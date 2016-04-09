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

    var top = window.top;
    if (top != window.self) {
        var nkMain = $('#nextalk_main', top.document);
        var nkIframe = $('#nextalk_iframe', top.document);

        var nkMainHeight = -42;
        var nkIframeHeight = -530;
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
     *                appKey 开发者的AppKey
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
    UI.prototype._init = function(appId, options) {
        var _this = this;

        // 初始化NexTalkWebIM
        // this.webim = IM.init(appId, options);

        // 界面元素定义
        var els = _this.els = {};
        // 元素根节点body
        els.$body = $('body');

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

        // 初始化监听器
        _this._initLisenters();

        $(window).resize(function() {
            _this.trigger('nextalk.resizeable', []);
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

    function toggleChatbox(els) {
        var $chatboxPage = els.$chatboxPage;
        $('header>a:first', $chatboxPage).click(function() {
            $chatboxPage.hide();
        });
    }

})(NexTalkWebUI, NexTalkWebIM);
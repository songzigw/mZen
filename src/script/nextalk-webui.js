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
     *            appKey 开发者的AppKey
     * @param {object}
     *            options
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
        els.$body = $('body');
        els.$pageMain = $('#nextalk_page_main', els.$body);
        els.$mainHeader = $('header', els.$pageMain);
        els.$mainFooter = $('footer', els.$pageMain);
        els.$mainContent = $('#nextalk_content_main', els.$pageMain);

        var wh = $(window).height();
        //els.$pageMain.height(wh);
        
        var hh = els.$mainHeader.height();
        var fh = els.$mainFooter.height();
        //els.$mainContent.height(wh- hh - fh);
        
        $(window).resize(function() {
            
        });
        
        return _this;
    };

})(NexTalkWebUI, NexTalkWebIM);
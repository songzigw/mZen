/*!
 * nextalk-main.js v1.0.0
 * http://nextalk.im/
 *
 * Copyright (c) 2014 NexTalk
 *
 */

(function(UI, IM, undefined) {

    "use strict";

    // NexTalkWebUI初始化参数
    if (!window.nextalkConfig) {
        window.nextalkConfig = {
            uid : '',
            appId : '',
            apiPath : '/',
            route : {}
        }
    }

    var top = window.top;
    if (top != window.self) {
        // 父窗口中的页面元素
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

        // 获取父窗体中的引导程序
        var boot = top.nextalkBoot;
        nextalkConfig.uid = boot.uid;
        nextalkConfig.appId = boot.appId;
        nextalkConfig.apiPath = boot.apiPath;
        nextalkConfig.route = boot.route;
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

    IM.WebApi.route(nextalkConfig.route);
    UI.init(nextalkConfig.appId, {
        path : nextalkConfig.apiPath
    });
    UI.getInstance().connectServer(nextalkConfig.uid);

})(NexTalkWebUI, NexTalkWebIM);

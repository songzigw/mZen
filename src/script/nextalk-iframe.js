/*!
 * nextalk-top.js v1.0.0
 * http://nextalk.im/
 *
 * Copyright (c) 2014 NexTalk
 *
 */

(function(win, undefined) {

    "use strict";

    var top = {
        config : {
            // 通信令牌 暂时不用
            //ticket : 'ticket',
            // APP_KEY 暂时不用
            //appKey : 'app_key',
            // 引入资源文件的根路径
            resPath : '/src/',
            // API根路径
            apiPath : '/',
            // API路由
            route : {}
        },
        // Iframe 宽高
        panel : {
            width : 790,
            height : 530
        },
        $ : undefined
    };

    top._getCss = function() {
        var cssLink = '<link rel="stylesheet" type="text/css" href="'
                + this.config.resPath + 'css/nextalk-iframe.css" />';
        return cssLink;
    };

    top._getBtnHTML = function() {
        var btnHTML = '<div class="nextalk-main" id="nextalk_main">'
                + '<a class="nextalk-btn">' + '<img class="nextalk-ico" src="'
                + this.config.resPath + 'imgs/chat.png" />' + '<span>聊天</span></a>'
                + '<span class="nextalk-alert">5</span></div>';
        return btnHTML;
    }

    var h = 20;
    top._getIfrHTML = function() {
        var ifrHTML = '<div class="nextalk-iframe" id="nextalk_iframe" '
                + 'style="width:'+ this.panel.width + 'px;height:' + this.panel.height + 'px;">'
                + '<div class="nextalk-minimize" style="width:100%;heigth:' + h + 'px;">'
                + '<a class="" title="最小化">-</a></div>'
                + '<div style="width:100%;height:' + (this.panel.height - h) + 'px;">'
                + '<iframe src="'
                + this.config.resPath
                + 'html/iframe.html" name="nextalk_iframe" frameborder="no" scrolling="no"/>'
                + '</div></div>';
        return ifrHTML;
    };

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
    function toggleHTML() {
        var nkMain = top.$('#nextalk_main', document);
        var nkIframe = top.$('#nextalk_iframe', document);

        var nkMainHeight = -42;
        var nkIframeHeight = -(top.panel.height);
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

    top.go = function() {
        var _this = this;
        document.write(this._getCss());
        document.write(this._getBtnHTML());
        document.write(this._getIfrHTML());
        
        var task = window.setInterval(function() {
            var ifw = window['nextalk_iframe'].window;
            if (ifw && ifw.$) {
                window.clearInterval(task);
                _this.$ = ifw.$;
                toggleHTML();
            }
        }, 200);
    }

    win.nextalkTop = top;
})(window);

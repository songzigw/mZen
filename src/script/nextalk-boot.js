/*!
 * nextalk-boot.js v1.0.0
 * http://nextalk.im/
 *
 * Copyright (c) 2014 NexTalk
 *
 */

(function(win, undefined) {

    "use strict";

    var boot = {};
    // 登入用户ID
    boot.uid = '';
    boot.appId = '';
    // API根路径
    boot.apiPath = '/';
    // API路由
    boot.route = {};
    // 引导程序导入依赖文件需要的根路径
    boot.path = '/src/';

    boot.panel = {
        width : 320,
        height : 530
    };

    boot._getCss = function() {
        var cssLink = '<link rel="stylesheet" type="text/css" href="'
                + this.path + 'css/nextalk-boot.css" />';
        return cssLink;
    };

    boot._getBtnHTML = function() {
        var btnHTML = '<div class="nextalk-main" id="nextalk_main">'
                + '<a class="nextalk-btn">' + '<img class="nextalk-ico" src="'
                + this.path + 'imgs/chat.png" />' + '<span>聊天</span></a>'
                + '<span class="nextalk-alert">5</span></div>';
        return btnHTML;
    }

    var h = 20;
    boot._getIfrHTML = function() {
        var ifrHTML = '<div class="nextalk-iframe" id="nextalk_iframe" '
                + 'style="width:'+ this.panel.width + 'px;height:' + this.panel.height + 'px;">'
                + '<div class="nextalk-minimize" style="width:100%;heigth:' + h + 'px;">'
                + '<a class="" title="最小化">-</a></div>'
                + '<div style="width:100%;height:' + (this.panel.height - h) + 'px;">'
                + '<iframe src="'
                + this.path
                + 'nextalk/main.html" name="nextalk_iframe" frameborder="no" scrolling="no"/>'
                + '</div></div>';
        return ifrHTML;
    };

    boot.start = function() {
        document.write(this._getCss());
        document.write(this._getBtnHTML());
        document.write(this._getIfrHTML());
    }

    win.nextalkBoot = boot;

})(window);

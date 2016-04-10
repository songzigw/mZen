/*!
 * nextalk-boot.js
 * http://nextalk.im/
 *
 * Copyright (c) 2014 NexTalk
 *
 */

(function(win, undefined) {
    var boot = {};

    boot.path = '/';

    boot._getCss = function() {
        var cssLink = '<link rel="stylesheet" type="text/css" href="'
                + this.path + 'css/nextalk-boot.css" />';
        return cssLink;
    };

    boot._getBtnHTML = function() {
        var btnHTML = '<div class="nextalk-main" id="nextalk_main">'
                + '<a class="nextalk-btn">' + '<img class="nextalk-ico" src="'
                + this.path + 'imgs/chat.png" />'
                + '<span>聊天</span></a>'
                + '<span class="nextalk-alert">5</span></div>';
        return btnHTML;
    }

    boot._getIfrHTML = function() {
        var ifrHTML = '<div class="nextalk-iframe" id="nextalk_iframe">'
                + '<a class="nextalk-alert">最小化</a>'
                + '<iframe src="'
                + this.path
                + 'nextalk/main.html" name="nextalk_iframe" frameborder="no" scrolling="no"/>'
                + '</div>';
        return ifrHTML;
    };

    boot.start = function() {
        document.write(this._getCss());
        document.write(this._getBtnHTML());
        document.write(this._getIfrHTML());
    }

    win.nextalkBoot = boot;
})(window);

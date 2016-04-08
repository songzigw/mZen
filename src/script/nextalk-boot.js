/*!
 * nextalk-boot.js
 * http://nextalk.im/
 *
 * Copyright (c) 2014 NexTalk
 *
 */

document
        .write('<link rel="stylesheet" type="text/css" href="../css/nextalk-boot.css" />');

var nextalkBtnHTML = '<div class="nextalk-main" id="nextalk_main">'
        + '<a class="nextalk-btn">'
        + '<img class="nextalk-ico" src="../imgs/chat.png" />'
        + '<span>聊天</span></a>' + '<span class="nextalk-alert">5</span></div>';
var nextalkIfrHTML = '<div class="nextalk-iframe" id="nextalk_iframe">'
        + '<a class="nextalk-alert">最小化</a>'
        + '<iframe src="main.html" name="nextalk_iframe" frameborder="no" scrolling="no"/>'
        + '</div>';

document.write(nextalkBtnHTML);
document.write(nextalkIfrHTML);

/*!
 * nextalk-boot.js
 * http://nextalk.im/
 *
 * Copyright (c) 2014 NexTalk
 *
 */

document
        .write('<link rel="stylesheet" type="text/css" href="../css/nextalk-boot.css" />');

var nextalkBtn = '<div class="nextalk-btn">'
        + '<a class="nextalk-a">'
        + '<img class="nextalk-ico" src="http://www.sobot.com/chat/pc/img/zhichichatBtnBg.png" />'
        + '<span>聊天</span></a>' + '<span class="nextalk-alert">5</span></div>';
var nextalkIfr = '<div class="nextalk-iframe">'
        + '<iframe src="main.html" name="nextalk_iframe" frameborder="no" scrolling="no"/>'
        + '</div>';

document.write(nextalkBtn);
document.write(nextalkIfr);
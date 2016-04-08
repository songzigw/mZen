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
        $el.css({bottom: offset + 'px'});
        $el.show();
        var timerTask = window.setTimeout(function() {
            $el.css({bottom: '0px'});
            window.clearTimeout(timerTask);
        }, 5);
    }
    
    //---------------------------------------


})(NexTalkWebUI, NexTalkWebIM);
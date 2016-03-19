/*!
 * nextalk-webim.js v0.0.1
 * http://nextalk.im/
 *
 * Copyright (c) 2014 NexTalk
 *
 */

var NextalkIM = NextalkIM ||
function() {
};

(function(im, $, undefined) {

    // 全局性的定义-----------------
    "use strict";

    /**
     * 消息通道强制设置为长链接方式，
     * 默认为Websocket->XMLHttpRequest(XHR)Polling层层降级方式.
     * 设置方式为NextalkIM.WEB_XHR_POLLING = true;
     */
    im.WEB_XHR_POLLING = true;

    /** 错误码 */
    im.errCode = {};
    /** 请求协议(通道) */
    im.connChannel = {};
    /** 连接情形 */
    im.connState = {};
    /** 连接状态 */
    im.connStatus = {};
    /** 会话通知状态 */
    im.conversationNoticeStatus = {};
    /** 会话类型 */
    im.conversationType = {};
    /** 消息方向 */
    im.messageDirection = {};
    /** 收取状态 */
    im.receivedStatus = {};
    /** 搜索类型 */
    im.searchType = {};
    /** 发送状态 */
    im.sentStatus = {};

    (function(ec) {
        /** 未知原因失败 */
        ec["UNKNOWN"] = -1;
        /** 请求超时 */
        ec["TIMEOUT"] = 0;

    })(im.errCode);

    // 定义各种消息类----------------

    im.Message = function() {

    };

    im.TextMsg = function() {

    };

    // 实例化NextalkIM类对象----------------

    /** 实例化一个客户端 */
    im._instance = undefined;
    /**
     * 获取实例化的客户端
     */
    im.getInstance = function() {
        if (!im._instance) {
            throw new Error("NextalkIM is not initialized.");
        }
        return im._instance;
    };

    /**
     * 初始化WebIM，在整个应用全局只需要调用一次。
     * @param {string} appKey 开发者的AppKey
     * @example
     * NextalkIM.init("app_key");
     */
    im.init = function(appKey) {
        if (!im._instance) {
            im._instance = new im();
        }
    };

    /**
     * 设置连接监听状态（status标识当前连接状态）
     */
    im.prototype.setConnectionStatusListener = function() {

    };

    /**
     * 消息监听器
     */
    im.prototype.setOnReceiveMessageListener = function() {

    };

    /**
     * 获取用户token
     */
    im.prototype.getToken = function(uid) {

    };

    /**
     * 连接服务器
     */

    /**
     * 发送消息，发送单聊消息，群组消息，聊天室消息。
     */

    /**
     * 同步会话列表
     */

    /**
     * 获取历史消息
     */

    /**
     * 自定义消息
     */

    /**
     * 检测是否有未读的消息
     */

})(NextalkIM, $);

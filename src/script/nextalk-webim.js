/*!
 * nextalk-webim.js v0.0.1
 * http://nextalk.im/
 * 
 * Copyright (c) 2014 NexTalk
 * 
 */

/**
 * 消息通道强制设置为长链接方式，
 * 默认为Websocket->XMLHttpRequest Polling层层降级方式.
 * 设置方式为window.WEB_XHR_POLLING=true;
 * @example
 * //在引入RongIMLib.js之前加入如下代码：
 * <script>window["WEB_XHR_POLLING"] = true</script>
 */

var NextalkWebIM = NextalkWebIM || function() {};

(function(w, im, undefined) {

	/** 实例化一个客户端 */
    im._instance = undefined;
	
    /**
     * 获取实例化的客户端
     */
    im.getInstance = function () {
        if (!im._instance) {
            throw new Error("NextalkWebIM is not initialized. Call .init() method first.");
        }
        return im._instance;
    };
    
	/**
	 * 初始化WebIM，在整个应用全局只需要调用一次。
	 * @param {string} appKey 开发者的AppKey
	 */
	im.init = function(appKey) {};
	
	/**
	 * 设置连接监听状态（status标识当前连接状态）
	 */
	im.setConnectionStatusListener = function() {
		
	};
	
	/**
	 * 消息监听器
	 */
	im.setOnReceiveMessageListener = function() {
		
	};
	
	/**
	 * 获取用户token
	 */
	im.getToken = function(uid) {
		
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
	
})(window, NextalkWebIM);
nextalkMain.setConfig({
    // 引入资源文件的根路径
    resPath : _IMC.resPath,
    // API根路径
    apiPath : _IMC.apiPath,
    // API路由
    route : {
        online : "index.php?action=online",
        offline : "index.php?action=offline",
        deactivate : "index.php?action=refresh",
        message : "index.php?action=message",
        presence : "index.php?action=presence",
        status : "index.php?action=status",
        setting : "index.php?action=setting",
        history : "index.php?action=history",
        clear : "index.php?action=clear_history",
        download : "index.php?action=download_history",
        buddies : "index.php?action=buddies",
        // room actions
        invite : "index.php?action=invite",
        join : "index.php?action=join",
        leave : "index.php?action=leave",
        block : "index.php?action=block",
        unblock : "index.php?action=unblock",
        members : "index.php?action=members",
        // notifications
        notifications : "index.php?action=notifications",
        // asks
        asks : "index.php?action=asks",
        accept : "index.php?action=accept_ask",
        reject : "index.php?action=reject_ask",
        // upload files
        upload : "static/images/upload.php"
    },
    // 嵌入窗口右下角
    iframe : _IMC.iframe,
    // 简易版本
    simple : _IMC.simple
});

// 聊天按钮对应的Uid
nextalkMain.chatlinkIds = _IMC.chatlinkIds;
try {
    // 当聊天对象状态变化
    nextalkMain.onChatlinks = function(data) {
        if (data) {
            for ( var key in data) {
                if (data[key] != 'unavailable') {
                    document.getElementById('webim-chatid-' + key).innerText = '在线';
                } else {
                    document.getElementById('webim-chatid-' + key).innerText = '下线';
                }
            }
        }
    };
    // 给聊天按钮设置单击事件
    // 注意传递参数 uid nick avatar
    var uids = _IMC.chatlinkIds.split(',');
    for (var i = 0; i < uids.length; i++) {
        document.getElementById('webim-chatid-' + uids[i]).onclick = function() {
            if (_IMC.window == true) {
                nextalkMain.openChatBoxWin(uids[i], 'user' + uids[i], '');
            } else {
                nextalkMain.openChatBoxUI(uids[i], 'user' + uids[i], '');
            }
        };
    }
} catch (e) {
}

nextalkMain.go();
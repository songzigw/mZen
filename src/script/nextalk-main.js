if (!nextalkResPath) {
    throw Error('nextalkResPath not settings');
}

document.write('<link rel="stylesheet" type="text/css" href="'+nextalkResPath+'css/mzen.css" />');
document.write('<link rel="stylesheet" type="text/css" href="'+nextalkResPath+'css/glyphicons.css" />');
document.write('<link rel="stylesheet" type="text/css" href="'+nextalkResPath+'css/nextalk-webui.css" />');
document.write('<script type="text/javascript" src="'+nextalkResPath+'script/jquery.min.js"></script>');
document.write('<script type="text/javascript" src="'+nextalkResPath+'script/nextalk-webim.js"></script>');
document.write('<script type="text/javascript" src="'+nextalkResPath+'script/nextalk-webui.js"></script>');

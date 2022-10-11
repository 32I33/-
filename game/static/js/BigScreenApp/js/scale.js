(function () {
    //设定大屏是在1920*969的分辨率下进行设计
    const INIT_WIDTH = 1920, INIT_HEIGHT = 969;

    //获取整个界面的html节点
    let page = document.getElementById('content');

    //设置界面的初始宽度
    page.style.width = INIT_WIDTH + 'px';

    //设置界面的初始高度
    page.style.height = INIT_HEIGHT + 'px';

    //定义一个方法使界面自适应
    function pageResize() {
        //获取当前窗口的宽度
        let realWidth = window.innerWidth;

        //获取当前窗口的高度
        let realHeight = window.innerHeight

        //获取界面缩放的比例
        let r = (realWidth / INIT_WIDTH) < (realHeight / INIT_HEIGHT) ? (realWidth / INIT_WIDTH) : (realHeight / INIT_HEIGHT);

        //增加界面缩放过渡效果
        page.style.transform = `scale( ${r})`;

        //由于界面是以原中心点为基准进行缩放，所以缩放之后需要调整外边距，使其位于窗口的中心位置
        page.style.marginLeft = (-(INIT_WIDTH - r * INIT_WIDTH) / 2 + (realWidth - r * INIT_WIDTH) / 2) + 'px';

        page.style.marginTop = (-(INIT_HEIGHT - r * INIT_HEIGHT) / 2 + (realHeight - r * INIT_HEIGHT) / 2) + 'px';

        page.style.marginBottom = (-(realHeight > INIT_HEIGHT ? realHeight : (INIT_HEIGHT - r * INIT_HEIGHT))) + 'px';

        page.style.marginRight = (-(realWidth > INIT_WIDTH ? realWidth : (INIT_WIDTH - r * INIT_WIDTH))) + 'px';
    }

    //使界面自适应
    pageResize();

    //监听窗口尺寸变化
    window.addEventListener('resize', pageResize);
})()
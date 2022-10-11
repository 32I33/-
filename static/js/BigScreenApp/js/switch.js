(function () {
    //定义控制界面跳转标志
    let switchFlag = 0;

    //定义界面跳转定时器
    let switchTimer = null;

    //定义一个方法实现界面跳转
    function switchPage() {
        //更改控制界面跳转标志
        switchFlag = (switchFlag == 1) ? 0 : 1;

        //界面切换判断,若控制界面跳转标志为0则使主体界面1显示,否则使主体界面2显示
        if (switchFlag == 1) {
            //控制界面跳转标志为1,让主体界面1添加显示样式使主体界面1显示,同时删除主体界面2的显示样式
            if ($('.main-two').hasClass('show')) {
                $('.main-two').removeClass('show');
            }

            $('.main-one').addClass('show');
        } else {
            //控制界面跳转标志为0,让主体界面2添加显示样式使主体界面2显示,同时删除主体界面1的显示样式
            if ($('.main-one').hasClass('show')) {
                $('.main-one').removeClass('show');
            }

            $('.main-two').addClass('show');
        }
    }

    //使主体界面1显示
    $('.main-one').addClass('show');

    //关闭界面跳转定时器
    clearInterval(switchTimer);

    //开启界面跳转定时器,每10秒切换1次主体界面
    switchTimer = setInterval(switchPage, 10000);
})()
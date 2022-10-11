(function () {
    //获取异常展示图表的html节点
    const SCROLL_CONTENT = document.getElementById('scrollContent');

    //获取SCROLL_CONTENT的第一个子节点
    let contentUl = SCROLL_CONTENT.children[0];

    //定义滚动方向为向上滚动
    const DIRECTION = -1;

    //定义网络连接判断标志
    let layerFlag = null;

    //定义图表滚动定时器
    let scrollShow = null;

    //定义后端数据获取定时器
    let scrollTimer = null;

    //定义一个方法实现异常展示图表滚动
    function move() {
        //关闭图表滚动定时器
        clearInterval(scrollShow);

        //开启图表滚动定时器
        scrollShow = setInterval(function () {
            //使内容向上偏移
            contentUl.style.top = contentUl.offsetTop + DIRECTION + 'px';

            //若向上偏移的高度小于内容绝对高度的一半则使内容头部位置重置为0
            if (contentUl.offsetTop <= -(contentUl.offsetHeight / 2)) {
                contentUl.style.top = 0 + 'px';
            }
        }, 15);
    }

    //定义一个方法将后台返回的时间格式化为北京时间
    function timeFormat(time) {
        const STANDARD = new Date(time);

        return (
            STANDARD.getFullYear() +
            '-' + (STANDARD.getMonth() + 1) +
            '-' + STANDARD.getDate() +
            ' ' + STANDARD.getHours() +
            ':' + STANDARD.getMinutes() +
            ':' + STANDARD.getSeconds()
        );
    }

    //定义一个方法创建异常信息
    function crateInfoItem(timeInfo, data) {
        return $(
            '<li>' +
            '    <span>' + data.username + '</span>' +
            '    <span>' + data.address_city + '</span>' +
            '    <span>' + data.type + '</span>' +
            '    <span>' + timeInfo + '</span>' +
            '</li>'
        );
    }

    //定义一个方法请求后端数据并重新渲染异常展示图表
    function scroll() {
        $.ajax({
            url: 'http://127.0.0.1:8000/scroll?timestamp=' + new Date().getTime(),
            type: 'post',
            dataType: 'json',
            timeout: 5000,
            success: function (data) {
                //若值不为空,则关闭网络连接失败提示，提示用户网络连接正常
                if (layerFlag) {
                    //关闭网络连接失败提示
                    layer.close(layerFlag);

                    //网络连接判断标志赋值为空
                    layerFlag = null;

                    //提示用户网络连接正常
                    layer.msg('网络连接正常', {
                        icon: 1,
                        time: 2000
                    });
                }

                //获取滚动内容父节点
                let $scrollList = $('#scrollContent ul');

                //清空现有滚动内容父节点下的li
                $scrollList.find('li').remove();

                //遍历获取到的数据并把数据封装成一条条异常信息
                $.each(data, function (index, ele) {
                    //把当前遍历的元素封装成异常信息
                    let $item = crateInfoItem(timeFormat(ele.measuretm), ele);

                    //把封装后的异常信息添加到ul
                    $scrollList.append($item);
                });

                //让显示内容翻倍
                contentUl.innerHTML += contentUl.innerHTML;
            },
            error: function (xhr, type, errorThrown) {
                //添加网络连接失败提示,并赋值网络连接失败标志
                layerFlag = layer.msg('网络连接失败', {
                    icon: 7,
                    time: 60000
                });
            }
        });
    }

    //让显示的内容翻倍
    contentUl.innerHTML += contentUl.innerHTML;

    //实现异常展示图表滚动
    move();

    //利用ajax方法请求后端数据并重新渲染异常展示图表
    scroll();

    //关闭后端数据获取定时器
    clearInterval(scrollTimer);

    //开启后端数据获取定时器，每60秒获取1次最新数据并重新渲染异常展示图表
    scrollTimer = setInterval(scroll, 60000);
})()
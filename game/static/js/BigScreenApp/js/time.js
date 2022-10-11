(function () {
    //定义时间实时更新定时器
    let timeTimer = null;

    //定义一个方法使时间格式化显示
    function fillZero(time) {
        //定义变量存储格式化的时间
        let timeFormat;
 
        //若时间数小于10则在前面添加0,否则不做任何处理
        if (time < 10) {
            timeFormat = '0' + time;
        } else {
            timeFormat = time;
        }
 
        //把处理后的结果返回
        return timeFormat;
    }

    //定义一个方法实时更新时间
    function updateTime() {
        //定义星期数组列表
        let weekList = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];

        //定义变量存储获取到的当前时间
        let nowTime;

        //获取当前时间
        let realDate = new Date();

        //获取当前年份(4位,1970-????)
        let realYear = realDate.getFullYear();

        //获取当前月份(0-11,0代表1月)
        let realMonth = realDate.getMonth() + 1;

        //获取当前日(1-31)
        let realToday = realDate.getDate();

        //获取当前星期X(0-6,0代表星期天)
        let realDay = realDate.getDay();

        //获取当前小时数(0-23)
        let realHour = realDate.getHours();

        //获取当前分钟数(0-59)
        let realMinute = realDate.getMinutes();

        //获取当前秒数(0-59)
        let realSecond = realDate.getSeconds();

        //把获取到的时间赋值给nowTime
        nowTime = realYear + '-' + fillZero(realMonth) + '-' + fillZero(realToday) + '&nbsp;&nbsp;' + fillZero(realHour) + ':' + fillZero(realMinute) + ':' + fillZero(realSecond) + '&nbsp;&nbsp;' + weekList[realDay] + '&nbsp;&nbsp;';

        //更新时间
        $('#time').html(nowTime);
    };

    //关闭时间实时更新定时器
    clearInterval(timeTimer);

    //开启时间实时更新定时器，每1秒更新1次时间
    timeTimer = setInterval(updateTime, 1000);
})()
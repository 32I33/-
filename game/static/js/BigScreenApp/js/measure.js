(function () {
    //获取7个图表的html父节点
    let listChart = document.getElementsByClassName('list');

    //创建测量统计图表(体温)echarts实例
    let tempChart = echarts.init(document.getElementById('temp'));

    //创建测量统计图表(呼吸)echarts实例
    let respChart = echarts.init(document.getElementById('resp'));

    //创建测量统计图表(心率)echarts实例
    let heartChart = echarts.init(document.getElementById('heart'));

    //创建测量统计图表(脉率)echarts实例
    let pulseChart = echarts.init(document.getElementById('pulse'));

    //创建测量统计图表(血氧)echarts实例
    let spo2Chart = echarts.init(document.getElementById('spo2'));

    //创建测量统计图表(舒张压)echarts实例
    let diastolicChart = echarts.init(document.getElementById('diastolic'));

    //创建测量统计图表(收缩压)echarts实例
    let systolicChart = echarts.init(document.getElementById('systolic'));

    //定义网络连接判断标志
    let layerFlag = null;

    //定义7个图表的空间坐标位置信息的数据列表
    let listPosition = [{ translateX: '-900px', translateZ: '-600px', opacity: '0' },
    { translateX: '-600px', translateZ: '-400px', opacity: '0' },
    { translateX: '-300px', translateZ: '-200px', opacity: '0' },
    { translateX: '0px', translateZ: '0px', opacity: '1' },
    { translateX: '300px', translateZ: '-200px', opacity: '0' },
    { translateX: '600px', translateZ: '-400px', opacity: '0' },
    { translateX: '900px', translateZ: '-600px', opacity: '0' }];

    //定义包含男女各自7个参数的测量平均值的数据列表(0:体温、1:呼吸、2:心率、3:脉率、4:血氧、5:舒张压、6:收缩压;[][0/1]:男、[][2/3]:女)
    let measureData =
        [
            [[36.0, 36.1, 36.5, 36.3, 36.2], [36.0, 36.1, 36.5, 36.3, 36.2], [36.1, 36.3, 36.5, 36.0, 36.3], [36.1, 36.3, 36.5, 36.0, 36.3]],
            [[26, 20, 19, 18, 17], [26, 20, 19, 18, 17], [24, 21, 19, 19, 18], [24, 21, 19, 19, 18]],
            [[100, 85, 80, 70, 65], [100, 85, 80, 70, 65], [95, 85, 80, 75, 64], [95, 85, 80, 75, 64]],
            [[101, 84, 79, 71, 66], [101, 84, 79, 71, 66], [97, 83, 81, 76, 66], [97, 83, 81, 76, 66]],
            [[99, 98, 96, 97, 100], [99, 98, 96, 97, 100], [97, 99, 98, 98, 100], [97, 99, 98, 98, 100]],
            [[60, 87, 80, 75, 65], [60, 87, 80, 75, 65], [62, 88, 81, 80, 67], [62, 88, 81, 80, 67]],
            [[90, 110, 120, 130, 135], [90, 110, 120, 130, 135], [92, 115, 125, 128, 132], [92, 115, 125, 128, 132]]
        ]

    //对测量统计图表配置项进行设置
    let measureOption = {
        //图表标题配置
        title: {
            text: '{a| 体温(℃)}',
            x: '10',
            y: '10',
            textStyle: {
                rich: {
                    a: {
                        fontSize: 15,
                        color: '#fff',
                        fontFamily: '微软雅黑',
                        fontWeight: 'bold'
                    },
                },
            },
        },
        //图表提示框配置
        tooltip: {
            show: false
        },
        //图表位置配置
        grid: {
            left: '4%',
            right: '2%',
            bottom: '5%',
            top: '20%',
            //	padding:'0 0 10 0',
            containLabel: true,
        },
        //图表图例配置
        legend: {
            right: '8%',
            top: '2%',
            itemGap: 20,
            itemWidth: 10,
            itemHeight: 10,
            selectedMode: false,
            data: [{
                name: '男'
            },
            {
                name: '女',
            }],
            textStyle: {
                color: '#fff',
                fontFamily: '微软雅黑',
                fontSize: 15
            }
        },
        //x轴配置
        xAxis: [
            {
                type: 'category',
                data: ['0~19岁', '20~29岁', '30~39岁', '40~49岁', '50岁以上'],
                axisLabel: { //坐标轴刻度标签的相关设置。
                    textStyle: {
                        color: '#fff',
                        fontFamily: '微软雅黑',
                        fontSize: 14,
                    },
                },
                axisTick: {//坐标轴刻度相关设置。
                    show: false,
                },
                axisLine: {//坐标轴轴线相关设置
                    lineStyle: {
                        color: '#fff',
                        opacity: 0.2
                    }
                },
                splitLine: { //坐标轴在 grid 区域中的分隔线。
                    show: false,
                }
            }
        ],
        //y轴配置
        yAxis: [
            {
                type: 'value',
                splitNumber: 5,
                axisLabel: {
                    textStyle: {
                        color: '#fff',
                        fontFamily: '微软雅黑',
                        fontSize: 14,
                    }
                },
                axisLine: {
                    show: false
                },
                axisTick: {
                    show: false
                },
                splitLine: {
                    show: true,
                    lineStyle: {
                        color: ['#fff'],
                        opacity: 0.06
                    }
                }

            }
        ],
        //系列数据配置
        series: [
            //扁柱体
            {
                name: '男',
                type: 'pictorialBar',
                symbolSize: ['30%', '5%'],
                symbolOffset: ['-55%', '-40%'],
                z: 12,
                symbolPosition: 'end',
                label: {
                    normal: {
                        offset: [-15, -2],
                        show: true,
                        position: 'top',
                        fontSize: 14,
                        fontWeight: 'bold',
                        color: '#00b894'
                    }
                },
                color: '#00b894',
                data: measureData[0][0]
            },
            //柱状条
            {
                name: '男',
                type: 'bar',
                stack: '0',
                barWidth: 20,
                barGap: 0,
                z: 0,
                itemStyle: {
                    normal: {
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                            offset: 0,
                            color: '#00b894'
                        },
                        {
                            offset: 1,
                            color: '#00b89420'
                        }
                        ]),
                        opacity: .8
                    },
                },
                data: measureData[0][1]
            },
            {
                name: '女',
                type: 'pictorialBar',
                symbolSize: ['30%', '5%'],
                symbolOffset: ['55%', '-40%'],
                symbolPosition: 'end',
                z: 12,
                label: {
                    normal: {
                        offset: [15, -2],
                        show: true,
                        position: 'top',
                        fontSize: 14,
                        fontWeight: 'bold',
                        color: '#00ffff'
                    }
                },
                color: '#00ffff',
                data: measureData[0][2]
            },
            {
                name: '女',
                type: 'bar',
                barWidth: 20,
                barGap: 0,
                itemStyle: {
                    normal: {
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                            offset: 0,
                            color: '#00ffff'
                        },
                        {
                            offset: 1,
                            color: '#ffffff00'
                        }
                        ]),
                        opacity: .8
                    },
                },
                data: measureData[0][3]
            },


        ]
    }

    //定义测量统计图表空间位置切换定时器
    let switchTimer = null;

    //定义测量统计图表数据获取定时器
    let measureTimer = null;

    //定义一个方法渲染单个图表
    function renderChart(option, chart) {
        if (option && typeof option === 'object') {
            chart.setOption(option, true);
        }
    }

    //定义一个方法更新测量统计图表配置数据
    function updateMeasureData(data) {
        //清空measureData列表
        measureData = [];

        //更新测量统计图表配置数据
        measureData = data;
    }

    //定义一个方法渲染测量统计图表
    function renderCharts() {
        //定义一个常量列表存储7个图表的标题文本样式属性
        const TITLE_LIST = ['{a| 体温(℃)}', '{a| 呼吸率(RPM)}', '{a| 心率(BPM)}', '{a| 脉率(BPM)}', '{a| 血氧饱和度(%)}', '{a| 舒张压(mmHg)}', '{a| 收缩压(mmHg)}'];

        //定义一个常量列表存储7个图表的echarts实例
        const CHARTS_LIST = [tempChart, respChart, heartChart, pulseChart, spo2Chart, diastolicChart, systolicChart];

        //使用嵌套循环依次渲染7个图表
        for (let i = 0; i < measureData.length; i++) {
            //更改图表标题文本属性
            measureOption.title.text = TITLE_LIST[i];

            //更改图表系列数据
            for (let j = 0; j < measureData[i].length; j++) {
                measureOption.series[j].data = measureData[i][j];

                //若j == 3则渲染图表
                if (j == 3) {
                    renderChart(measureOption, CHARTS_LIST[i]);
                }
            }
        }
    }

    //定义一个方法实现测量统计图表空间位置切换
    function switchChart() {
        //7个图表空间位置依次切换
        for (let i = 0; i < listChart.length; i++) {
            //更改当前遍历到的图表的空间位置
            listChart[i].style.transform = 'translate3d(' + listPosition[i].translateX + ',0,' + listPosition[i].translateZ + ')';

            //更改当前遍历到的图表的opacity属性
            listChart[i].style.opacity = listPosition[i].opacity;
        }

        //更新listPosition列表,以便下一次图表空间位置切换
        listPosition.unshift(listPosition.pop());
    };

    //定义一个方法请求后端数据并重新渲染测量统计图表
    function measure() {
        $.ajax({
            url: 'http://127.0.0.1:8000/measure?timestamp=' + new Date().getTime(),
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

                //更新测量统计图表配置数据
                updateMeasureData(data);

                //重新渲染测量统计图表
                renderCharts();
            },
            error: function (xhr, type, errorThrown) {
                //添加网络连接失败提示,并赋值网络连接失败标志
                layerFlag = layer.msg('网络连接失败', {
                    icon: 7,
                    time: 60000
                });
            }
        })
    }

    //渲染测量统计图表
    renderCharts();

    //利用ajax方法请求后端数据并重新渲染测量统计图表
    measure();

    //关闭测量统计图表空间位置切换定时器
    clearInterval(switchTimer);

    //关闭测量统计图表数据获取定时器
    clearInterval(measureTimer);

    //开启测量统计图表空间位置切换定时器，每4秒切换1次图表空间位置
    switchTimer = setInterval(switchChart, 4000);

    //开启测量统计图表数据获取定时器,每60秒获取1次最新数据并重新渲染测量统计图表
    measureTimer = setInterval(measure, 60000);
})()
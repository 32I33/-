(function () {
    //创建用户排行图表echarts实例
    let rankChart = echarts.init(document.getElementById('rank'));

    //定义时间点数据列表
    const TIME_LIST = ['前2个月', '前一个月', '现在'];

    //定义网络连接判断标志
    let layerFlag = null;

    //定义近3个月来用户数量排行前5的省级地区的数据列表
    let rankData = [[['广州市', '烟台市', '合肥市', '杭州市', '桂林市'],
    ['合肥市', '杭州市', '桂林市', '衡水市', '深圳市'],
    ['广州市', '杭州市', '桂林市', '衡水市', '深圳市']],
    [[100, 60, 55, 40, 30],
    [90, 70, 65, 60, 50],
    [110, 100, 75, 65, 40]]];

    //定义包含近3个月来出现的所有地区的数据列表
    let proAllList = ['广州市', '烟台市', '合肥市', '杭州市', '桂林市', '衡水市', '深圳市'];

    //对用户排行图表配置项进行设置
    let rankOption = {
        //基础图表样式配置
        baseOption: {
            //标题配置
            title: {
                text: '全国用户数量前五名',
                x: 'center',
                y: '2%',
                textStyle: {
                    fontSize: 20,
                    color: '#1fa8c0'
                }
            },
            //时间轴配置
            timeline: {
                axisType: 'category',
                autoPlay: true,
                playInterval: 2000,
                left: '10%',
                right: '10%',
                bottom: '3%',
                lineStyle: {
                    opacity: 0.5,
                    width: 10,
                    color: '#fff'
                },
                emphasis: {
                    show: false
                },
                label: {
                    show: true,
                    color: '#fff',
                    fontSize: 15,
                    position: 'bottom',
                    formatter: '{value}',
                    emphasis: {
                        show: false
                    }
                },
                itemStyle: {
                    color: '#fff'
                },
                symbolSize: 15,
                checkpointStyle: {
                    color: '#1fa8c0'
                },
                controlStyle: {
                    show: false
                },
                progress: {
                    lineStyle: {
                        color: '#1fa8c0'
                    },
                    label: {
                        color: '#fff',
                        fontSize: 15
                    }
                },
                data: TIME_LIST
            },
            //提示框配置
            tooltip: {
                show: false
            },
            //图例配置
            grid: {
                left: '3%',
                right: '15%',
                bottom: '20%',
                top: '10%',
                containLabel: true
            },
            //y轴配置
            yAxis: [{
                type: 'category',
                axisLabel: {
                    fontSize: 20,
                    color: function (params) {
                        let colorList = ['#05f8d6', '#0082fc', '#22ed7c', '#09b0d3', '#009db2', '#749f83',
                            '#ca8622', '#bda29a', '#a8d8ea', '#aa96da'];

                        return colorList[proAllList.indexOf(params)];
                    }
                },
                axisLine: {
                    lineStyle: {
                        color: '#05f8d6'
                    },
                },
                axisTick: false
            }],
            //x轴配置
            xAxis: [{
                type: 'value',
                splitNumber: 8,
                axisLine: {
                    show: false
                },
                axisLabel: {
                    show: false
                },
                splitLine: {
                    show: false
                },
            }],
            //系列数据配置
            series: [{
                type: 'bar',
                label: {
                    show: true,
                    position: 'right',
                    formatter: '{c}人',
                    fontSize: 20,
                    color: '#fff'
                },
                itemStyle: {
                    color: function (params) {
                        let colorList = ['#05f8d6', '#0082fc', '#22ed7c', '#09b0d3', '#009db2', '#749f83',
                            '#ca8622', '#bda29a', '#a8d8ea', '#aa96da'];

                        return colorList[proAllList.indexOf(params.name)];
                    }
                },
            },
            {
                type: 'bar',
                barWidth: '50%',
                barGap: '-100%',
                itemStyle: {
                    color: function (params) {
                        let colorList = ['#05f8d6', '#0082fc', '#22ed7c', '#09b0d3', '#009db2', '#749f83',
                            '#ca8622', '#bda29a', '#a8d8ea', '#aa96da'];

                        return colorList[proAllList.indexOf(params.name)];
                    }
                }
            }
            ],
            //动画更新
            animationEasingUpdate: 'quinticInOut',
            //动画显示间隔时间
            animationDurationUpdate: 1000,
        },
        //异步加载数据配置
        options: [{
            yAxis: {
                data: rankData[0][0],
            },
            series: [{
                data: rankData[1][0]
            },
            {
                data: rankData[1][0]
            }]
        }, {
            yAxis: {
                data: rankData[0][1],
            },
            series: [{
                data: rankData[1][1]
            },
            {
                data: rankData[1][1]
            }]
        }, {
            yAxis: {
                data: rankData[0][2],
            },
            series: [{
                data: rankData[1][2]
            },
            {
                data: rankData[1][2]
            }]
        }]
    };

    //定义用户排行图表数据获取定时器
    let rankTimer = null;

    //定义一个方法更新用户排行图表配置数据
    function updateRankData(data) {
        //定义出现的所有省级地区的合并列表
        let proConcatList = [];

        //清空包含近3个月来出现的所有地区的数据列表
        proAllList = [];

        //更新数据
        for (let i = 0; i < data.length; i++) {
            //对rankData列表重新赋值
            for (let j = 0; j < data[i].length; j++) {
                rankData[0][i][j] = data[i][j].name;

                rankData[1][i][j] = data[i][j].value;
            }
        }

        //对近3个月来排行前5的省级地点进行合并
        for (let i = 0; i < rankData[0].length; i++) {
            //定义中间变量
            let temp;

            //把合并遍历的数据项赋值给中间变量
            temp = proConcatList.concat(rankData[0][i]);

            //清空proConcatList列表
            proConcatList = [];

            //把合并后的列表赋值给proConcatList列表
            proConcatList = temp;
        }

        //去除合并列表中的重复项并赋值给proAllList列表
        for (let i in proConcatList) {
            if (proAllList.indexOf(proConcatList[i]) == -1) {
                proAllList.push(proConcatList[i]);
            }
        }
    }

    //定义一个方法渲染用户排行图表
    function renderChart() {
        //渲染用户排行图表
        if (rankOption && typeof rankOption === 'object') {
            rankChart.setOption(rankOption, true);
        }
    }

    //定义一个方法请求后端数据并重新渲染用户排行图表
    function rank() {
        $.ajax({
            url: 'http://127.0.0.1:8000/rank?timestamp=' + new Date().getTime(),
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

                //更新用户排行图表配置数据
                updateRankData(data);

                //重新渲染用户排行图表
                renderChart();
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

    //渲染用户排行图表
    renderChart();

    //利用ajax方法请求后端数据并重新渲染用户排行图表
    rank();

    //关闭用户排行图表数据获取定时器
    clearInterval(rankTimer);

    //开启用户排行图表数据获取定时器，每60秒获取1次最新数据并重新渲染用户排行图表
    rankTimer = setInterval(rank, 60000);
})()
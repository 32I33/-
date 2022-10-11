(function () {
    //创建年龄分布图表echarts实例
    let ageChart = echarts.init(document.getElementById('age'));

    //定义年龄分布图表高亮切换计数器
    let ageIndex = 0;

    //定义网络连接判断标志
    let layerFlag = null;

    //定义包含对应5个年龄段的用户数量的数据列表
    let ageData = [
        { name: '0-19岁', value: 100 },
        { name: '20-29岁', value: 50 },
        { name: '30-39岁', value: 60 },
        { name: '40-49岁', value: 80 },
        { name: '50岁以上', value: 40 }
    ];

    //对年龄分布图表配置项进行设置
    let ageOption = {
        //图例属性配置
        legend: {
            data: ['0-19岁', '20-29岁', '30-39岁', '40-49岁', '50岁以上'],
            icon: 'rect',
            top: 45,
            right: 25,
            itemGap: 35,
            itemWidth: 15,
            itemHeight: 15,
            orient: 'vertical',
            textStyle: {
                padding: [0, 0, 0, 5],
                color: '#fff',
                fontSize: '20'
            }
        },
        //提示框配置
        tooltip: {
            show: false
        },
        //颜色配置
        color: [
            '#05f8d6',
            '#0082fc',
            '#22ed7c',
            '#09b0d3',
            '#f47a75'
        ],
        //图表系列数据配置
        series: [{
            type: 'pie',
            radius: ['68%', '50%'],
            center: ['35%', '50%'],
            label: {
                normal: {
                    position: 'center'
                }
            },
            data: [
                {
                    value: ageData[0].value,
                    name: ageData[0].name,
                    label: {
                        normal: {
                            show: false,
                            formatter: '{b}\n\n{c}人\n\n{d}%',
                            textStyle: {
                                color: '#fff',
                                fontSize: 22
                            }
                        }
                    }
                },
                {
                    value: ageData[1].value,
                    name: ageData[1].name,
                    label: {
                        normal: {
                            show: false,
                            formatter: '{b}\n\n{c}人\n\n{d}%',
                            textStyle: {
                                color: '#fff',
                                fontSize: 22
                            }
                        }
                    }
                },
                {
                    value: ageData[1].value,
                    name: ageData[2].name,
                    label: {
                        normal: {
                            show: false,
                            formatter: '{b}\n\n{c}人\n\n{d}%',
                            textStyle: {
                                color: '#fff',
                                fontSize: 22
                            }
                        }
                    }
                },
                {
                    value: ageData[3].value,
                    name: ageData[3].name,
                    label: {
                        normal: {
                            show: false,
                            formatter: '{b}\n\n{c}人\n\n{d}%',
                            textStyle: {
                                color: '#fff',
                                fontSize: 22
                            }
                        }
                    }
                },
                {
                    value: 110,
                    name: '50岁以上',
                    label: {
                        normal: {
                            show: false,
                            formatter: '{b}\n\n{c}人\n\n{d}%',
                            textStyle: {
                                color: '#fff',
                                fontSize: 22
                            }
                        }
                    }
                }
            ]
        }]
    };

    //定义年龄分布图表高亮切换定时器
    let switchTimer = null;

    //定义年龄分布图表数据获取定时器
    let ageTimer = null;

    //定义一个方法更新年龄分布图表配置数据
    function updateAgeData(data) {
        //使用for循环更新年龄分布图表配置数据
        for (let i = 0; i < data.length; i++) {
            ageOption.series[0].data[i].value = data[i];
        }
    }

    //定义一个方法渲染年龄分布图表
    function renderChart() {
        //渲染年龄分布图表
        if (ageOption && typeof ageOption === 'object') {
            ageChart.setOption(ageOption, true);
        }
    }

    //定义一个方法使年龄分布图表高亮切换
    function switchChart() {
        //将当前项高亮属性设置为false
        ageOption.series[0].data[ageIndex].label.normal.show = false;

        //取消当前项高亮
        ageChart.dispatchAction({
            type: 'downplay',
            seriesIndex: 0,
            dataIndex: ageIndex
        })

        //地理分布图表高亮切换计数器循环加1,最大为ageData列表的长度,达到最大值重置为0
        ageIndex = (ageIndex + 1) % ageData.length

        //将下一项高亮属性设置为true
        ageOption.series[0].data[ageIndex].label.normal.show = true;

        //渲染年龄分布图表
        renderChart();

        //高亮下一项
        ageChart.dispatchAction({
            type: 'highlight',
            seriesIndex: 0,
            dataIndex: ageIndex
        })
    };

    //定义一个方法请求后端数据并重新渲染年龄分布图表
    function age() {
        $.ajax({
            url: 'http://127.0.0.1:8000/age?timestamp=' + new Date().getTime(),
            type: 'post',
            dataType: 'json',
            timeout:5000,
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

                //更新年龄分布图表配置数据
                updateAgeData(data);

                //重新渲染年龄分布图表
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

    //渲染年龄分布图表
    renderChart();

    //年龄分布图表高亮切换
    switchChart();

    //利用ajax方法请求后端数据并重新渲染年龄分布图表
    age();

    //关闭年龄分布图表高亮切换定时器
    clearInterval(switchTimer);

    //关闭年龄分布图表数据获取定时器
    clearInterval(ageTimer);

    //开启年龄分布图表高亮切换定时器，每1.5秒取消当前项高亮,高亮下一项，同时展示下一项的数据
    switchTimer = setInterval(switchChart, 1500);

    //开启年龄分布图表数据获取定时器,每60秒获取1次最新数据并重新渲染年龄分布图表
    ageTimer = setInterval(age, 60000);
})()

(function () {
    //获取参数展示图表标题的html节点
    let ageType = document.getElementById('age-type');

    //创建参数展示图表(呼吸)echarts实例
    let respChart = echarts.init(document.getElementById('respChart'));

    //创建参数展示图表(体温)echarts实例
    let tempChart = echarts.init(document.getElementById('tempChart'));

    //创建参数展示图表(血氧)echarts实例
    let spo2Chart = echarts.init(document.getElementById('spo2Chart'));

    //创建参数展示图表(血压)echarts实例
    let pressureChart = echarts.init(document.getElementById('pressureChart'));

    //创建参数展示图表(心率)echarts实例
    let heartChart = echarts.init(document.getElementById('heartChart'));

    //创建参数展示图表(脉率)echarts实例
    let pulseChart = echarts.init(document.getElementById('pulseChart'));

    //定义参数展示图表切换计数器
    let parameterIndex = -1;

    //定义网络连接判断标志
    let layerFlag = null;

    //定义包含用户5个年龄段中7个参数平均测量值的数据列表(1:体温;2:呼吸;3:心率;4:脉率;5:血氧饱和度;7:舒张压;8:收缩压)
    let parameterData = [[{ name: '0-19岁' }, 36.5, 0.3, 75, 75, 0.98, 60, 100],
    [{ name: '20-29岁' }, 36.6, 0.32, 77, 77, 0.97, 65, 105],
    [{ name: '30-39岁' }, 36.7, 0.35, 80, 80, 0.99, 70, 100],
    [{ name: '40-49岁' }, 36.8, 0.32, 75, 75, 0.98, 75, 115],
    [{ name: '50岁以上' }, 36.9, 0.3, 70, 70, 1, 80, 120]];

    //体温计测量范围30-50℃
    let tempScale = (parameterData[0][1] - 30) / (50 - 30);

    //对参数展示图表(呼吸、体温、血氧)配置项进行设置
    let parameterOption1 = {
        title: {
            text: '{a|  ' + (parameterData[0][2] * 100) + '}{c|RPM}',
            x: '34%',
            y: '87%',
            textStyle: {
                rich: {
                    a: {
                        fontSize: 22,
                        color: '#ffeb7b',
                        fontFamily: 'Oswald',
                        fontWeight: 'bold',
                    },
                    c: {
                        fontSize: 22,
                        color: '#ffeb7b'
                    },
                },
            },
        },
        series: [
            //占比环
            {
                name: '数据',
                type: 'pie',
                radius: ['30%', '55%'],
                center: ['50%', '50%'],
                silent: true,
                clockwise: true,
                startAngle: 210,
                endAngle: -30,
                z: 0,
                zlevel: 0,
                label: {
                    normal: {
                        position: 'center',
                    },
                },
                data: [
                    {
                        value: (parameterData[0][2] * 0.6666),
                        name: '',
                        itemStyle: {
                            shadowColor: '#4FADFD',
                            shadowBlur: 30,
                            shadowOffsetX: '0',
                            shadowOffsetY: '0',
                            color: {
                                // 完成的圆环的颜色
                                colorStops: [
                                    {
                                        offset: 0,
                                        color: '#81ececf0', // 0% 处的颜色
                                    },
                                    {
                                        offset: 1,
                                        color: '#00cec9', // 100% 处的颜色
                                    },
                                ],
                            },
                        },
                    },
                    {
                        value: 0.3333 + 0.6666 * (1 - parameterData[0][2]),
                        name: '',
                        label: {
                            normal: {
                                show: false,
                            },
                        },
                        itemStyle: {
                            normal: {
                                color: 'transparent',
                            },
                        },
                    },
                ],
            },
            // 分割环
            {
                name: '',
                type: 'gauge',
                radius: '71%',
                center: ['50%', '50%'],
                startAngle: 205,
                endAngle: -25,
                splitNumber: 30,
                hoverAnimation: true,
                axisTick: {
                    show: false,
                },
                splitLine: {
                    length: 25,
                    lineStyle: {
                        width: 13,
                        color: '#ffffff33',
                    },
                },
                axisLabel: {
                    show: false,
                },
                pointer: {
                    show: false,
                },
                axisLine: {
                    lineStyle: {
                        opacity: 0,
                    },
                },
                detail: {
                    show: false,
                },
                data: [
                    {
                        value: 0,
                        name: '',
                    },
                ],
            },
            //外面100圆环
            {
                name: '',
                type: 'gauge',
                radius: '67%',
                center: ['50%', '50%'],
                startAngle: 210,
                endAngle: -30,
                splitNumber: 0,
                hoverAnimation: true,
                axisTick: {
                    show: false,
                },
                axisLabel: {
                    show: false,
                },
                pointer: {
                    show: false,
                },
                axisLine: {
                    show: true,
                    lineStyle: {
                        width: 6,
                        shadowBlur: 20,
                        shadowColor: '#00b894',
                        color: [[2, '#55efc4f0']],
                    }
                }, //仪表盘轴线
                detail: {
                    show: false,
                },
                data: [
                    {
                        value: 0,
                        name: '',
                    },
                ],
            },
            //最外虚线分割环
            {
                name: '',
                type: 'gauge',
                radius: '100%',
                center: ['50%', '50%'],
                startAngle: 210,
                endAngle: -30,
                splitNumber: 64,
                hoverAnimation: true,
                axisTick: {
                    show: false,
                },
                splitLine: {
                    length: 12,
                    lineStyle: {
                        width: 2,
                        color: '#81ecec',
                    },
                },
                itemStyle: {
                    normal: {
                        shadowBlur: 20,
                        shadowColor: '#0076ef',
                        color: '#81ecec',
                    },
                },
                axisLabel: {
                    show: false,
                },
                pointer: {
                    show: false,
                },
                axisLine: {
                    lineStyle: {
                        opacity: 0,
                    },
                },
                detail: {
                    show: false,
                },
                data: [
                    {
                        value: 0,
                        name: '',
                    },
                ],
            },
            // 最外虚线标签环
            {
                name: '',
                type: 'gauge',
                radius: '100%',
                center: ['50%', '50%'],
                startAngle: 210,
                endAngle: -30,
                min: 0,
                max: 100,
                splitNumber: 4,
                hoverAnimation: true,
                axisTick: {
                    show: false,
                },
                splitLine: {
                    length: -5,
                    lineStyle: {
                        width: 2,
                        color: '#81ecec',
                    },
                },
                itemStyle: {
                    normal: {
                        shadowBlur: 20,
                        shadowColor: '#0076ef',
                        color: '#81ecec',
                    },
                },
                axisLabel: {
                    distance: -35,
                    color: '#81ecec',
                    fontSize: 15,
                    formatter: '{value}RPM',
                },
                pointer: {
                    show: false,
                },
                axisLine: {
                    lineStyle: {
                        opacity: 0,
                    },
                },
                detail: {
                    show: false,
                },
                data: [
                    {
                        value: 0,
                        name: '',
                    },
                ],
            },
        ],
    };

    //对参数展示图表(血压、心率、脉率)配置项进行设置
    let parameterOption2 = {
        title: {
            text: '{c| 血压}\n\n{a| ' + parameterData[0][6] + '/' + parameterData[0][7] + '}\n\n{c| mmHg}',
            x: '60%',
            y: 'center',
            textStyle: {
                rich: {
                    a: {
                        fontSize: 25,
                        fontWeight: 'bold',
                        color: '#ffeb7b'
                    },
                    c: {
                        fontSize: 25,
                        fontWeight: 'bold',
                        color: '#7bffe2'
                    }
                }
            }
        },
        series: [
            {
                name: '数据环',
                type: 'pie',
                radius: ['60%', '47%'],
                center: ['33%', '50%'],
                startAngle: 90,
                label: {
                    normal: {
                        position: 'center'
                    }
                },
                data: [{
                    value: parameterData[0][6],
                    name: '',
                    itemStyle: {
                        normal: {
                            shadowBlur: 20,
                            shadowColor: '#00B894',
                            color: {
                                colorStops: [{
                                    offset: 0,
                                    color: '#e68b8bcc' // 0% 处的颜色
                                },
                                {
                                    offset: 0.6,
                                    color: '#55efc4e6' // 0% 处的颜色
                                },
                                {
                                    offset: 1,
                                    color: '#81ecec' // 100% 处的颜色
                                }
                                ]
                            },
                        }
                    }
                },
                {
                    value: 140 - parameterData[0][6],
                    name: '',
                    label: {
                        normal: {
                            show: false
                        }
                    },
                    itemStyle: {
                        normal: {
                            color: '#173164'
                        }
                    }
                }
                ]
            }
        ]
    };

    //定义参数展示图表切换计数器
    let switchTimer = null;

    //定义参数展示图表数据获取定时器
    let parameterTimer = null;

    //定义一个方法更新参数展示图表配置数据
    function updateParameterData(data) {
        //清空parameterData列表
        parameterData = [];

        //更新参数展示图表配置数据
        parameterData = JSON.parse(JSON.stringify(data));
    }

    //定义一个方法渲染单个图表
    function renderChart(option, chart) {
        if (option && typeof option === 'object') {
            chart.setOption(option, true);
        }
    }

    //定义一个方法实现参数展示图表跳转
    function switchChart() {
        //参数展示图表切换计数器循环加1,最大为parameterData列表的长度,达到最大值重置为0
        parameterIndex = (parameterIndex + 1) % parameterData.length;

        //更新参数展示图表标题
        ageType.innerHTML = '年龄段：' + parameterData[parameterIndex][0].name;

        //更新呼吸图表title文本属性
        parameterOption1.title.text = '{a|  ' + (parameterData[parameterIndex][2] * 100) + '}{c|RPM}';

        //更新呼吸图表配置数据
        parameterOption1.series[0].data[0].value = (parameterData[parameterIndex][2]) * 0.6666;

        //更新呼吸图表配置数据
        parameterOption1.series[0].data[1].value = 0.3333 + 0.6666 * (1 - parameterData[parameterIndex][2]);

        //重新渲染呼吸图表
        renderChart(parameterOption1, respChart);

        //更新tempScale
        tempScale = (parameterData[parameterIndex][1] - 30) / (50 - 30);

        //更新体温图表title文本属性
        parameterOption1.title.text = '{a|  ' + (parameterData[parameterIndex][1]) + '}{c|℃}';

        //更新体温图表配置数据
        parameterOption1.series[0].data[0].value = tempScale * 0.6666;

        //更新体温图表配置数据
        parameterOption1.series[0].data[1].value = 0.3333 + 0.6666 * (1 - tempScale);

        //重新渲染体温图表
        renderChart(parameterOption1, tempChart);

        //更新血氧图表title文本属性
        parameterOption1.title.text = '{a|    ' + (parameterData[parameterIndex][5] * 100) + '}{c|%}';

        //更新呼吸图表配置数据
        parameterOption1.series[0].data[0].value = parameterData[parameterIndex][5] * 0.6666;

        //更新呼吸图表配置数据
        parameterOption1.series[0].data[1].value = 0.3333 + 0.6666 * (1 - parameterData[parameterIndex][5]);

        //重新渲染血氧图表
        renderChart(parameterOption1, spo2Chart);

        //更新血压图表title文本属性
        parameterOption2.title.text = '{c| 血压}\n\n{a| ' + parameterData[parameterIndex][6] + '/' + parameterData[parameterIndex][7] + '}\n\n{c| mmHg}';

        //更新血压图表配置数据
        parameterOption2.series[0].data[0].value = parameterData[parameterIndex][6];

        //更新血压图表配置数据
        parameterOption2.series[0].data[1].value = 140 - parameterData[parameterIndex][6];

        //重新渲染血压图表
        renderChart(parameterOption2, pressureChart);

        //更新心率图表title文本属性
        parameterOption2.title.text = '{c| 心率}\n\n{a| ' + parameterData[parameterIndex][3] + '}\n\n{c| BPM}';

        //更新心率图表配置数据
        parameterOption2.series[0].data[0].value = parameterData[parameterIndex][3];

        //更新心率图表配置数据
        parameterOption2.series[0].data[1].value = 140 - parameterData[parameterIndex][3];

        //重新渲染心率图表
        renderChart(parameterOption2, heartChart);

        //更新脉率图表title文本属性
        parameterOption2.title.text = '{c| 脉率}\n\n{a| ' + parameterData[parameterIndex][4] + '}\n\n{c| BPM}';

        //更新脉率图表配置数据
        parameterOption2.series[0].data[0].value = parameterData[parameterIndex][4];

        //更新脉率图表配置数据
        parameterOption2.series[0].data[1].value = 140 - parameterData[parameterIndex][4];

        //重新渲染脉率图表
        renderChart(parameterOption2, pulseChart);
    }

    //定义一个方法请求后端数据并重新渲染参数展示图表
    function parameter() {
        $.ajax({
            url: 'http://127.0.0.1:8000/parameter?timestamp=' + new Date().getTime(),
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

                //更新参数展示图表配置数据
                updateParameterData(data);
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

    //参数展示图表跳转
    switchChart();

    //利用ajax方法请求后端数据并重新渲染参数展示图表
    parameter();

    //关闭参数展示图表切换计数器
    clearInterval(switchTimer);

    //关闭参数展示图表数据获取定时器
    clearInterval(parameterTimer);

    //开启参数展示图表切换计数器，每2秒跳转1次参数展示图表
    switchTimer = setInterval(switchChart, 2000);

    //开启参数展示图表数据获取定时器,每60秒获取1次最新数据并重新渲染参数展示图表
    parameterTimer = setInterval(parameter, 60000);
})()

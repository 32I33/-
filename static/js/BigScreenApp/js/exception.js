(function () {
    //创建异常统计图表echarts实例
    let exceptionChart = echarts.init(document.getElementById('exception'));

    //定义网络连接判断标志
    let layerFlag = null;

    //定义包含用户男女各自的异常占比的数据列表
    let exceptionData = [
        //男[x,y,%]
        [0, 0, 1], [1, 0, 10], [2, 0, 20], [3, 0, 25], [4, 0, 30],
        //女[x,y,%]
        [0, 1, 2], [1, 1, 15], [2, 1, 25], [3, 1, 25], [4, 1, 30]
    ];

    //对异常统计图表配置项进行设置
    let exceptionOption = {
        //标题配置
        title: {
            text: '异常人数占比(%)',
            x: '10',
            y: '10',
            textStyle: {
                color: '#fff',
                fontSize: 15,
                fontFamily: '微软雅黑',
                fontWeight: 'bold'
            }
        },
        //提示框配置
        tooltip: {
            show: false
        },
        //x轴配置
        xAxis3D: {
            type: 'category',
            data: ['0-19岁', '20-29岁', '30-39岁', '40-49岁', '50岁以上'],
            nameGap: 30,
            axisLine: {
                lineStyle: {
                    color: '#fff',
                    width: 1,
                    type: 'solid'
                },
            },
            axisLabel: {
                interval: 0,
                rotate: 45,
                textStyle: {
                    color: '#fff',
                    fontSize: 14,
                    fontFamily: '微软雅黑',
                }
            },
        },
        //y轴配置
        yAxis3D: {
            type: 'category',
            data: ['男', '女'],
            nameGap: 20,
            axisLine: {
                lineStyle: {
                    color: '#fff',
                    width: 1,
                    type: 'solid'
                },
            },
        },
        //z轴配置
        zAxis3D: {
            type: 'value',
            nameGap: 30,
            axisLine: {
                lineStyle: {
                    color: '#fff',
                    width: 1,
                    type: 'solid'
                }
            },
            axisLabel: {
                formatter: '{value}%',
                textStyle: {
                    color: '#fff',
                    fontSize: 14,
                    fontFamily: '微软雅黑',
                }
            }
        },
        //图例配置
        grid3D: {
            boxWidth: 180,
            boxDepth: 40,
            boxHeight: 90,
            axisPointer: {
                show: false
            },
            light: {
                main: {
                    intensity: 1.2
                },
                ambient: {
                    intensity: 0.3
                }
            },
            viewControl: {
                alpha: 20,
                beta: 0,
                autoRotate: true,
                zoomSensitivity: 0,
                autoRotateAfterStill: 10,
                distance: 200
            }
        },
        //图表系列数据配置
        series: [
            {
                type: 'bar3D',
                name: '',
                barSize: 15,
                itemStyle: {
                    normal: {
                        color: function (params) {
                            var colorList = ['#1fa8c0f0', '#1fa8c0f0', '#1fa8c0f0', '#1fa8c0f0', '#1fa8c0f0',
                                '#fc8d8d', '#fc8d8d', '#fc8d8d', '#fc8d8d', '#fc8d8d'];

                            return colorList[params.dataIndex];
                        }

                    }
                },
                data: exceptionData,
                stack: 'stack',
                shading: 'lambert',
                label: {
                    show: true,
                    position: 'top',
                    formatter: function (params) {
                        return String(params.data[2]) + '%';
                    },
                    color: '#fff',
                    fontSize: 15
                },
                emphasis: {
                    show: false
                }
            }
        ]
    }

    //定义异常统计图表数据获取定时器
    let exceptionTimer = null;

    //定义一个方法更新异常统计图表配置数据
    function updateExceptionData(data) {
        //更新异常统计图表配置数据
        exceptionOption.series[0].data = data;
    }

    //定义一个方法渲染异常统计图表
    function renderChart() {
        //异常统计图表
        if (exceptionOption && typeof exceptionOption === 'object') {
            exceptionChart.setOption(exceptionOption, true);
        }
    }

    //定义一个方法请求后端数据并重新渲染异常统计图表
    function exception() {
        $.ajax({
            url: 'http://127.0.0.1:8000/exception?timestamp=' + new Date().getTime(),
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

                //更新异常统计图表配置数据
                updateExceptionData(data);

                //重新渲染异常统计图表
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

    //渲染异常统计图表
    renderChart();

    //利用ajax方法请求后端数据并重新渲染异常统计图表
    exception();

    //关闭异常统计图表数据获取定时器
    clearInterval(exceptionTimer);

    //开启异常统计图表数据获取定时器,每60秒获取1次最新数据并重新渲染异常统计图表
    exceptionTimer = setInterval(exception, 60000);
})()
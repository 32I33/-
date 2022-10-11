(function () {
    //创建地理分布图表echarts实例
    let mapChart = echarts.init(document.getElementById('map'));

    //定义地理分布图表高亮切换计数器
    let mapIndex = -1;

    //定义网络连接判断标志
    let layerFlag = null;

    //定义包含所有市级地区及对应的用户数量的数据列表
    let citiesData = [
        { name: '广州市', value: 10 },
        { name: '烟台市', value: 50 },
        { name: '合肥市', value: 60 },
        { name: '杭州市', value: 80 },
        { name: '桂林市', value: 40 },
        { name: '衡水市', value: 60 },
        { name: '南京市', value: 90 },
        { name: '深圳市', value: 190 },
        { name: '拉萨市', value: 20 },
        { name: '乌鲁木齐市', value: 70 },
        { name: '西宁市', value: 80 },
        { name: '成都市', value: 180 },
        { name: '呼伦贝尔市', value: 30 }
    ];

    //定义包含所有省级地区及对应的用户数量的数据列表
    let proData = [
        { name: '广东', value: 10 },
        { name: '广西', value: 50 },
        { name: '河北', value: 60 },
        { name: '北京', value: 80 },
        { name: '河南', value: 40 },
        { name: '新疆', value: 60 },
        { name: '内蒙古', value: 90 },
        { name: '四川', value: 190 },
        { name: '台湾', value: 90 }
    ];

    //对地理分布图表配置项进行设置
    let mapOption = {
        //提示框配置
        tooltip: {
            show: true,
            position: ['340', '90'],
            trigger: 'item',
            formatter: function (params) {
                let showTip = '<ul class = "showTip" style="list-style: none">';

                showTip += '<li>地区：' + params.name + '</li>';

                if (params.value[2] == undefined) {
                    showTip += '<li>人数：' + params.value + '</li>';
                } else {
                    showTip += '<li>人数：' + params.value[2] + '</li>';
                }

                return showTip;
            }
        },
        //地理坐标系配置
        geo: {
            map: 'china',
            layoutCenter: ['50%', '50%'],
            layoutSize: '100%',
            zoom: 1.1,
            label: {
                formatter: function (params) {
                    return params.name;
                },
                fontSize: 20,
                position: 'left',
                show: true,
                color: '#fff',
                emphasis: {
                    show: false
                }
            },
            itemStyle: {
                areaColor: '#2bc4f350',
                borderColor: '#2bc4f3',
                borderWidth: 1,
                emphasis: {
                    show: false
                }
            }
        },
        //图表系列数据配置
        series: [
            {
                type: 'map',
                mapType: 'china',
                layoutCenter: ['50%', '50%'],
                layoutSize: '100%',
                zoom: 1.1,
                label: {
                    emphasis: {
                        show: true,
                        opacity: 1,
                        color: '#fff',
                        fontSize: 20,
                        formatter: function (params) {
                            return params.name;
                        }
                    }
                },
                itemStyle: {
                    opacity: 0,
                    emphasis: {
                        opacity: 1,
                        areaColor: '#24cbff',
                        shadowBlur: 20,
                        shadowColor: '#00050'
                    }
                },
                data: proData
            },
            {
                type: 'effectScatter',
                coordinateSystem: 'geo',
                data: convertData(citiesData, geoCoordMap),
                rippleEffect: {
                    brushType: 'stroke',
                    scale: 7.5,
                    period: 4
                },
                encode: {
                    value: 2
                },
                symbolSize: 10,
                label: {
                    show: false
                },
                itemStyle: {
                    normal: {
                        color: 'aqua',
                        shadowBlur: 10,
                        shadowColor: '#333'
                    }
                }
            }
        ]
    };

    //定义地理分布图表高亮切换定时器
    let switchTimer = null;

    //定义地理分布图表数据获取定时器
    let mapTimer = null;

    //定义一个方法更新地理分布图表配置数据
    function updateMapData(data) {
        //更新citiesData列表
        citiesData = JSON.parse(data[0]);
       
        //更新proData列表
        proData = JSON.parse(data[1]);

        //更新地理分布图表配置数据
        mapOption.series[0].data = proData;
        
        //convertData方法可以为citiesData列表中的省份添加对应的经纬度信息
        mapOption.series[1].data = convertData(citiesData, geoCoordMap);
    }

    //定义一个方法渲染地理分布图表
    function renderChart() {
        //渲染地理分布图表
        if (mapOption && typeof mapOption === 'object') {
            mapChart.setOption(mapOption, true);
        }
    }

    //定义一个方法使地理分布图表高亮切换
    function switchChart() {
        //取消当前项高亮
        mapChart.dispatchAction({
            type: 'downplay',
            seriesIndex: 0,
            dataIndex: mapIndex
        });

        //地理分布图表高亮切换计数器循环加1,最大为proData列表的长度,达到最大值重置为0
        mapIndex = (mapIndex + 1) % proData.length;

        //高亮下一项
        mapChart.dispatchAction({
            type: 'highlight',
            seriesIndex: 0,
            dataIndex: mapIndex
        });

        //提示框展示下一项数据
        mapChart.dispatchAction({
            type: 'showTip',
            seriesIndex: 0,
            dataIndex: mapIndex
        });

    };

    //定义一个方法请求后端数据并重新渲染地理分布图表
    function map() {
        $.ajax({
            url: 'http://127.0.0.1:8000/map?timestamp=' + new Date().getTime(),
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

                //更新地理分布图表配置数据
                updateMapData(data);

                //重新渲染地理分布图表
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

    //渲染地理分布图表
    renderChart();

    //地理分布图表高亮切换
    switchChart();

    //利用ajax方法请求后端数据并重新渲染地理分布图表
    map();

    //关闭地理分布图表高亮切换定时器
    clearInterval(switchTimer);

    //关闭地理分布图表数据获取定时器
    clearInterval(mapTimer);

    //开启地理分布图表高亮切换定时器，每2秒取消当前项高亮,高亮下一项，同时展示下一项的数据
    switchTimer = setInterval(switchChart, 2000);

    //开启地理分布图表数据获取定时器,每60秒获取1次最新数据并重新渲染地理分布图表
    mapTimer = setInterval(map, 60000);
})()

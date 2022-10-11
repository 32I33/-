(function () {
    //创建性别比例图表(男)echarts实例
    let manChart = echarts.init(document.getElementById('man'));

    //创建性别比例图表(女)echarts实例
    let femaleChart = echarts.init(document.getElementById('female'));

    //定义网络连接判断标志
    let layerFlag = null;

    //定义包含男女水状图的波浪分层配置数据的数据列表
    let sexData = [[0.6, 0.5, 0.4, 0.3], [0.4, 0.3, 0.2, 0.1]];

    //对性别比例图表(男)配置项进行设置
    let manOption = {
        //图表系列数据配置
        series: [{
            type: 'liquidFill',
            radius: '85%',
            center: ['50%', '60%'],
            data: sexData[0],
            color: ['#1fa8c0f0'],
            amplitude: '8%',
            waveLength: '80%',
            phase: 'auto',
            period: 'auto',
            direction: 'right',
            shape: 'circle',
            waveAnimation: true,
            animationEasing: 'linear',
            animationEasingUpdate: 'linear',
            animationDuration: 2000,
            animationDurationUpdate: 1000,
            outline: {
                show: true,
                borderDistance: 8,
                itemStyle: {
                    borderColor: '#1fa8c0f0',
                    borderWidth: 8,
                    shadowBlur: 20,
                    shadowColor: '#00000040'
                }
            },
            backgroundStyle: {
                color: '#fff'
            },
            label: {
                show: true,
                color: '#000',
                insideColor: '#000',
                fontSize: 40,
                fontWeight: 'bold',
                align: 'center',
                baseline: 'middle',
                position: 'inside'
            },
            emphasis: {
                show: false
            }
        }]
    };

    //对性别比例图表(女)配置项进行设置
    let femaleOption = {
        //图表系列数据配置
        series: [{
            type: 'liquidFill',
            radius: '85%',
            center: ['50%', '60%'],
            data: sexData[1],
            color: ['#fc8d8d'],
            amplitude: '8%',
            waveLength: '80%',
            phase: 'auto',
            period: 'auto',
            direction: 'right',
            shape: 'circle',
            waveAnimation: true,
            animationEasing: 'linear',
            animationEasingUpdate: 'linear',
            animationDuration: 2000,
            animationDurationUpdate: 1000,
            outline: {
                show: true,
                borderDistance: 8,
                itemStyle: {
                    borderColor: '#fc8d8d',
                    borderWidth: 8,
                    shadowBlur: 20,
                    shadowColor: '#00000040'
                }
            },
            backgroundStyle: {
                color: '#fff'
            },
            label: {
                show: true,
                color: '#000',
                insideColor: '#fff',
                fontSize: 40,
                fontWeight: 'bold',
                align: 'center',
                baseline: 'middle',
                position: 'inside'
            },
            emphasis: {
                show: false
            }
        }]
    };

    //定义性别比例图表数据获取定时器
    let sexTimer = null;

    //定义一个方法更新性别比例图表配置数据
    function updateSexData(data) {
        //定义变量存储获取到男性比例
        let scaleMale;

        //定义变量存储获取到女性比例
        let scaleFemale;

        //定义变量存储男性水状图波浪层间的递减量
        let scaleMaleDecrease;

        //定义变量存储女性水状图波浪层间的递减量
        let scaleFemaleDecrease

        //更新scaleMale
        scaleMale = data[0];

        //更新scaleFemale
        scaleFemale = data[1];

        //更新scaleMaleDecrease
        scaleMaleDecrease = (scaleMale / 5).toFixed(2);

        //更新scaleFemaleDecrease
        scaleFemaleDecrease = (scaleFemale / 5).toFixed(2);

        //更新性别比例图表配置数据,使男性水状图波浪重新分层
        manOption.series[0].data = [
            scaleMale,
            scaleMale - scaleMaleDecrease,
            scaleMale - 2 * scaleMaleDecrease,
            scaleMale - 3 * scaleMaleDecrease
        ];

        //更新性别比例图表配置数据,使女性水状图波浪重新分层
        femaleOption.series[0].data = [
            scaleFemale,
            scaleFemale - scaleFemaleDecrease,
            scaleFemale - 2 * scaleFemaleDecrease,
            scaleFemale - 3 * scaleFemaleDecrease
        ];
    }

    //定义一个方法渲染性别比例图表
    function renderCharts() {
        //渲染性别比例图表(男)
        if (manOption && typeof manOption === 'object') {
            manChart.setOption(manOption, true);
        }

        //渲染性别比例图表(女)
        if (femaleOption && typeof femaleOption === 'object') {
            femaleChart.setOption(femaleOption, true);
        }
    }

    //定义一个方法请求后端数据并重新渲染性别比例图表
    function sex() {
        $.ajax({
            url: 'http://127.0.0.1:8000/sex?timestamp=' + new Date().getTime(),
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

                //更新性别比例图表配置数据
                updateSexData(data);

                //重新渲染性别比例图表
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

    //渲染性别比例图表
    renderCharts();

    //利用ajax方法请求后端数据并重新渲染性别比例图表
    sex();

    //关闭性别比例图表数据获取定时器
    clearInterval(sexTimer);

    //开启性别比例图表数据获取定时器,每60秒获取1次最新数据并重新渲染性别比例图表
    sexTimer = setInterval(sex, 60000);
})()
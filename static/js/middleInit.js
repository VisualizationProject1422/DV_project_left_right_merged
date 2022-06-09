var centerMap = document.getElementById('centerMap');
var chart_map = echarts.init(centerMap, null, {
    renderer: 'canvas',
    useDirtyRect: false
});

var timeLine = document.getElementById('timeLine');
var chart_timeline = echarts.init(timeLine, null, {
    renderer: 'svg',
    useDirtyRect: false
});

var themeRiver = document.getElementById('themeRiver');
var chart_river = echarts.init(themeRiver, null, {
    renderer: 'svg',
    useDirtyRect: false
});

option_timeline = {
    universalTransition: true,
    tooltip: {},
    visualMap: {
        pieces: [
            { min: 300, color: "#d73027" },
            { min: 200, max: 300, color: "#fc8d59" },
            { min: 150, max: 200, color: "#fee08b" },
            { min: 100, max: 150, color: "#d9ef8b" },
            { min: 50, max: 100, color: "#91cf60" },
            { max: 50, color: "#1a9850" }
        ],
        type: 'piecewise',
        selectmode: false,
        show: false,
        symbolSize: [0, 15],
    },
    singleAxis: {
        type: 'time',
        left: 5,
        right: 5,
        top: 72,
        height: 0,
        boundaryGap: ['8%', '8%'],
        axisLine: {
            symbol: ['none', 'arrow'],
            symbolSize: [5, 5],
        },
        axisTick: {
            show: false,
        }
    },
    calendar: {
        top: 15,
        left: 15,
        right: 5,
        range: '2013',
        cellSize: 6,
        itemStyle: {
            borderWidth: 0.7
        },
        dayLabel: {
            show: true,
            fontSize: 6
        },
        monthLabel: {
            show: true,
            fontSize: 8
        },
        yearLabel: { show: true },
    },
    series: [
        {
            type: 'heatmap',
            coordinateSystem: 'calendar',
            highLight: {
                itemStyle: {
                    color: 'red'
                }
            }
        },
        {
            name: 'timeHeatMap',
            type: 'heatmap',
            coordinateSystem: 'singleAxis',
        },
        {
            name: 'timeScatter',
            type: 'scatter',
            coordinateSystem: 'singleAxis',
            tooltip: {
                show: false,
            }
        }],

};

option_themeriver = {

    title: {
        text: '城市污染等级比例统计图',
        right: 10
    },
    color: ["#1a9850", "#91cf60", "#d9ef8b", "#fee08b", "#fc8d59", "#d73027"],
    dataZoom: {
        id: 'dataZoomX',
        type: 'slider',
        top: 195,
        bottom: 10
    },
    tooltip: {
        trigger: 'axis',
        axisPointer: {
            type: 'line',
            lineStyle: {
                color: 'rgba(0,0,0,0.2)',
                width: 1,
                type: 'solid'
            }
        }
    },
    // legend: {
    //     top: 'bottom',
    //     data: ['优', '良', '轻度污染', '中度污染', '重度污染', '严重污染']
    // },
    singleAxis: {
        bottom: 50,
        top: 0,
        left: 5,
        right: 5,
        axisTick: {},
        axisLabel: {},
        type: 'time',
        axisPointer: {
            animation: true,
            label: {
                show: true
            }
        },
        splitLine: {
            show: true,
            lineStyle: {
                type: 'dashed',
                opacity: 0.2
            }
        }
    },
    series: [
        {
            type: 'themeRiver',
            top: 0,
            bottom: -10,
            left: 5,
            right: 5,
            boundaryGap: [0, 0],
            label: {
                show: false
            },
            emphasis: {
                itemStyle: {
                    shadowBlur: 20,
                    shadowColor: 'rgba(0, 0, 0, 0.8)'
                }
            },

        }
    ]
}

chart_timeline.setOption(option_timeline);
chart_river.setOption(option_themeriver);
ThemeRiverSetUp();
TimelineSetUp();
mapInit();



chart_map.on('click', function (param) {
    
    choose_list[0] = param.name;
    if (layer_geo == 'province') {
        TimelineSetUp();
    }
    else{
        CalenderSetUp('2013');
    }
    if (choose_geo.indexOf(param.name) == -1) {
        choose_geo.push(param.name);
        pushtext1(choose_geo);
    }
    else {
        choose_geo.pop(param.name);
        pushtext1(choose_geo);
    }
});
chart_map.on('dblclick', function (param) {
    temp_adcode = getAdcode(param.name);
    layer_geo = 'city';
    $.get('https://geo.datav.aliyun.com/areas_v3/bound/' + temp_adcode + '_full.json').done(function (map) {  //读取json文件
        // console.log(map);
        data_map = map;
        echarts.registerMap(param.name, map);
        chart_map.setOption({
            title: {
                text: param.name + '污染分布情况'
            },
            series: {
                map: param.name,
                top: 40,
                zoom: 1,
            },
        });
        MapSetUp(map, '2013');
        layer_geo = 'city';
    });

});

chart_timeline.on('click', 'series', function (param) {
    // console.log(param);
    if (param.seriesIndex == 2) {
        CalenderSetUp(param.data[0].toString());
        MapSetUp(data_map, param.data[0].toString());

    };
    if (param.seriesIndex == 0) {
        // console.log(param.data[0])
        var time = +echarts.number.parseDate(param.data[0]);
        date_2 = echarts.format.formatTime('yyyyMMdd00', time)
        if (choose_time.indexOf(date_2) == -1) {
            choose_time.push(date_2);
            pushtext2(choose_time);
        }
        else {
            choose_time.pop(date_2);
            pushtext2(choose_time);
        }
        if (mapIndex == 2) {
            WindSetUp(date_2);
        }
    }
});
chart_timeline.getZr().on('click', function (param) {
    // console.log(param);
    if (param.target.style.text) {
        if (param.target.style.text.length == 4) {
            if (choose_time.indexOf(param.target.style.text) == -1) {
                choose_time.push(param.target.style.text);
                pushtext2(choose_time);
            }
            else {
                choose_time.pop(param.target.style.text);
                pushtext2(choose_time);
            }
        }
    }
})

chart_map.getZr().on('click', function (event) {
    // 没有 target 意味着鼠标/指针不在任何一个图形元素上，它是从“空白处”触发的。
    if (event.target == undefined && layer_geo == 'city') {
        layer_geo = 'province';
        mapInit();
    }
});

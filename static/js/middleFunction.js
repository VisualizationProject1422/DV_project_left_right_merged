var option_timeline;
var option_map;
var data_map;
var app = {};

var choose_list = ['江西省'];
var choose_geo = [];
var choose_time = [];
var layer_geo = 'province';
var layer_time = 'day';
var mapIndex = 1;

function middleRank(value) {
    if (value > 300) {
        r = '严重污染'
    }
    else if (value > 200) {
        r = '重度污染'
    }
    else if (value > 150) {
        r = '中度污染'
    }
    else if (value > 100) {
        r = '轻度污染'
    }
    else if (value > 50) {
        r = '良'
    }
    else {
        r = '优'
    }
    return r;
}
// function draw(cite,aqi){
//     var bmap = chart_map.getModel().getComponent('bmap').getBMap();
//     var bdary = new BMap.Boundary();
//     bdary.get(cite, function (rs) {       //获取行政区域     //清除地图覆盖物       
//         var count = rs.boundaries.length; //行政区域的点有多少个
//         if (count === 0) {
//             console.log(cite);
//             return;
//         }
//         for (var i = 0; i < count; i++) {
//             var ply = new BMap.Polygon(rs.boundaries[i], { strokeWeight: 2, strokeColor: '#F6EFA6' }); //建立多边形覆
//             bmap.addOverlay(ply);  //添加覆盖物
//             ply['name'] = cite
//             ply.addEventListener('click',function(param){
//                 console.log(ply.name);
//             })
//         }
//     });
// }
// function getCoord() {
//     var bmap = chart_map.getModel().getComponent('bmap').getBMap();
//     var sw = bmap.getBounds().getSouthWest();
//     var ne = bmap.getBounds().getNorthEast();
//     return [[sw.lng, ne.lat], [ne.lng, sw.lat]];
// }

function MapSetUp(map, year) {
    var data = { 'layer_geo': layer_geo, 'year': year, 'children': [] };
    for (i in map.features) {
        var name = map.features[i].properties.name;
        var topush = { 'name': name };
        data.children.push(topush);
    }
    $.ajax({
        url: "./MapSetUp",
        type: "POST",
        contentType: "application/json;charset=utf-8",
        data: JSON.stringify(data),
        beforeSend: function () {
            console.log(data);
        },
        success: function (back) {
            chart_map.setOption({
                series: {
                    data: back.children,
                },

            });
        }
    });
    //         break;

    //     default:
    //         break;
    // }
}

function CalenderSetUp(year) {
    var date = +echarts.number.parseDate(year + '-01-01');
    var end = +echarts.number.parseDate(+year + 1 + '-01-01');
    var dayTime = 3600 * 24 * 1000;
    var data_calendar = [];
    switch (layer_geo) {
        case 'province':
            var data = { 'layer_geo': layer_geo, 'prov': choose_list[0], 'year': year };
            break;
        case 'city':
            var data = { 'layer_geo': layer_geo, 'city': choose_list[0], 'year': year };
            break;
        default:
            break;
    }
    $.ajax({
        url: "./CalenderSetUp",
        type: "POST",
        contentType: "application/json;charset=utf-8",
        data: JSON.stringify(data),
        beforeSend: function () {
            data_calendar = [];
        },
        success: function (back) {
            for (var time = date; time < end; time += dayTime) {
                date_1 = echarts.format.formatTime('yyyy-MM-dd', time);
                date_2 = echarts.format.formatTime('yyyyMMdd', time)
                data_calendar.push([
                    date_1,
                    back[date_2]
                ]);
            };
            chart_timeline.setOption({
                calendar: {
                    range: year,
                },
                series: {
                    data: data_calendar
                }

            });
        }
    });
}

function TimelineSetUp() {
    var data_timeline = [];
    switch (layer_geo) {
        case 'province':
            var data = { 'layer_geo': layer_geo, 'prov': choose_list[0] };
            console.log(data);
            $.ajax({
                url: "./TimelineSetUp",
                type: "POST",
                contentType: "application/json;charset=utf-8",
                data: JSON.stringify(data),
                beforeSend: function () {
                    data_timeline = [];
                },
                success: function (back) {
                    console.log(back.aqi);
                    for (var i = 0; i < 6; i += 1) {
                        data_timeline.push([
                            (2013 + i).toString(),
                            back.aqi[0][i]
                        ]);
                    };
                    chart_timeline.setOption({
                        series: [{
                            name: 'timeScatter',
                            data: data_timeline,
                        }, {
                            name: 'timeHeatMap',
                            data: data_timeline,
                        }]
                    });

                }
            });
            CalenderSetUp('2013');
            break;
        case 'city':
            var data = { 'layer_geo': layer_geo, 'city': choose_list[0] };
            $.ajax({
                url: "./TimelineSetUp",
                type: "POST",
                contentType: "application/json;charset=utf-8",
                data: JSON.stringify(data),
                beforeSend: function () {
                    data_timeline = [];
                },
                success: function (back) {
                    console.log(back.aqi);
                    for (var i = 0; i < 6; i += 1) {
                        data_timeline.push([
                            (2013 + i).toString(),
                            back.aqi[i]
                        ]);
                    };
                    chart_timeline.setOption({
                        series: [{
                            name: 'timeScatter',
                            data: data_timeline,
                        }, {
                            name: 'timeHeatMap',
                            data: data_timeline,
                        }]
                    });

                }
            });
            CalenderSetUp('2013');
            break;
        default:
            break;
    }
}

function ThemeRiverSetUp() {
    $.get('./static/innerData/themedata.json').done(function (data) {
        list = []
        for (i in data) {
            list.push([data[i].date, data[i].value, data[i].type])
        }
        chart_river.setOption({
            series: {
                data: list
            }

        })
    })
}//读取json文件
// $.ajax({
//     url: "./ThemeRiverSetUp",
//     type: "POST",
//     contentType: "application/json;charset=utf-8",
//     data: '',
//     success: function (back) {
//         i = 0;
//         data_river = []
//         while(i<6*365*6+6){
//             temp = back['ID' + i];
//             data = temp.date;
//             value = temp.value;
//             type = temp.type;
//             data_river.push([data,value,type])
//         }
//         chart_river.setOption({
//             series: {
//                 data: data_river
//             }

//         });
//     }
// });
// }

function mapInit() {
    layer_geo = 'province';
    $.get('https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json').done(function (map) {  //读取json文件
        echarts.registerMap("china", map);
        data_map = map;
        option_map = {
            title: {
                text: '中国污染分布情况',
            },
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
                // show: false,
            },
            bmap: {
                center: [104.114129, 37.550339],
                zoom: 1.6,
                mapStyle: {
                    styleJson: [
                        {
                            featureType: 'water',
                            elementType: 'all',
                            stylers: {
                                visibility: 'off',
                                color: '#044161'
                            }
                        },
                        {
                            featureType: 'land',
                            elementType: 'all',
                            stylers: {
                                visibility: 'off',
                                color: '#004981'
                            }
                        },
                        {
                            featureType: 'boundary',
                            elementType: 'geometry',
                            stylers: {
                                visibility: 'off',
                                color: '#064f85'
                            }
                        },
                        {
                            featureType: 'railway',
                            elementType: 'all',
                            stylers: {
                                visibility: 'off'
                            }
                        },
                        {
                            featureType: 'highway',
                            elementType: 'geometry',
                            stylers: {
                                color: '#004981',
                                visibility: 'off'
                            }
                        },
                        {
                            featureType: 'highway',
                            elementType: 'geometry.fill',
                            stylers: {
                                visibility: 'off',
                                color: '#005b96',
                                lightness: 1
                            }
                        },
                        {
                            featureType: 'highway',
                            elementType: 'labels',
                            stylers: {
                                visibility: 'off'
                            }
                        },
                        {
                            featureType: 'arterial',
                            elementType: 'geometry',
                            stylers: {
                                visibility: 'off',
                                color: '#004981'
                            }
                        },
                        {
                            featureType: 'arterial',
                            elementType: 'geometry.fill',
                            stylers: {
                                visibility: 'off',
                                color: '#00508b'
                            }
                        },
                        {
                            featureType: 'poi',
                            elementType: 'all',
                            stylers: {
                                visibility: 'off'
                            }
                        },
                        {
                            featureType: 'green',
                            elementType: 'all',
                            stylers: {
                                color: '#056197',
                                visibility: 'off'
                            }
                        },
                        {
                            featureType: 'subway',
                            elementType: 'all',
                            stylers: {
                                visibility: 'off'
                            }
                        },
                        {
                            featureType: 'manmade',
                            elementType: 'all',
                            stylers: {
                                visibility: 'off'
                            }
                        },
                        {
                            featureType: 'local',
                            elementType: 'all',
                            stylers: {
                                visibility: 'off'
                            }
                        },
                        {
                            featureType: 'arterial',
                            elementType: 'labels',
                            stylers: {
                                visibility: 'off'
                            }
                        },
                        {
                            featureType: 'boundary',
                            elementType: 'geometry.fill',
                            stylers: {
                                visibility: 'off',
                                color: '#029fd4'
                            }
                        },
                        {
                            featureType: 'building',
                            elementType: 'all',
                            stylers: {
                                color: '#1a5787',
                                visibility: 'off',
                            }
                        },
                        {
                            featureType: 'label',
                            elementType: 'all',
                            stylers: {
                                visibility: 'off'
                            }
                        }
                    ]
                }
            },
            series: {
                type: 'map',
                map: 'china',
                top: 90,
                zoom: 1.6,
                tooltip: {
                    position: 'top',
                    formatter: function (params) {
                        var aqi = Math.round(params.data.value);
                        var pm2_5 = Math.round(params.data.PM2_5);
                        var pm10 = Math.round(params.data.PM10);
                        var so2 = Math.round(params.data.SO2);
                        var no2 = Math.round(params.data.NO2);
                        var co = Math.round(params.data.CO);
                        var o3 = Math.round(params.data.O3);
                        var res = params.data.name
                            + ' : ' + middleRank(aqi)
                            + '<br/>AQI指数 : ' + aqi
                            + '<br/>PM2.5 : ' + pm2_5
                            + '<br/>PM10 : ' + pm10
                            + '<br/>二氧化硫（SO2） : ' + so2
                            + '<br/>二氧化氮（NO2） : ' + no2
                            + '<br/>一氧化碳（CO） : ' + co
                            + '<br/>臭氧（O3） : ' + o3;
                        return res;
                    }
                }
            }

        }
        if (option_map && typeof option_map === 'object') {
            chart_map.setOption(option_map);
        }
        MapSetUp(map, '2013');
        layer_geo = 'province';
    });
}

function WindSetUp(date) {
    $.get('./static/innerData/wind/' + date.slice(0,8) + '.json').done(function (data) {
        var wind_data = []
        var maxMag = 0
        var minMag = Infinity
        for (i in data) {
            var row = data[i];
            var u = row.u;
            var v = row.v;
            var lat = row.lat;
            var lon = row.lon;
            var mag = Math.sqrt(u * u + v * v);
            wind_data.push([lon, lat, u, v, mag])
            maxMag = Math.max(mag, maxMag);
            minMag = Math.min(mag, minMag);
        }
        chart_map.setOption({
            title: {
                text: '中国风向图',
                textStyle: {
                    color: 'white',
                }
            },
            backgroundColor: '#001122',
            visualMap: {
                left: 'left',
                min: minMag,
                max: maxMag,
                dimension: 4,
                inRange: {
                    // color: ['green', 'yellow', 'red']
                    color: [
                        '#313695',
                        '#4575b4',
                        '#74add1',
                        '#abd9e9',
                        '#e0f3f8',
                        '#ffffbf',
                        '#fee090',
                        '#fdae61',
                        '#f46d43',
                        '#d73027',
                        '#a50026'
                    ]
                },
                realtime: false,
                calculable: true,
                textStyle: {
                    color: '#fff'
                }
            },
            bmap: {
                center: [104.114129, 37.550339],
                zoom: 1.6,
                roam: true,
                mapStyle: {
                    styleJson: [
                        {
                            featureType: 'water',
                            elementType: 'all',
                            stylers: {
                                color: '#031628'
                            }
                        },
                        {
                            featureType: 'land',
                            elementType: 'geometry',
                            stylers: {
                                color: '#000102'
                            }
                        },
                        {
                            featureType: 'highway',
                            elementType: 'all',
                            stylers: {
                                visibility: 'off'
                            }
                        },
                        {
                            featureType: 'arterial',
                            elementType: 'geometry.fill',
                            stylers: {
                                color: '#000000'
                            }
                        },
                        {
                            featureType: 'arterial',
                            elementType: 'geometry.stroke',
                            stylers: {
                                color: '#0b3d51'
                            }
                        },
                        {
                            featureType: 'local',
                            elementType: 'geometry',
                            stylers: {
                                color: '#000000'
                            }
                        },
                        {
                            featureType: 'railway',
                            elementType: 'geometry.fill',
                            stylers: {
                                color: '#000000'
                            }
                        },
                        {
                            featureType: 'railway',
                            elementType: 'geometry.stroke',
                            stylers: {
                                color: '#08304b'
                            }
                        },
                        {
                            featureType: 'subway',
                            elementType: 'geometry',
                            stylers: {
                                lightness: -70
                            }
                        },
                        {
                            featureType: 'building',
                            elementType: 'geometry.fill',
                            stylers: {
                                color: '#000000'
                            }
                        },
                        {
                            featureType: 'all',
                            elementType: 'labels.text.fill',
                            stylers: {
                                color: '#857f7f'
                            }
                        },
                        {
                            featureType: 'all',
                            elementType: 'labels.text.stroke',
                            stylers: {
                                color: '#000000'
                            }
                        },
                        {
                            featureType: 'building',
                            elementType: 'geometry',
                            stylers: {
                                color: '#022338'
                            }
                        },
                        {
                            featureType: 'green',
                            elementType: 'geometry',
                            stylers: {
                                color: '#062032'
                            }
                        },
                        {
                            featureType: 'boundary',
                            elementType: 'all',
                            stylers: {
                                color: '#465b6c'
                            }
                        },
                        {
                            featureType: 'manmade',
                            elementType: 'all',
                            stylers: {
                                color: '#022338'
                            }
                        },
                        {
                            featureType: 'label',
                            elementType: 'all',
                            stylers: {
                                visibility: 'off'
                            }
                        }
                    ]
                }
            },
            series: [
                {
                    type: 'flowGL',
                    coordinateSystem: 'bmap',
                    data: wind_data,
                    supersampling: 4,
                    particleType: 'line',
                    particleDensity: 128,
                    particleSpeed: 1,
                    // gridWidth: windData.nx,
                    // gridHeight: windData.ny,
                    itemStyle: {
                        opacity: 0.7
                    }
                }
            ]
        });



    })
}

function pushtext2(list) {
    i = 0
    p = '选择时间 ：'
    while (i < list.length) {
        t = list[i];
        p += t.slice(0,4) + '-' + t.slice(4,6) + '-' + t.slice(6,8) + ' ';
        i++;
    }
    document.getElementById('p_time').innerHTML = p;
    return 1;
}

function pushtext1(list) {
    i = 0
    p = '选择地区 ：'
    while (i < list.length) {
        p += list[i] + ' ';
        i++;
    }
    document.getElementById('p_area').innerHTML = p;
    return 1;
}

function bt1() {
    switch (mapIndex) {
        case 1:
            chart_map.clear();
            WindSetUp('2013010100');
            mapIndex = 2;
            break;
        case 2:
            chart_map.clear();
            mapInit();
            mapIndex = 1;
        default:
            break;
    }
}

$("#clear").click(function () {
    choose_geo = [];
    choose_time = [];
    pushtext1(choose_geo);
    pushtext2(choose_geo);
})
var option_timeline;
var option_map;
var data_map;
var app = {};

var choose_list = ['江西省'];
var choose_geo = [];
var choose_time = [];
var layer_geo = 'province';
var layer_time = 0;
var mapIndex = 1;
var year_current = '2013';

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
            CalenderSetUp(year_current);
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
            CalenderSetUp(year_current);
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
        year_current = '2013';
        layer_geo = 'province';
    });
}

function WindSetUp(date) {
    $.get('./static/innerData/wind/' + date.slice(0, 8) + '.json').done(function (data) {
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
                    styleJson: [{
                        "featureType": "land",
                        "elementType": "geometry",
                        "stylers": {
                            "color": "#242f3eff"
                        }
                    }, {
                        "featureType": "manmade",
                        "elementType": "geometry",
                        "stylers": {
                            "color": "#242f3eff"
                        }
                    }, {
                        "featureType": "water",
                        "elementType": "geometry",
                        "stylers": {
                            "color": "#17263cff"
                        }
                    }, {
                        "featureType": "road",
                        "elementType": "geometry.fill",
                        "stylers": {
                            "color": "#9e7d60ff"
                        }
                    }, {
                        "featureType": "road",
                        "elementType": "geometry.stroke",
                        "stylers": {
                            "color": "#554631ff"
                        }
                    }, {
                        "featureType": "districtlabel",
                        "elementType": "labels.text.fill",
                        "stylers": {
                            "color": "#d69563ff"
                        }
                    }, {
                        "featureType": "districtlabel",
                        "elementType": "labels.text.stroke",
                        "stylers": {
                            "color": "#17263cff",
                            "weight": 3
                        }
                    }, {
                        "featureType": "poilabel",
                        "elementType": "labels.text.fill",
                        "stylers": {
                            "color": "#d69563ff"
                        }
                    }, {
                        "featureType": "poilabel",
                        "elementType": "labels.text.stroke",
                        "stylers": {
                            "color": "#17263cff",
                            "weight": 3
                        }
                    }, {
                        "featureType": "subway",
                        "elementType": "geometry",
                        "stylers": {
                            "visibility": "off"
                        }
                    }, {
                        "featureType": "railway",
                        "elementType": "geometry",
                        "stylers": {
                            "visibility": "off"
                        }
                    }, {
                        "featureType": "poilabel",
                        "elementType": "labels.icon",
                        "stylers": {
                            "visibility": "off"
                        }
                    }, {
                        "featureType": "subwaylabel",
                        "elementType": "labels",
                        "stylers": {
                            "visibility": "off"
                        }
                    }, {
                        "featureType": "subwaylabel",
                        "elementType": "labels.icon",
                        "stylers": {
                            "visibility": "off"
                        }
                    }, {
                        "featureType": "tertiarywaysign",
                        "elementType": "labels",
                        "stylers": {
                            "visibility": "off"
                        }
                    }, {
                        "featureType": "tertiarywaysign",
                        "elementType": "labels.icon",
                        "stylers": {
                            "visibility": "off"
                        }
                    }, {
                        "featureType": "provincialwaysign",
                        "elementType": "labels.icon",
                        "stylers": {
                            "visibility": "off"
                        }
                    }, {
                        "featureType": "provincialwaysign",
                        "elementType": "labels",
                        "stylers": {
                            "visibility": "off"
                        }
                    }, {
                        "featureType": "nationalwaysign",
                        "elementType": "labels.icon",
                        "stylers": {
                            "visibility": "off"
                        }
                    }, {
                        "featureType": "nationalwaysign",
                        "elementType": "labels",
                        "stylers": {
                            "visibility": "off"
                        }
                    }, {
                        "featureType": "highwaysign",
                        "elementType": "labels.icon",
                        "stylers": {
                            "visibility": "off"
                        }
                    }, {
                        "featureType": "highwaysign",
                        "elementType": "labels",
                        "stylers": {
                            "visibility": "off"
                        }
                    }, {
                        "featureType": "green",
                        "elementType": "geometry",
                        "stylers": {
                            "color": "#263b3eff"
                        }
                    }, {
                        "featureType": "nationalwaysign",
                        "elementType": "labels.text.fill",
                        "stylers": {
                            "color": "#d0021bff"
                        }
                    }, {
                        "featureType": "nationalwaysign",
                        "elementType": "labels.text.stroke",
                        "stylers": {
                            "color": "#ffffffff"
                        }
                    }, {
                        "featureType": "city",
                        "elementType": "labels",
                        "stylers": {
                            "visibility": "on"
                        }
                    }, {
                        "featureType": "city",
                        "elementType": "labels.icon",
                        "stylers": {
                            "visibility": "off"
                        }
                    }, {
                        "featureType": "city",
                        "elementType": "labels.text.fill",
                        "stylers": {
                            "color": "#d69563ff"
                        }
                    }, {
                        "featureType": "city",
                        "elementType": "labels.text.stroke",
                        "stylers": {
                            "color": "#17263cff"
                        }
                    }, {
                        "featureType": "water",
                        "elementType": "labels.text.fill",
                        "stylers": {
                            "color": "#d69563ff"
                        }
                    }, {
                        "featureType": "water",
                        "elementType": "labels.text.stroke",
                        "stylers": {
                            "color": "#242f3eff"
                        }
                    }, {
                        "featureType": "local",
                        "elementType": "geometry.fill",
                        "stylers": {
                            "color": "#38414eff"
                        }
                    }, {
                        "featureType": "local",
                        "elementType": "geometry.stroke",
                        "stylers": {
                            "color": "#ffffff00"
                        }
                    }, {
                        "featureType": "fourlevelway",
                        "elementType": "geometry.fill",
                        "stylers": {
                            "color": "#38414eff"
                        }
                    }, {
                        "featureType": "fourlevelway",
                        "elementType": "geometry.stroke",
                        "stylers": {
                            "color": "#ffffff00"
                        }
                    }, {
                        "featureType": "tertiaryway",
                        "elementType": "geometry.fill",
                        "stylers": {
                            "color": "#38414eff"
                        }
                    }, {
                        "featureType": "tertiaryway",
                        "elementType": "geometry.stroke",
                        "stylers": {
                            "color": "#ffffff00"
                        }
                    }, {
                        "featureType": "tertiaryway",
                        "elementType": "labels.text.fill",
                        "stylers": {
                            "color": "#759879ff"
                        }
                    }, {
                        "featureType": "fourlevelway",
                        "elementType": "labels.text.fill",
                        "stylers": {
                            "color": "#759879ff"
                        }
                    }, {
                        "featureType": "highway",
                        "elementType": "labels.text.fill",
                        "stylers": {
                            "color": "#759879ff"
                        }
                    }, {
                        "featureType": "highway",
                        "elementType": "geometry.fill",
                        "stylers": {
                            "color": "#9e7d60ff"
                        }
                    }, {
                        "featureType": "highway",
                        "elementType": "geometry.stroke",
                        "stylers": {
                            "color": "#554631ff"
                        }
                    }, {
                        "featureType": "provincialway",
                        "elementType": "geometry.fill",
                        "stylers": {
                            "color": "#9e7d60ff"
                        }
                    }, {
                        "featureType": "provincialway",
                        "elementType": "geometry.stroke",
                        "stylers": {
                            "color": "#554631ff"
                        }
                    }, {
                        "featureType": "tertiaryway",
                        "elementType": "labels.text.stroke",
                        "stylers": {
                            "color": "#1a2e1cff"
                        }
                    }, {
                        "featureType": "fourlevelway",
                        "elementType": "labels.text.stroke",
                        "stylers": {
                            "color": "#1a2e1cff"
                        }
                    }, {
                        "featureType": "highway",
                        "elementType": "labels.text.stroke",
                        "stylers": {
                            "color": "#1a2e1cff"
                        }
                    }, {
                        "featureType": "nationalway",
                        "elementType": "labels.text.stroke",
                        "stylers": {
                            "color": "#1a2e1cff"
                        }
                    }, {
                        "featureType": "nationalway",
                        "elementType": "labels.text.fill",
                        "stylers": {
                            "color": "#759879ff"
                        }
                    }, {
                        "featureType": "nationalway",
                        "elementType": "geometry.fill",
                        "stylers": {
                            "color": "#9e7d60ff"
                        }
                    }, {
                        "featureType": "nationalway",
                        "elementType": "geometry.stroke",
                        "stylers": {
                            "color": "#554631ff"
                        }
                    }, {
                        "featureType": "cityhighway",
                        "elementType": "geometry.fill",
                        "stylers": {
                            "color": "#9e7d60ff"
                        }
                    }, {
                        "featureType": "cityhighway",
                        "elementType": "geometry.stroke",
                        "stylers": {
                            "color": "#554631ff"
                        }
                    }, {
                        "featureType": "arterial",
                        "elementType": "geometry.fill",
                        "stylers": {
                            "color": "#9e7d60ff"
                        }
                    }, {
                        "featureType": "arterial",
                        "elementType": "geometry.stroke",
                        "stylers": {
                            "color": "#554631fa"
                        }
                    }, {
                        "featureType": "medicallabel",
                        "elementType": "labels",
                        "stylers": {
                            "visibility": "off"
                        }
                    }, {
                        "featureType": "medicallabel",
                        "elementType": "labels.icon",
                        "stylers": {
                            "visibility": "off"
                        }
                    }, {
                        "featureType": "entertainmentlabel",
                        "elementType": "labels",
                        "stylers": {
                            "visibility": "off"
                        }
                    }, {
                        "featureType": "entertainmentlabel",
                        "elementType": "labels.icon",
                        "stylers": {
                            "visibility": "off"
                        }
                    }, {
                        "featureType": "estatelabel",
                        "elementType": "labels",
                        "stylers": {
                            "visibility": "off"
                        }
                    }, {
                        "featureType": "estatelabel",
                        "elementType": "labels.icon",
                        "stylers": {
                            "visibility": "off"
                        }
                    }, {
                        "featureType": "businesstowerlabel",
                        "elementType": "labels",
                        "stylers": {
                            "visibility": "off"
                        }
                    }, {
                        "featureType": "businesstowerlabel",
                        "elementType": "labels.icon",
                        "stylers": {
                            "visibility": "off"
                        }
                    }, {
                        "featureType": "companylabel",
                        "elementType": "labels",
                        "stylers": {
                            "visibility": "off"
                        }
                    }, {
                        "featureType": "companylabel",
                        "elementType": "labels.icon",
                        "stylers": {
                            "visibility": "off"
                        }
                    }, {
                        "featureType": "governmentlabel",
                        "elementType": "labels",
                        "stylers": {
                            "visibility": "off"
                        }
                    }, {
                        "featureType": "governmentlabel",
                        "elementType": "labels.icon",
                        "stylers": {
                            "visibility": "off"
                        }
                    }, {
                        "featureType": "restaurantlabel",
                        "elementType": "labels",
                        "stylers": {
                            "visibility": "off"
                        }
                    }, {
                        "featureType": "restaurantlabel",
                        "elementType": "labels.icon",
                        "stylers": {
                            "visibility": "off"
                        }
                    }, {
                        "featureType": "hotellabel",
                        "elementType": "labels",
                        "stylers": {
                            "visibility": "off"
                        }
                    }, {
                        "featureType": "hotellabel",
                        "elementType": "labels.icon",
                        "stylers": {
                            "visibility": "off"
                        }
                    }, {
                        "featureType": "shoppinglabel",
                        "elementType": "labels",
                        "stylers": {
                            "visibility": "off"
                        }
                    }, {
                        "featureType": "shoppinglabel",
                        "elementType": "labels.icon",
                        "stylers": {
                            "visibility": "off"
                        }
                    }, {
                        "featureType": "lifeservicelabel",
                        "elementType": "labels",
                        "stylers": {
                            "visibility": "off"
                        }
                    }, {
                        "featureType": "lifeservicelabel",
                        "elementType": "labels.icon",
                        "stylers": {
                            "visibility": "off"
                        }
                    }, {
                        "featureType": "carservicelabel",
                        "elementType": "labels",
                        "stylers": {
                            "visibility": "off"
                        }
                    }, {
                        "featureType": "carservicelabel",
                        "elementType": "labels.icon",
                        "stylers": {
                            "visibility": "off"
                        }
                    }, {
                        "featureType": "financelabel",
                        "elementType": "labels",
                        "stylers": {
                            "visibility": "off"
                        }
                    }, {
                        "featureType": "financelabel",
                        "elementType": "labels.icon",
                        "stylers": {
                            "visibility": "off"
                        }
                    }, {
                        "featureType": "otherlabel",
                        "elementType": "labels",
                        "stylers": {
                            "visibility": "off"
                        }
                    }, {
                        "featureType": "otherlabel",
                        "elementType": "labels.icon",
                        "stylers": {
                            "visibility": "off"
                        }
                    }, {
                        "featureType": "airportlabel",
                        "elementType": "labels",
                        "stylers": {
                            "visibility": "on"
                        }
                    }, {
                        "featureType": "airportlabel",
                        "elementType": "labels.text.fill",
                        "stylers": {
                            "color": "#d69563ff"
                        }
                    }, {
                        "featureType": "airportlabel",
                        "elementType": "labels.text.stroke",
                        "stylers": {
                            "color": "#17263cff"
                        }
                    }, {
                        "featureType": "airportlabel",
                        "elementType": "labels.icon",
                        "stylers": {
                            "visibility": "off"
                        }
                    }, {
                        "featureType": "highway",
                        "stylers": {
                            "curZoomRegionId": "0",
                            "curZoomRegion": "6,10",
                            "level": "6"
                        }
                    }, {
                        "featureType": "highway",
                        "stylers": {
                            "curZoomRegionId": "0",
                            "curZoomRegion": "6,10",
                            "level": "7"
                        }
                    }, {
                        "featureType": "highway",
                        "stylers": {
                            "curZoomRegionId": "0",
                            "curZoomRegion": "6,10",
                            "level": "8"
                        }
                    }, {
                        "featureType": "highway",
                        "stylers": {
                            "curZoomRegionId": "0",
                            "curZoomRegion": "6,10",
                            "level": "9"
                        }
                    }, {
                        "featureType": "highway",
                        "stylers": {
                            "curZoomRegionId": "0",
                            "curZoomRegion": "6,10",
                            "level": "10"
                        }
                    }, {
                        "featureType": "highway",
                        "elementType": "geometry",
                        "stylers": {
                            "visibility": "off",
                            "curZoomRegionId": "0",
                            "curZoomRegion": "6,10",
                            "level": "6"
                        }
                    }, {
                        "featureType": "highway",
                        "elementType": "geometry",
                        "stylers": {
                            "visibility": "off",
                            "curZoomRegionId": "0",
                            "curZoomRegion": "6,10",
                            "level": "7"
                        }
                    }, {
                        "featureType": "highway",
                        "elementType": "geometry",
                        "stylers": {
                            "visibility": "off",
                            "curZoomRegionId": "0",
                            "curZoomRegion": "6,10",
                            "level": "8"
                        }
                    }, {
                        "featureType": "highway",
                        "elementType": "geometry",
                        "stylers": {
                            "visibility": "off",
                            "curZoomRegionId": "0",
                            "curZoomRegion": "6,10",
                            "level": "9"
                        }
                    }, {
                        "featureType": "highway",
                        "elementType": "geometry",
                        "stylers": {
                            "visibility": "off",
                            "curZoomRegionId": "0",
                            "curZoomRegion": "6,10",
                            "level": "10"
                        }
                    }, {
                        "featureType": "nationalway",
                        "stylers": {
                            "curZoomRegionId": "0",
                            "curZoomRegion": "6,10",
                            "level": "6"
                        }
                    }, {
                        "featureType": "nationalway",
                        "stylers": {
                            "curZoomRegionId": "0",
                            "curZoomRegion": "6,10",
                            "level": "7"
                        }
                    }, {
                        "featureType": "nationalway",
                        "stylers": {
                            "curZoomRegionId": "0",
                            "curZoomRegion": "6,10",
                            "level": "8"
                        }
                    }, {
                        "featureType": "nationalway",
                        "stylers": {
                            "curZoomRegionId": "0",
                            "curZoomRegion": "6,10",
                            "level": "9"
                        }
                    }, {
                        "featureType": "nationalway",
                        "stylers": {
                            "curZoomRegionId": "0",
                            "curZoomRegion": "6,10",
                            "level": "10"
                        }
                    }, {
                        "featureType": "nationalway",
                        "elementType": "geometry",
                        "stylers": {
                            "visibility": "off",
                            "curZoomRegionId": "0",
                            "curZoomRegion": "6,10",
                            "level": "6"
                        }
                    }, {
                        "featureType": "nationalway",
                        "elementType": "geometry",
                        "stylers": {
                            "visibility": "off",
                            "curZoomRegionId": "0",
                            "curZoomRegion": "6,10",
                            "level": "7"
                        }
                    }, {
                        "featureType": "nationalway",
                        "elementType": "geometry",
                        "stylers": {
                            "visibility": "off",
                            "curZoomRegionId": "0",
                            "curZoomRegion": "6,10",
                            "level": "8"
                        }
                    }, {
                        "featureType": "nationalway",
                        "elementType": "geometry",
                        "stylers": {
                            "visibility": "off",
                            "curZoomRegionId": "0",
                            "curZoomRegion": "6,10",
                            "level": "9"
                        }
                    }, {
                        "featureType": "nationalway",
                        "elementType": "geometry",
                        "stylers": {
                            "visibility": "off",
                            "curZoomRegionId": "0",
                            "curZoomRegion": "6,10",
                            "level": "10"
                        }
                    }, {
                        "featureType": "nationalway",
                        "elementType": "labels",
                        "stylers": {
                            "visibility": "off",
                            "curZoomRegionId": "0",
                            "curZoomRegion": "6,10",
                            "level": "6"
                        }
                    }, {
                        "featureType": "nationalway",
                        "elementType": "labels",
                        "stylers": {
                            "visibility": "off",
                            "curZoomRegionId": "0",
                            "curZoomRegion": "6,10",
                            "level": "7"
                        }
                    }, {
                        "featureType": "nationalway",
                        "elementType": "labels",
                        "stylers": {
                            "visibility": "off",
                            "curZoomRegionId": "0",
                            "curZoomRegion": "6,10",
                            "level": "8"
                        }
                    }, {
                        "featureType": "nationalway",
                        "elementType": "labels",
                        "stylers": {
                            "visibility": "off",
                            "curZoomRegionId": "0",
                            "curZoomRegion": "6,10",
                            "level": "9"
                        }
                    }, {
                        "featureType": "nationalway",
                        "elementType": "labels",
                        "stylers": {
                            "visibility": "off",
                            "curZoomRegionId": "0",
                            "curZoomRegion": "6,10",
                            "level": "10"
                        }
                    }, {
                        "featureType": "highway",
                        "elementType": "labels",
                        "stylers": {
                            "visibility": "off",
                            "curZoomRegionId": "0",
                            "curZoomRegion": "6,10",
                            "level": "6"
                        }
                    }, {
                        "featureType": "highway",
                        "elementType": "labels",
                        "stylers": {
                            "visibility": "off",
                            "curZoomRegionId": "0",
                            "curZoomRegion": "6,10",
                            "level": "7"
                        }
                    }, {
                        "featureType": "highway",
                        "elementType": "labels",
                        "stylers": {
                            "visibility": "off",
                            "curZoomRegionId": "0",
                            "curZoomRegion": "6,10",
                            "level": "8"
                        }
                    }, {
                        "featureType": "highway",
                        "elementType": "labels",
                        "stylers": {
                            "visibility": "off",
                            "curZoomRegionId": "0",
                            "curZoomRegion": "6,10",
                            "level": "9"
                        }
                    }, {
                        "featureType": "highway",
                        "elementType": "labels",
                        "stylers": {
                            "visibility": "off",
                            "curZoomRegionId": "0",
                            "curZoomRegion": "6,10",
                            "level": "10"
                        }
                    }, {
                        "featureType": "provincialway",
                        "stylers": {
                            "curZoomRegionId": "0",
                            "curZoomRegion": "8,9",
                            "level": "8"
                        }
                    }, {
                        "featureType": "provincialway",
                        "stylers": {
                            "curZoomRegionId": "0",
                            "curZoomRegion": "8,9",
                            "level": "9"
                        }
                    }, {
                        "featureType": "provincialway",
                        "elementType": "geometry",
                        "stylers": {
                            "visibility": "off",
                            "curZoomRegionId": "0",
                            "curZoomRegion": "8,9",
                            "level": "8"
                        }
                    }, {
                        "featureType": "provincialway",
                        "elementType": "geometry",
                        "stylers": {
                            "visibility": "off",
                            "curZoomRegionId": "0",
                            "curZoomRegion": "8,9",
                            "level": "9"
                        }
                    }, {
                        "featureType": "provincialway",
                        "elementType": "labels",
                        "stylers": {
                            "visibility": "off",
                            "curZoomRegionId": "0",
                            "curZoomRegion": "8,9",
                            "level": "8"
                        }
                    }, {
                        "featureType": "provincialway",
                        "elementType": "labels",
                        "stylers": {
                            "visibility": "off",
                            "curZoomRegionId": "0",
                            "curZoomRegion": "8,9",
                            "level": "9"
                        }
                    }, {
                        "featureType": "cityhighway",
                        "stylers": {
                            "curZoomRegionId": "0",
                            "curZoomRegion": "6,10",
                            "level": "6"
                        }
                    }, {
                        "featureType": "cityhighway",
                        "stylers": {
                            "curZoomRegionId": "0",
                            "curZoomRegion": "6,10",
                            "level": "7"
                        }
                    }, {
                        "featureType": "cityhighway",
                        "stylers": {
                            "curZoomRegionId": "0",
                            "curZoomRegion": "6,10",
                            "level": "8"
                        }
                    }, {
                        "featureType": "cityhighway",
                        "stylers": {
                            "curZoomRegionId": "0",
                            "curZoomRegion": "6,10",
                            "level": "9"
                        }
                    }, {
                        "featureType": "cityhighway",
                        "stylers": {
                            "curZoomRegionId": "0",
                            "curZoomRegion": "6,10",
                            "level": "10"
                        }
                    }, {
                        "featureType": "cityhighway",
                        "elementType": "geometry",
                        "stylers": {
                            "visibility": "off",
                            "curZoomRegionId": "0",
                            "curZoomRegion": "6,10",
                            "level": "6"
                        }
                    }, {
                        "featureType": "cityhighway",
                        "elementType": "geometry",
                        "stylers": {
                            "visibility": "off",
                            "curZoomRegionId": "0",
                            "curZoomRegion": "6,10",
                            "level": "7"
                        }
                    }, {
                        "featureType": "cityhighway",
                        "elementType": "geometry",
                        "stylers": {
                            "visibility": "off",
                            "curZoomRegionId": "0",
                            "curZoomRegion": "6,10",
                            "level": "8"
                        }
                    }, {
                        "featureType": "cityhighway",
                        "elementType": "geometry",
                        "stylers": {
                            "visibility": "off",
                            "curZoomRegionId": "0",
                            "curZoomRegion": "6,10",
                            "level": "9"
                        }
                    }, {
                        "featureType": "cityhighway",
                        "elementType": "geometry",
                        "stylers": {
                            "visibility": "off",
                            "curZoomRegionId": "0",
                            "curZoomRegion": "6,10",
                            "level": "10"
                        }
                    }, {
                        "featureType": "cityhighway",
                        "elementType": "labels",
                        "stylers": {
                            "visibility": "off",
                            "curZoomRegionId": "0",
                            "curZoomRegion": "6,10",
                            "level": "6"
                        }
                    }, {
                        "featureType": "cityhighway",
                        "elementType": "labels",
                        "stylers": {
                            "visibility": "off",
                            "curZoomRegionId": "0",
                            "curZoomRegion": "6,10",
                            "level": "7"
                        }
                    }, {
                        "featureType": "cityhighway",
                        "elementType": "labels",
                        "stylers": {
                            "visibility": "off",
                            "curZoomRegionId": "0",
                            "curZoomRegion": "6,10",
                            "level": "8"
                        }
                    }, {
                        "featureType": "cityhighway",
                        "elementType": "labels",
                        "stylers": {
                            "visibility": "off",
                            "curZoomRegionId": "0",
                            "curZoomRegion": "6,10",
                            "level": "9"
                        }
                    }, {
                        "featureType": "cityhighway",
                        "elementType": "labels",
                        "stylers": {
                            "visibility": "off",
                            "curZoomRegionId": "0",
                            "curZoomRegion": "6,10",
                            "level": "10"
                        }
                    }, {
                        "featureType": "arterial",
                        "stylers": {
                            "curZoomRegionId": "0",
                            "curZoomRegion": "9,10",
                            "level": "9"
                        }
                    }, {
                        "featureType": "arterial",
                        "stylers": {
                            "curZoomRegionId": "0",
                            "curZoomRegion": "9,10",
                            "level": "10"
                        }
                    }, {
                        "featureType": "arterial",
                        "elementType": "geometry",
                        "stylers": {
                            "visibility": "off",
                            "curZoomRegionId": "0",
                            "curZoomRegion": "9,10",
                            "level": "9"
                        }
                    }, {
                        "featureType": "arterial",
                        "elementType": "geometry",
                        "stylers": {
                            "visibility": "off",
                            "curZoomRegionId": "0",
                            "curZoomRegion": "9,10",
                            "level": "10"
                        }
                    }, {
                        "featureType": "arterial",
                        "elementType": "labels",
                        "stylers": {
                            "visibility": "off",
                            "curZoomRegionId": "0",
                            "curZoomRegion": "9,10",
                            "level": "9"
                        }
                    }, {
                        "featureType": "arterial",
                        "elementType": "labels",
                        "stylers": {
                            "visibility": "off",
                            "curZoomRegionId": "0",
                            "curZoomRegion": "9,10",
                            "level": "10"
                        }
                    }, {
                        "featureType": "building",
                        "elementType": "geometry.topfill",
                        "stylers": {
                            "color": "#2a3341ff"
                        }
                    }, {
                        "featureType": "building",
                        "elementType": "geometry.sidefill",
                        "stylers": {
                            "color": "#313b4cff"
                        }
                    }, {
                        "featureType": "building",
                        "elementType": "geometry.stroke",
                        "stylers": {
                            "color": "#1a212eff"
                        }
                    }, {
                        "featureType": "road",
                        "elementType": "labels.text.fill",
                        "stylers": {
                            "color": "#759879ff"
                        }
                    }, {
                        "featureType": "road",
                        "elementType": "labels.text.stroke",
                        "stylers": {
                            "color": "#1a2e1cff"
                        }
                    }, {
                        "featureType": "provincialway",
                        "elementType": "labels.text.fill",
                        "stylers": {
                            "color": "#759879ff"
                        }
                    }, {
                        "featureType": "cityhighway",
                        "elementType": "labels.text.fill",
                        "stylers": {
                            "color": "#759879ff"
                        }
                    }, {
                        "featureType": "arterial",
                        "elementType": "labels.text.fill",
                        "stylers": {
                            "color": "#759879ff"
                        }
                    }, {
                        "featureType": "provincialway",
                        "elementType": "labels.text.stroke",
                        "stylers": {
                            "color": "#1a2e1cff"
                        }
                    }, {
                        "featureType": "cityhighway",
                        "elementType": "labels.text.stroke",
                        "stylers": {
                            "color": "#1a2e1cff"
                        }
                    }, {
                        "featureType": "arterial",
                        "elementType": "labels.text.stroke",
                        "stylers": {
                            "color": "#1a2e1cff"
                        }
                    }, {
                        "featureType": "local",
                        "elementType": "labels",
                        "stylers": {
                            "visibility": "off"
                        }
                    }, {
                        "featureType": "manmade",
                        "elementType": "labels.text.fill",
                        "stylers": {
                            "color": "#d69563ff"
                        }
                    }, {
                        "featureType": "manmade",
                        "elementType": "labels.text.stroke",
                        "stylers": {
                            "color": "#17263cff"
                        }
                    }, {
                        "featureType": "subwaystation",
                        "elementType": "geometry",
                        "stylers": {
                            "visibility": "off"
                        }
                    }, {
                        "featureType": "transportationlabel",
                        "elementType": "labels.icon",
                        "stylers": {
                            "visibility": "off"
                        }
                    }, {
                        "featureType": "transportationlabel",
                        "elementType": "labels",
                        "stylers": {
                            "visibility": "off"
                        }
                    }, {
                        "featureType": "estate",
                        "elementType": "geometry",
                        "stylers": {
                            "color": "#2a3341ff"
                        }
                    }]
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
    switch (layer_time) {
        case 'day':
            while (i < list.length) {
                t = list[i];
                p += t.slice(0, 4) + '-' + t.slice(4, 6) + '-' + t.slice(6, 8) + ' ';
                i++;
            }
            document.getElementById('p_time').innerHTML = p;
            break;
        case 'year':
            while (i < list.length) {
                t = list[i];
                p += t + ' ';
                i++;
            }
            document.getElementById('p_time').innerHTML = p;
            break;
        case 'month':
            while (i < list.length) {
                t = list[i];
                p += t.slice(0, 4) + '-' + t.slice(4, 6) + ' ';
                i++;
            }
            document.getElementById('p_time').innerHTML = p;
            break;
        default:
            document.getElementById('p_time').innerHTML = p;
            break;
    }

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
    layer_time = 0;
    pushtext1(choose_geo);
    pushtext2(choose_time);
})
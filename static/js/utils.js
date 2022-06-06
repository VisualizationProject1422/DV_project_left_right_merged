// tools
// 七大地区与省份对应
const huabei = ['北京市', '天津市', '河北省', '山西省', '内蒙古自治区']
const dongbei = ['辽宁省', '吉林省', '黑龙江省']
const huadong = ['上海市', '江苏省', '浙江省', '安徽省', '福建省', '江西省', '山东省', '台湾省']
const huazhong = ['河南省', '湖北省', '湖南省']
const huanan = ['广东省', '广西壮族自治区', '海南省', '香港特别行政区', '澳门特别行政区']
const xinan = ['重庆市', '四川省', '贵州省', '云南省', '西藏自治区']
const xibei = ['陕西省', '甘肃省', '青海省', '宁夏回族自治区', '新疆维吾尔自治区']

// AQI和污染指数级别的 转换
function AQI_level(AQI) {
    if (AQI <= 200) {
        return AQI % 50 ? Math.floor(AQI/50) : AQI/50 - 1
    } else if ( 200 <= AQI && AQI <= 300) {
        return 4
    } else {
        return 5
    }
}
// AQI level color bar: 从左往右 优 良 轻度污染 中度污染 重度污染 严重污染（目前颜色跟国标不一样）
var AQI_level_color = ['#1a9850', '#91cf60', '#d9ef8b', '#fee08b', '#fc8d59', '#d73027']
var AQI_level_rule = ['优', '良', '轻度污染', '中度污染', '重度污染', '严重污染']

// IAQI color bar: 从左往右 PM2.5 PM10 SO2 NO2 CO O3
var IAQI_color = ["#d0743c", "#a05d56", "#8a89a6", "#7b6888", "#98abc5", "#6b486b"]

function getAverage(obj, num) {
    for (key in obj) {
        if (key != 'division') {
            obj[key] /= num
        }
    }
    return obj
}

// leftMap
function mapInit() {
    $.get('https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json').done(function (map) {  //读取json文件
        echarts.registerMap("china", map);
        data_map = map;
        option_map = {
            tooltip: {},
            visualMap: {
                pieces : [
                    { min : 300 , color : '#330033' , label: '严重污染' },
                    { min : 200 , max : 300 , color : '#996699' , label: '重度污染' },
                    { min : 150 , max : 200 , color : '#CC3333' , label: '中度污染' },
                    { min : 100 , max : 150 , color : '#FF9966' , label: '轻度污染' },
                    { min : 50 , max : 100 , color : '#FFFFCC' , label: '良' },
                    { max : 50 , color : '#99CC99' , label: '优' }
                ],
                type: 'piecewise',
                selectmode: false,
                show: false,
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
                tooltip:{
                    position: 'top',
                    formatter: function (params) {
                        console.log(params);
                        var aqi = Math.round(params.data.value);
                        var res = params.data.name+'<br/>AQI : '+ aqi.toString();
                        return res;
                    }
                }
            }

        }
    });
}


// part0 pre work
var body = d3.select('body');
var left_part = body.select('#leftPart');
var rank = left_part.select('#rank');
var stack = left_part.select('#stack');
var scatter = left_part.select('#scatter');
var leftMap = left_part.select('#leftMap');


var tooltip = left_part.append("div")
    .style("opacity", 0)
    .attr("class", "tooltip")
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "2px")
    .style("border-radius", "5px")
    .style("padding", "5px")
    .style('position', 'absolute')

// pollute color-scale
const polluteColorScale = d3.scaleOrdinal()
    .domain([0, 7])
    .range(d3.schemeSet2)

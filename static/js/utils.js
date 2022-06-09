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


// part0 pre work
var body = d3.select('body');
var left_part = body.select('#leftPart');
var rank = left_part.select('#rank');
var stack = left_part.select('#stack');
var scatter = left_part.select('#scatter');
var leftMap = left_part.select('#leftMap');


var tooltip = body.append("div")
    .style("opacity", 0)
    .attr("class", "tooltip")
    .style("background-color", 'white')
    .style("border", "solid")
    .style("border-width", "2px")
    .style("border-radius", "5px")
    .style("padding", "5px")
    .style('position', 'absolute')

// pollute color-scale
const polluteColorScale = d3.scaleOrdinal()
    .domain([0, 7])
    .range(d3.schemeSet2)

// const rank_title = d3.select('#rankTitle')
// rank_title.on('click', function() {
//     console.log(event.pageX)
//     console.log(event.pageY)
//     tooltip.style('top', this.event.pageY + 'px')
//             .style('left', this.event.pageY + 'px')
// })



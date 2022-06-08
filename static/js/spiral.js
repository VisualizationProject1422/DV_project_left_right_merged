// var myselect = document.getElementById("year");
// var index = myselect.selectedIndex;
// // var province = myselect.se
// var year = myselect.options[index].value;

// var myselect2 = document.getElementById("cities");
// // var index2=myselect2.selectedIndex;
// // var province = myselect.se
// var city = myselect2.value;
// console.log(myselect2)
// console.log(city)
// if (city == "市辖区") {
//     var myselect3 = document.getElementById("provinces");
//     // var index2=myselect2.selectedIndex;
//     // var province = myselect.se
//     city = myselect3.value;
//     console.log(city)
//     if (city ==11) {
//         city = "北京市"
//     }
//     if (city ==31) {
//         city = "上海市"
//     }
//     if (city ==50) {
//         city = "重庆市"
//     }
//     if (city ==12) {
//         city = "天津市"
//     }
// }



var width1 = 230,
    height1 = 230,
    start = 0,
    end = 2.25,
    numSpirals = 3,
    margin1 = { top: 15, bottom: 15, left: 15, right: 15 };

var theta = function (r) {
    return numSpirals * Math.PI * r;
};

// used to assign nodes color by group
var myCat_pol = ['CO', 'SO2', 'NO2', 'O3', 'PM10', 'PM25']

var namescale = d3.scaleOrdinal()
    .range(['CO', 'SO2', 'NO2', 'O3', 'PM10', 'PM2.5'])
    .domain(myCat_pol)

var color = d3.scaleOrdinal()
    .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"])
    .domain(myCat_pol);

var r = d3.min([width1, height1]) / 2 - 30;

var radius = d3.scaleLinear()
    .domain([start, end])
    .range([20, r]);

var svg_spiral = d3.select("#pie").append("svg")
    .attr("width", width1 + margin1.right + margin1.left)
    .attr("height", height1 + margin1.left + margin1.right)
    .append("g")
    .attr("transform", "translate(" + (width1 / 2 - 5) + "," + (height1 / 2 + 5) + ")");

var points = d3.range(start, end + 0.001, (end - start) / 1000);

var spiral = d3.radialLine()
    .curve(d3.curveCardinal)
    .angle(theta)
    .radius(radius);

var path = svg_spiral.append("path")
    .datum(points)
    .attr("id", "spiral")
    .attr("d", spiral)
    .style("fill", "none")
    .style("stroke", "steelblue");

var spiralLength = 1115,
    N = 365,
    barWidth = (spiralLength / N) - 0.5;
// var someData = [];
// for (var i = 0; i < N; i++) {
//     var currentDate = new Date();
//     currentDate.setDate(currentDate.getDate() + i);
//     someData.push({
//         date: currentDate,
//         value: Math.random(),
//         group: currentDate.getMonth()
//     });
// }

d3.csv(`static/data/` + year + `/spiral/year/` + city + `.csv`, function (data) {
    // d3.csv(`/in_use/2013_Xian_main_pollution.csv`, function (data) {
    // console.log(data)
    var dateParse = d3.timeParse("%Y-%m-%d");
    // var timeobj = dateParse(data.Date);
    // data.Date = new Date(data.Date)
    // console.log(data.Date)

    var timeScale = d3.scaleTime()
        .domain(d3.extent(data, function (d) {
            return dateParse(d.Date);
        }))
        .range([0, spiralLength]);

    // yScale for the bar height
    var yScale = d3.scaleLinear()
        .domain([0, d3.max(data, function (d) {
            return d.MAX_val;
        })])
        .range([0, (r / numSpirals) - 23]);

    svg_spiral.selectAll("rect")
        .data(data)
        .enter()
        .append("rect")
        .attr("class", "rect_spiral")
        .attr("x", function (d, i) {

            var linePer = timeScale(dateParse(d.Date)),
                posOnLine = path.node().getPointAtLength(linePer),
                angleOnLine = path.node().getPointAtLength(linePer - barWidth);

            d.linePer = linePer; // % distance are on the spiral
            d.x = posOnLine.x; // x postion on the spiral
            d.y = posOnLine.y; // y position on the spiral

            d.a = (Math.atan2(angleOnLine.y, angleOnLine.x) * 180 / Math.PI) - 90; //angle at the spiral position

            return d.x;
        })
        .attr("y", function (d) {
            return d.y;
        })
        .attr("width", function (d) {
            return barWidth;
        })
        .attr("height", function (d) {
            return yScale(d.MAX_val);
        })
        .style("fill", function (d) { return color(d.MAX_name); })
        .style("stroke", "none")
        .attr("transform", function (d) {
            return "rotate(" + d.a + "," + d.x + "," + d.y + ")"; // rotate the bar
        });

    // add date labels
    var tF = d3.timeFormat("%b %Y"),
        firstInMonth = {};

    svg_spiral.selectAll("text")
        .data(data)
        .enter()
        .append("text")
        .attr("dy", 5)
        .style("text-anchor", "start")
        .style("font", "5px arial")
        .append("textPath")
        // only add for the first of each month
        .filter(function (d) {
            var sd = tF(dateParse(d.Date));
            if (!firstInMonth[sd]) {
                firstInMonth[sd] = 1;
                return true;
            }
            return false;
        })
        .text(function (d) {
            return tF(dateParse(d.Date));
        })
        // place text along spiral
        .attr("xlink:href", "#spiral")
        .style("fill", "grey")
        .attr("startOffset", function (d) {
            return ((d.linePer / spiralLength) * 100) + "%";
        })


    var tooltip2 = d3.select("#pie")
        .append('div')
        .attr('class', 'tooltip')
        .style("position", "absolute")
        .style("opacity", 0)
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "1px")
        .style("border-radius", "3px")
        .style("font-size", "8px")

    tooltip2.append('div')
        .attr('class', 'date');
    tooltip2.append('div')
        .attr('class', 'value');

    svg_spiral.selectAll(".rect_spiral")
        .on('mouseover', function (d) {

            tooltip2.select('.date').html("Date: <b>" + d.Date + "</b>");
            tooltip2.select('.value').html(namescale(d.MAX_name) + ": <b>" + Math.round(d.MAX_val * 100) / 100 + "<b>");

            d3.select(this)
                // .style("fill", "#FFFFFF")
                .style("stroke", "#000000")
                .style("stroke-width", "0.5px");

            tooltip2.style('display', 'block');
            tooltip2.style('opacity', 2);

        })
        .on('mousemove', function (d) {
            tooltip2.style('top', (d3.event.layerY + 10) + 'px')
                .style('left', (d3.event.layerX - 25) + 'px');
        })
        .on('mouseout', function (d) {
            d3.selectAll(".rect_spiral")
                .style("fill", function (d) { return color(d.MAX_name); })
                .style("stroke", "none")

            tooltip2.style('display', 'none');
            tooltip2.style('opacity', 0);
        });

    var legend = svg_spiral.append("g")
        .selectAll("g")
        .data(myCat_pol.reverse())
        .enter().append("g")
        .attr("transform", function (d, i) { return "translate(-10," + ((i - (6 - 1) / 2) * 5) + ")"; });

    legend.append("rect")
        .attr("width", 4)
        .attr("height", 4)
        .attr("fill", color);

    legend.append("text")
        .attr("x", 8)
        .attr("y", 8)
        .attr("dy", "-1em")
        .style("font-size", "4px")
        .text(function (d) { return d; });

})
// var myChart = echarts.init(document.getElementById('calendar'));;
// var data = Server.testdata
// console.log(data)

// var myselect = document.getElementById("year");
// var index = myselect.selectedIndex;
// // var province = myselect.se
// var year = myselect.options[index].value;

// var myselect2 = document.getElementById("cities");
// // var index2=myselect2.selectedIndex;
// // var province = myselect.se
// var city = myselect2.value;
// // console.log(myselect2)
// // console.log(city)
// if (city == "市辖区") {
//     var myselect3 = document.getElementById("provinces");
//     // var index2=myselect2.selectedIndex;
//     // var province = myselect.se
//     city = myselect3.value;
//     // console.log(city)
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


var width2 =200,
    height2 = 200,
    maxRadius = (Math.min(width2, height2) / 2) ;

var formatNumber = d3.format(',d');

var x_s = d3.scaleLinear()
    .range([0-1/4*Math.PI, 2 * Math.PI-1/4*Math.PI])
    .clamp(true);

var y_s = d3.scaleSqrt()
    .range([10, 90]);  
    // .range([maxRadius*.1, maxRadius]);

// var color2 = d3.scaleOrdinal(d3.schemeCategory20);


var myColor2 = ["#1a9850", "#91cf60", "#d9ef8b", "#fee08b", "#fc8d59", "#d73027","#c6dbef","#ece7f2","#ece7f2","#ece7f2","#ece7f2","#ece7f2","#ece7f2","#ece7f2","#ece7f2","#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]
var myCat = ['优', '良', '轻度污染', '中度污染', '重度污染', '严重污染'," ","南风","北风","东风","西风","东南风","东北风","西南风","西北风",'CO_IAQI', 'SO2_IAQI', 'NO2_IAQI', 'O3_IAQI', 'PM10_IAQI', 'PM25_IAQI']
var myColor2 = d3.scaleOrdinal()
  .range(myColor2)
  .domain(myCat)

var partition = d3.partition();

var arc = d3.arc()
    .startAngle(d => x_s(d.x0))
    .endAngle(d => x_s(d.x1))
    .innerRadius(d => Math.max(0, y_s(d.y0)))
    .outerRadius(d => Math.max(0, y_s(d.y1)));

var middleArcLine = d => {
    var halfPi = Math.PI/2;
    var angles = [x_s(d.x0) - halfPi, x_s(d.x1) - halfPi];
    var r_s = Math.max(0, (y_s(d.y0) + y_s(d.y1)) / 2);

    var middleAngle = (angles[1] + angles[0]) / 2;
    var invertDirection = middleAngle > 0 && middleAngle < Math.PI; // On lower quadrants write text ccw
    if (invertDirection) { angles.reverse(); }

    var path = d3.path();
    path.arc(0, 0, r_s, angles[0], angles[1], invertDirection);
    return path.toString();
};

var textFits = d => {
    var CHAR_SPACE = 6;

    var deltaAngle = x_s(d.x1) - x_s(d.x0);
    var r_s = Math.max(0, (y_s(d.y0) + y_s(d.y1)) / 2);
    var perimeter = r_s * deltaAngle;

    return d.data.name.length * CHAR_SPACE < perimeter;
};

var svg = d3.select('#radar').append('svg')
    .style('width', 200)
    .style('height', 200)
    .attr('viewBox', `${-width2 / 2-20} ${-height2 / 2-20} ${width2+20} ${height2+20}`)
    .on('click', () => focusOn()); // Reset zoom on canvas click

d3.json(`static/data/` + year + `/sunburst/year/` + city + `.json`, (error, root) => {
    if (error) throw error;

    root = d3.hierarchy(root);
    root.sum(d => d.size);
    // console.log(root)

    svg.append("text")
    .style("font-size", "9px")
    .text("各风向下污染严重情况（点击进行放大）")
    .attr("transform", "translate(" + (- width1 / 2 + 55) + "," + (-height1 / 2+5) + ")");

    var slice = svg.selectAll('g.slice')
        .data(partition(root).descendants());

    slice.exit().remove();

    var newSlice = slice.enter()
        .append('g').attr('class', 'slice')
        .on('click', d => {
            d3.event.stopPropagation();
            focusOn(d);
        });

    newSlice.append('title')
        .text(d => d.data.name + '\n' + formatNumber(d.value));

    newSlice.append('path')
        .attr('class', 'main-arc')
        .style('fill', d => myColor2(d.data.name))
        .style('opacity', 0.8)
        // .on('mousemove', d => {
        //     d3.select(this).style('opacity', 1)
        // })
        .attr('d', arc);


    newSlice.append('path')
        .attr('class', 'hidden-arc')
        .attr('id', (_, i) => `hiddenArc${i}`)
        .attr('d', middleArcLine);

    var text = newSlice.append('text')
        .attr('display', d => textFits(d) ? null : 'none');

    // Add white contour
    text.append('textPath')
        .attr('startOffset','50%')
        .attr('xlink:href', (_, i) => `#hiddenArc${i}` )
        .text(d => d.data.name)
        .style('fill', 'none')
        .style('stroke', '#fff')
        .style('stroke-width',1)
        .style('stroke-linejoin', 'round')
        .style("font-size", "5px");

    text.append('textPath')
        .attr('startOffset','50%')
        .style("font-size", "5px")
        .attr('xlink:href', (_, i) => `#hiddenArc${i}` )
        .text(d => d.data.name);
});

function focusOn(d = { x0: 0, x1: 1, y0: 0, y1: 1 }) {
    // Reset to top-level if no data point specified

    var transition = svg.transition()
        .duration(750)
        .tween('scale', () => {
            var xd = d3.interpolate(x_s.domain(), [d.x0, d.x1]),
                yd = d3.interpolate(y_s.domain(), [d.y0, 1]);
            return t => { x_s.domain(xd(t)); y_s.domain(yd(t)); };
        });

    transition.selectAll('path.main-arc')
        .attrTween('d', d => () => arc(d));

    transition.selectAll('path.hidden-arc')
        .attrTween('d', d => () => middleArcLine(d));

    transition.selectAll('text')
        .attrTween('display', d => () => textFits(d) ? null : 'none');

    moveStackToFront(d);

    //

    function moveStackToFront(elD) {
        svg.selectAll('.slice').filter(d => d === elD)
            .each(function(d) {
                this.parentNode.appendChild(this);
                if (d.parent) { moveStackToFront(d.parent); }
            })
    }
}
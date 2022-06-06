var year = Server.year;
// console.log(data)
// // #radar
// clearcontent('radar')

d3.csv(`static/in_use/`+year+`_Xian_all_concentration.csv`, function (data) {
var width = 230,
    height = 230;

var svg = d3.select("#radar")
    .append("svg")
    .attr("width", width)
    .attr("height", height),

    innerRadius = 22,
    outerRadius = Math.min(width, height) / 2 - 5,
    new_height = height / 2 + 10
g = svg.append("g").attr("transform", "translate(" + width / 2 + "," + new_height + ")");

var x = d3.scaleBand()
    .range([0, 2 * Math.PI])
    .align(0);

var y = d3.scaleRadial()
    .range([innerRadius, outerRadius]);

var z = d3.scaleOrdinal()
    .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

// d3.csv("data.csv", function(d, i, columns) {
//   for (i = 1, t = 0; i < columns.length; ++i) t += d[columns[i]] = +d[columns[i]];
//   d.total = t;
//   return d;
// }, function(error, data) {
//   if (error) throw error;

var svg3 = d3.select("#radar")
    .append("div")
    .style("opacity", 0)
    .attr("class", "tooltip")
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "1px")
    .style("border-radius", "3px")
    .style("font-size", "8px")
    .style("position", "absolute")

var mouseover = function (d) {
    svg3
        .style("opacity", 1)
    d3.select(this)
        .style("stroke", "black")
        .style("stroke-width", 1)
        .style("opacity", 1)
}
var mousemove = function (d) {
    svg3.html("该污染物的IAQI: " + Math.floor((d[1] - d[0])))
        .style("left", (d3.mouse(this)[0]) + 70 + "px")
        .style("top", (d3.mouse(this)[1]) + 70 + "px")
        .style("opacity", 1)
}
var mouseleave = function (d) {
    svg3
        .style("opacity", 0)
    d3.select(this)
        .style("stroke", "none")
        .style("opacity", 0.9)
}



//   x.domain(data.map(function(d) { return d.State; }));
var myCat = ['CO', 'SO2', 'NO2', 'O3', 'PM10', 'PM25']
x.domain(data.map(function (d) { return d.Month; }));
y.domain([0, d3.max(data, function (d) { return d.Total; })]);
z.domain(myCat);

var stackGen = d3.stack()
    // Defining keys
    .keys(myCat)

var stack = stackGen(data);

// console.log(stack);

g.append("g")
    .selectAll("g")
    .data(stack)
    .enter().append("g")
    .attr("fill", function (d) { return z(d.key); })
    .style("opacity", 0.9)
    .selectAll("path")
    .data(function (d) { return d; })
    .enter().append("path")
    .attr("d", d3.arc()
        .innerRadius(function (d) { return y(d[0]); })
        .outerRadius(function (d) { return y(d[1]); })
        .startAngle(function (d) { return x(d.data.Month); })
        .endAngle(function (d) { return x(d.data.Month) + x.bandwidth(); })
        .padAngle(0.01)
        .padRadius(innerRadius))
    .on("mouseover", mouseover)
    .on("mousemove", mousemove)
    .on("mouseleave", mouseleave)




var label = g.append("g")
    .selectAll("g")
    .data(data)
    .enter().append("g")
    .attr("text-anchor", "middle")
    .attr("transform", function (d) { return "rotate(" + ((x(d.Month) + x.bandwidth() / 2) * 180 / Math.PI - 90) + ")translate(" + innerRadius + ",0)"; });

label.append("line")
    .attr("x2", -1)
    .attr("stroke", "#000");

label.append("text")
    .style("font-size", "5px")
    .attr("transform", function (d) { return (x(d.Month) + x.bandwidth() / 2 + Math.PI / 2) % (2 * Math.PI) < Math.PI ? "rotate(90)translate(0,6)" : "rotate(-90)translate(0,-3)"; })
    .text(function (d) { return d.Month; });



var yAxis = g.append("g")
    .attr("text-anchor", "middle");

var yTick = yAxis
    .selectAll("g")
    .data(y.ticks(4))
    .enter().append("g");

yTick.append("circle")
    .attr("fill", "none")
    .attr("stroke", "gray")
    .attr("opacity", 0.5)
    .attr("r", y);

//   yTick.append("text")
//       .attr("y", function(d) { return -y(d); })
//       .attr("dy", "0.05em")
//       .attr("fill", "none")
//       .attr("stroke", "#fff")
//       .attr("stroke-width", 5)
//       .style("font-size", "4px")
//       .text(y.tickFormat(5, "s"));


yTick.append("text")
    .attr("y", function (d) { return -y(d); })
    .attr("dy", "0.1em")
    .style("font-size", "4px")
    .text(y.tickFormat(0.5, "s"));

yAxis.append("text")
    .attr("y", function (d) { return -y(y.ticks(5).pop()); })
    .attr("dy", "-1em")
    .style("font-size", "8px")
    .text("一年中各项污染物指数变化");

var legend = g.append("g")
    .selectAll("g")
    .data(myCat.reverse())
    .enter().append("g")
    .attr("transform", function (d, i) { return "translate(-10," + (i - (6 - 1) / 2) * 5 + ")"; });

legend.append("rect")
    .attr("width", 4)
    .attr("height", 4)
    .attr("fill", z);

legend.append("text")
    .attr("x", 8)
    .attr("y", 8)
    .attr("dy", "-1em")
    .style("font-size", "4px")
    .text(function (d) { return d; });

})
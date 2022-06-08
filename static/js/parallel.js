
var year = 2013
var city = "北京市"

console.log(city)
var myselect = document.getElementById("year");
// var index = myselect.selectedIndex;
// var province = myselect.se

if (myselect != null){
  if ( myselect.value!=null){
     year = myselect.value;
  }
}

var myselect2 = document.getElementById("cities");
// var index2=myselect2.selectedIndex;
// var province = myselect.se
console.log(myselect)
if (myselect2!= null){
  // console.log(city)
  if ( myselect2.value!=""){
    city = myselect2.value;
 }
}

console.log(myselect2.value)
console.log(city)
if (city == "市辖区") {
  var myselect3 = document.getElementById("provinces");
  // var index2=myselect2.selectedIndex;
  // var province = myselect.se
  city = myselect3.value;
  // console.log(city)
  if (city == 11) {
    city = "北京市"
  }
  if (city == 31) {
    city = "上海市"
  }
  if (city == 50) {
    city = "重庆市"
  }
  if (city == 12) {
    city = "天津市"
  }
}

console.log(city)

// set the dimensions and margins of the graph
var margin_line = { top: 30, right: 100, bottom: 50, left: 30 },
  width_line = 480 - margin_line.left - margin_line.right,
  height_line = 200 - margin_line.top - margin_line.bottom;

// append the svg object to the body of the page
var svg_line = d3.select("#calendar")
  .append("svg")
  .attr("width", width_line + margin_line.left + margin_line.right)
  .attr("height", height_line + margin_line.top + margin_line.bottom)
  .append("g")
  .attr("transform",
    "translate(" + margin_line.left + "," + margin_line.top + ")");

svg_line.append("text")
  .style("font-size", "8px")
  .text("(点击上方标签，选择或取消显示线条)")
  .attr("transform", "translate(" + 0 + "," +(-20)+ ")");

//Read the data
d3.csv(`static/data/` + year + `/parallel/year/` + city + `.csv`, function (data) {

  // List of groups (here I have one group per column)
  var allGroup = ['CO', 'SO2', 'NO2', 'O3', 'PM10', 'PM25']

  // Reformat the data: we need an array of arrays of {x, y} tuples
  var dataReady = allGroup.map(function (grpName) { // .map allows to do something for each element of the list
    return {
      name: grpName,
      values: data.map(function (d) {
        return { time: d.Date, value: +d[grpName] };
      })
    };
  });
  // I strongly advise to have a look to dataReady with
  // console.log(dataReady)

  // A color scale: one color for each group
  var myColor = d3.scaleOrdinal()
    .domain(allGroup)
    .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);


  var dateParse = d3.timeParse("%Y-%m-%d");

  // Add X axis --> it is a date format
  var x = d3.scaleLinear()
    .domain(d3.extent(data, function (d) {
      return dateParse(d.Date);
    }))
    .range([0, width_line]);
  svg_line.append("g")
    .attr("transform", "translate(0," + height_line + ")")
    .call(d3.axisBottom(x).tickFormat(d3.timeFormat("%b%d"))
      .ticks(5));

  // Add Y axis
  var y = d3.scaleLinear()
    .domain([d3.min(data, function (d) {
      return +d.AQI;
    }), d3.max(data, function (d) {
      return +d.AQI;
    })])
    .range([height_line - 15, 0]);
  svg_line.append("g")
    .call(d3.axisLeft(y).ticks(5));

  // Add the lines
  var line = d3.line()
    .x(function (d) { return x(dateParse(d.time)) })
    .y(function (d) { return y(+d.value) })
  svg_line.selectAll("myLines")
    .data(dataReady)
    .enter()
    .append("path")
    .attr("class", function (d) { return d.name })
    .attr("d", function (d) { return line(d.values) })
    .attr("stroke", function (d) { return myColor(d.name) })
    .style("stroke-width", 1)
    .style("fill", "none")

  // Add the points
  svg_line
    // First we need to enter in a group
    .selectAll("myDots")
    .data(dataReady)
    .enter()
    .append('g')
    .style("fill", function (d) { return myColor(d.name) })
    .attr("class", function (d) { return d.name })
    // Second we need to enter in the 'values' part of this group
    .selectAll("myPoints")
    .data(function (d) { return d.values })
    .enter()
    .append("circle")
    .attr("cx", function (d) { return x(dateParse(d.time)) })
    .attr("cy", function (d) { return y(d.value) })
    .attr("r", 1)
  // .attr("stroke", "white")

  // Add a label at the end of each line
  svg_line
    .selectAll("myLabels")
    .data(dataReady)
    .enter()
    .append('g')
    .append("text")
    .attr("class", function (d) { return d.name })
    .datum(function (d) { return { name: d.name, value: d.values[d.values.length - 1] }; }) // keep only the last value of each time series
    .attr("transform", function (d) { return "translate(" + x(dateParse(d.value.time)) + "," + y(d.value.value) + ")"; }) // Put the text at the position of the last point
    .attr("x", 12) // shift the text a bit more right
    .text(function (d) { return d.name; })
    .style("fill", function (d) { return myColor(d.name) })
    .style("font-size", 8)

  // Add a legend (interactive)
  svg_line
    .selectAll("myLegend")
    .data(dataReady)
    .enter()
    .append('g')
    .append("text")
    .attr('x', function (d, i) { return 10 + i * 50 })
    .attr('y', 0)
    .text(function (d) { return d.name; })
    .style("fill", function (d) { return myColor(d.name) })
    .style("font-size", 8)
    .on("click", function (d) {
      // is the element currently visible ?
      currentOpacity = d3.selectAll("." + d.name).style("opacity")
      // Change the opacity: from 0 to 1 or from 1 to 0
      d3.selectAll("." + d.name).transition().style("opacity", currentOpacity == 1 ? 0 : 1)

    })
})


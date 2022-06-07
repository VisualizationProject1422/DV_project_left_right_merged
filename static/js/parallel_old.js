// height: 150px;
// width: 430px;
// var data= Server_parallel.parallel;
// console.log(data)

// set the dimensions and margins of the graph
var margin_pap = { top: 30, right: 50, bottom: 10, left: 50 },
  width_pap = 420 - margin.left - margin.right,
  height_pap = 180 - margin.top - margin.bottom;

// append the svg_pap object to the body of the page
var svg_pap = d3.select("#calendar")
  .append("svg")
  .attr("width", width_pap + margin.left + margin.right)
  .attr("height", height_pap + margin.top + margin.bottom)
  .append("g")
  .attr("transform",
    "translate(" + margin.left + "," + margin.top + ")");
// .style("position", "absolute")
// Color scale: give me a specie name, I return a color

d3.csv(`static/in_use/2013_01_Xian_parallel.csv`, function (data) {
  // console.log(data)
  var myCat = ['优', '良', '轻度污染', '中度污染', '重度污染', '严重污染']
  var color = d3.scaleOrdinal()
    .domain(myCat)
    .range(["#1a9850", "#91cf60", "#d9ef8b", "#fee08b", "#fc8d59", "#d73027"])
  // Here I set the list of dimension manually to control the order of axis:
  //   dimensions = ['PM2.5_IAQI','PM10_IAQI','SO2_IAQI','NO2_IAQI','CO_IAQI','O3_IAQI','AQI',' TEMP(K)',' PSFC(Pa)',' RH(%)']
  dimensions = ['PM2.5_IAQI', 'PM10_IAQI', 'SO2_IAQI', 'NO2_IAQI', 'CO_IAQI', 'O3_IAQI', 'AQI', ' TEMP(K)', ' RH(%)', ' PSFC(Pa)']

  // For each dimension, I build a linear scale. I store all in a y object
  var maxpa = d3.max(data, function (d) { return +d[' PSFC(Pa)']; })
  var minpa = d3.min(data, function (d) { return +d[' PSFC(Pa)']; })
  var y = {}
  // y['PM2.5_IAQI'] = d3.scaleLinear()
  //   .domain([d3.min(data, function (d) { return +d['PM2.5_IAQI']; }), d3.max(data, function (d) { return +d['PM2.5_IAQI']; })])
  //   .range([height_pap, 0])
  // y['PM10_IAQI'] = d3.scaleLinear()
  //   .domain([d3.min(data, function (d) { return +d['PM10_IAQI']; }), d3.max(data, function (d) { return +d['PM10_IAQI']; })])
  //   .range([height_pap, 0])
  // y['SO2_IAQI'] = d3.scaleLinear()
  //   .domain([d3.min(data, function (d) { return +d['SO2_IAQI']; }), d3.max(data, function (d) { return +d['SO2_IAQI']; })])
  //   .range([height_pap, 0])
  // y['NO2_IAQI'] = d3.scaleLinear()
  //   .domain([d3.min(data, function (d) { return +d['NO2_IAQI']; }), d3.max(data, function (d) { return +d['NO2_IAQI']; })])
  //   .range([height_pap, 0])
  // y['CO_IAQI'] = d3.scaleLinear()
  //   .domain([d3.min(data, function (d) { return +d['CO_IAQI']; }), d3.max(data, function (d) { return +d['CO_IAQI']; })])
  //   .range([height_pap, 0])
  // y['O3_IAQI'] = d3.scaleLinear()
  //   .domain([d3.min(data, function (d) { return +d['O3_IAQI']; }), d3.max(data, function (d) { return +d['O3_IAQI']; })])
  //   .range([height_pap, 0])
  // y['AQI'] = d3.scaleLinear()
  //   .domain([d3.min(data, function (d) { return +d['AQI']; }), d3.max(data, function (d) { return +d['AQI']; })])
  //   .range([height_pap, 0])
  // y[' TEMP(K)'] = d3.scaleLinear()
  //   .domain([d3.min(data, function (d) { return +d[' TEMP(K)']; }), d3.max(data, function (d) { return +d[' TEMP(K)']; })])
  //   .range([height_pap, 0])
  // y[' RH(%)'] = d3.scaleLinear()
  //   .domain([d3.min(data, function (d) { return +d[' RH(%)']; }), d3.max(data, function (d) { return +d[' RH(%)']; })])
  //   .range([height_pap, 0])
  // y[' PSFC(Pa)'] = d3.scaleLinear()
  //   .domain([minpa, maxpa])
  //   .range([height_pap, 0])

  y['PM2.5_IAQI'] = d3.scaleLinear()
    .domain([d3.min(data, function (d) { return +d['AQI']; }), d3.max(data, function (d) { return +d['AQI']; })])
    .range([height_pap, 0])
  y['PM10_IAQI'] = d3.scaleLinear()
    .domain([d3.min(data, function (d) { return +d['AQI']; }), d3.max(data, function (d) { return +d['AQI']; })])
    .range([height_pap, 0])
  y['SO2_IAQI'] = d3.scaleLinear()
    .domain([d3.min(data, function (d) { return +d['AQI']; }), d3.max(data, function (d) { return +d['AQI']; })])
    .range([height_pap, 0])
  y['NO2_IAQI'] = d3.scaleLinear()
    .domain([d3.min(data, function (d) { return +d['AQI']; }), d3.max(data, function (d) { return +d['AQI']; })])
    .range([height_pap, 0])
  y['CO_IAQI'] = d3.scaleLinear()
    .domain([d3.min(data, function (d) { return +d['AQI']; }), d3.max(data, function (d) { return +d['AQI']; })])
    .range([height_pap, 0])
  y['O3_IAQI'] = d3.scaleLinear()
    .domain([d3.min(data, function (d) { return +d['AQI']; }), d3.max(data, function (d) { return +d['AQI']; })])
    .range([height_pap, 0])
  y['AQI'] = d3.scaleLinear()
    .domain([d3.min(data, function (d) { return +d['AQI']; }), d3.max(data, function (d) { return +d['AQI']; })])
    .range([height_pap, 0])
  y[' TEMP(K)'] = d3.scaleLinear()
    .domain([d3.min(data, function (d) { return +d[' TEMP(K)']; }), d3.max(data, function (d) { return +d[' TEMP(K)']; })])
    .range([height_pap, 0])
  y[' RH(%)'] = d3.scaleLinear()
    .domain([d3.min(data, function (d) { return +d[' RH(%)']; }), d3.max(data, function (d) { return +d[' RH(%)']; })])
    .range([height_pap, 0])
  y[' PSFC(Pa)'] = d3.scaleLinear()
    .domain([minpa, maxpa])
    .range([height_pap, 0])
  //   // Build the X scale -> it find the best position for each Y axis
  x = d3.scalePoint()
    .range([0, width_pap])
    .domain(dimensions);

  // Highlight the specie that is hovered
  var highlight = function (d) {

    selected_specie = d.指数类别

    // first every group turns grey
    d3.selectAll(".line")
      .transition().duration(200)
      .style("stroke", "lightgrey")
      .style("opacity", "0.2")
    // Second the hovered specie takes its color
    d3.selectAll("." + selected_specie)
      .transition().duration(200)
      .style("stroke", color(selected_specie))
      .style("opacity", "1")
  }

  // Unhighlight
  var doNotHighlight = function (d) {
    d3.selectAll(".line")
      .transition().duration(200).delay(1000)
      .style("stroke", function (d) { return (color(d.指数类别)) })
      .style("opacity", 0.5)
  }

  // The path function take a row of the csv as input, and return x and y coordinates of the line to draw for this raw.
  function path(d) {
    return d3.line()(dimensions.map(function (p) { return [x(p), y[p](+d[p])]; }));
  }

  // Draw the lines
  svg_pap
    .selectAll("myPath")
    .data(data)
    .enter()
    .append("path")
    .attr("class", function (d) { return "line " + d.指数类别 }) // 2 class for each line: 'line' and the group name
    .attr("d", path)
    .style("fill", "none")
    .style("stroke", function (d) { return (color(d.指数类别)) })
    .style("opacity", 0.5)
    .on("mouseover", highlight)
    .on("mouseleave", doNotHighlight)

  var textscale = d3.scaleOrdinal()
    .domain(dimensions)
    .range(['PM2.5', 'PM10', 'SO2', 'NO2', 'CO', 'O3', 'AQI', '温度(C)', '湿度(%)', '压强(kPa)'])

  // Draw the axis:
  svg_pap.selectAll("myAxis")
    // For each dimension of the dataset I add a 'g' element:
    .data(dimensions).enter()
    .append("g")
    .attr("class", "axis")
    .style("opacity", 0.5)
    // I translate this element to its right position on the x axis
    .attr("transform", function (d) { return "translate(" + x(d) + ")"; })
    // And I build the axis with the call function
    .each(function (d) { d3.select(this).call(d3.axisLeft().ticks(6).scale(y[d])); })
    .style("font-size", "6px")
    // Add axis title
    .append("text")
    .style("opacity", 1)
    .style("text-anchor", "middle")
    .attr("y", -9)
    .text(function (d) { return textscale(d); })
    .style("fill", "black")
    .style("font-size", "8px")
})
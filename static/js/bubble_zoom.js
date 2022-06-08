var type = "rh"

var typeselect = document.getElementById("bub");
// var indext = typeselect.selectedIndex;
// var province = myselect.se
// console.log(typeselect)

if (typeselect!=null){
    type = typeselect.value;
}
// console.log(type)

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



if (type == "rh") {
    // console.log("beizou")
    // set the dimensions and margins of the graph
    var margin = { top: 30, right: 5, bottom: 30, left: 35 },
        width = 370 - margin.left - margin.right,
        height = 250 - margin.top - margin.bottom;

    // append the svg object to the body of the page
    var Svg = d3.select("#everydayAQI")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    //Read the data
    // d3.csv(`static/data/` + year + `/bubble/year/` + city + `.csv`, function (data) {
    d3.csv(`static/data/` + year + `/bubble/year/` + city + `.csv`, function (data) {
        // console.log(data)
        var dateParse = d3.timeParse("%Y-%m-%d");
        // Add X axis
        var x = d3.scaleTime()
            .domain(d3.extent(data, function (d) {
                return dateParse(d.Date);
            }))
            .range([0, width]);
        var xAxis = Svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x)
                .tickFormat(d3.timeFormat("%b%d"))
                .ticks(5));

        // Add Y axis
        // console.log(d3.max(data, function (d) { return d.rh; }))
        var y = d3.scaleLinear()
            .domain([d3.min(data, function (d) {
                return +d.rh;
            }), d3.max(data, function (d) {
                return +d.rh;
            })])
            .range([height, 0]);
        Svg.append("g")
            .call(d3.axisLeft(y));

        var z = d3.scaleLinear()
            .domain([0, d3.max(data, function (d) { return d.AQI; })])
            .range([0, 5]);
        var Color = d3.scaleOrdinal()
            .domain(['CO', 'SO2', 'NO2', 'O3', 'PM10', 'PM25'])
            .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

        // Add a clipPath: everything out of this area won't be drawn.
        var clip_bub = Svg.append("defs").append("svg:clipPath")
            .attr("id", "clip_bub")
            .append("svg:rect")
            .attr("width", width)
            .attr("height", height)
            .attr("x", 0)
            .attr("y", 0);

        // Color scale: give me a specie name, I return a color
        // var color = d3.scaleOrdinal()
        //     .domain(["setosa", "versicolor", "virginica"])
        //     .range(["#440154ff", "#21908dff", "#fde725ff"])

        // Add brushing
        var brush = d3.brushX()                 // Add the brush feature using the d3.brush function
            .extent([[0, 0], [width, height]]) // initialise the brush area: start at 0,0 and finishes at width,height: it means I select the whole graph area
            .on("end", updateChart) // Each time the brush selection changes, trigger the 'updateChart' function


        var svg_tool = d3.select("#everydayAQI")
            .append("div")
            .style("opacity", 0)
            .attr("class", "tooltip")
            .style("background-color", "white")
            .style("border", "solid")
            .style("border-width", "1px")
            .style("border-radius", "3px")
            .style("font-size", "8px")
            .style("position", "absolute")


        // -2- Create 3 functions to show / update (when mouse move but stay on same circle) / hide the tooltip
        var showTooltip = function (d) {

            svg_tool
                .style("opacity", 1)
                .html("污染物: " + d.Type + "<br>日期：" + d.Date + "<br>湿度：" + Math.floor(d.rh * 100) / 100 + "<br>AQI: " + Math.floor(d.AQI * 100) / 100)
                .style("left", (d3.mouse(this)[0] + 60) + "px")
                .style("top", (d3.mouse(this)[1] + 60) + "px")
            d3.select(this)
                .style("stroke", "black")
                .style("opacity", 1)
        }
        var moveTooltip = function (d) {
            svg_tool
                .style("left", (d3.mouse(this)[0] + 60) + "px")
                .style("top", (d3.mouse(this)[1] + 60) + "px")
            d3.select(this)
                .style("stroke", "black")
                .style("opacity", 1)
        }
        var hideTooltip = function (d) {
            svg_tool
                .style("opacity", 0)
            d3.select(this)
                .style("stroke", "white")
                .style("opacity", 0.7)
        }

        // Create the scatter variable: where both the circles and the brush take place
        var scatter = Svg.append('g')
            .attr("clip-path", "url(#clip_bub)")

        // Add circles
        scatter
            .append("g")
            .attr("class", "brush")
            .call(brush);
        scatter
            .selectAll("circle")
            .data(data)
            .enter()
            .append("circle")
            .attr("class", function (d) { return "bubbles " + d.Type })
            .attr("cx", function (d) { return x(dateParse(d.Date)); })
            .attr("cy", function (d) { return y(d.rh); })
            .attr("r", function (d) { return z(d.AQI); })
            .style("fill", function (d) { return Color(d.Type) })
            .style("opacity", 0.7)
            .on("mouseover", showTooltip)
            .on("mousemove", moveTooltip)
            .on("mouseleave", hideTooltip)

        // Add the brushing


        // A function that set idleTimeOut to null
        var idleTimeout
        function idled() { idleTimeout = null; }

        // A function that update the chart for given boundaries
        function updateChart() {

            extent = d3.event.selection

            // If no selection, back to initial coordinate. Otherwise, update X axis domain
            if (!extent) {
                if (!idleTimeout) return idleTimeout = setTimeout(idled, 350); // This allows to wait a little bit
                x.domain(d3.extent(data, function (d) {
                    return dateParse(d.Date);
                }))
            } else {
                x.domain([x.invert(extent[0]), x.invert(extent[1])])
                scatter.select(".brush").call(brush.move, null) // This remove the grey brush area as soon as the selection has been done
            }

            // Update axis and circle position
            xAxis.transition().duration(1000).call(d3.axisBottom(x).tickFormat(d3.timeFormat("%b%d")).ticks(5))
            scatter
                .selectAll("circle")
                .transition().duration(1000)
                .attr("cx", function (d) { return x(dateParse(d.Date)); })
                .attr("cy", function (d) { return y(d.rh); })

        }




        // ---------------------------//
        //       HIGHLIGHT GROUP      //
        // ---------------------------//

        // What to do when one group is hovered
        var highlight = function (d) {
            // reduce opacity of all groups
            d3.selectAll(".bubbles").style("opacity", .05)
            // expect the one that is hovered
            d3.selectAll("." + d).style("opacity", 0.7)
        }

        // And when it is not hovered anymore
        var noHighlight = function (d) {
            d3.selectAll(".bubbles").style("opacity", 0.7)
        }

        // ---------------------------//
        //       LEGEND              //
        // ---------------------------//

        // Add legend: circles
        var valuesToShow = [100, 200, 500]
        var xCircle = -5
        var xLabel = 30
        var anothersvg = d3.select("#everydayAQI")
                            .append("svg")
                            .attr("width", 80)
                            .attr("height", 250)
                            .append("g")
                            .attr("transform",
                                "translate(" + margin.left + "," + margin.top + ")");
        anothersvg
            .selectAll("legend")
            .data(valuesToShow)
            .enter()
            .append("circle")
            .attr("cx", xCircle)
            .attr("cy", function (d) { return height - 20 - z(d) })
            .attr("r", function (d) { return z(d) })
            .style("fill", "none")
            .attr("stroke", "black")

        // Add legend: segments
        anothersvg
            .selectAll("legend")
            .data(valuesToShow)
            .enter()
            .append("line")
            .attr('x1', function (d) { return xCircle + z(d) })
            .attr('x2', xLabel)
            .attr('y1', function (d) { return height - 20 - z(d) })
            .attr('y2', function (d) { return height - 20 - z(d) })
            .attr('stroke', 'black')
            .style('stroke-dasharray', ('2,2'))

        // Add legend: labels
        anothersvg
            .selectAll("legend")
            .data(valuesToShow)
            .enter()
            .append("text")
            .attr('x', xLabel)
            .attr('y', function (d) { return height - 20 - z(d) })
            .text(function (d) { return d })
            .style("font-size", 10)
            .attr('alignment-baseline', 'middle')

        // Legend title
        anothersvg.append("text")
            .attr('x', xCircle)
            .attr("y", height + 15 - 20)
            .text("AQI")
            .attr("text-anchor", "middle")

        // Add one dot in the legend for each name.
        var size = 15
        var allgroups = ['PM25', 'PM10', 'O3', 'NO2', 'SO2', 'CO']
        anothersvg.selectAll("myrect")
            .data(allgroups)
            .enter()
            .append("circle")
            .attr("cx", -20)
            .attr("cy", function (d, i) { return 30 + i * (size) }) // 100 is where the first dot appears. 25 is the distance between dots
            .attr("r", 4)
            .style("fill", function (d) { return Color(d) })
            .on("mouseover", highlight)
            .on("mouseleave", noHighlight)

        // Add labels beside legend dots
        anothersvg.selectAll("mylabels")
            .data(allgroups)
            .enter()
            .append("text")
            .style("font-size", "10px")
            .attr("x",-20 + size * .4)
            .attr("y", function (d, i) { return 20 + i * (size) + (size / 2) + 3 }) // 100 is where the first dot appears. 25 is the distance between dots
            .style("fill", function (d) { return Color(d) })
            .text(function (d) { return d })
            .attr("text-anchor", "left")
            .style("alignment-baseline", "middle")
            .on("mouseover", highlight)
            .on("mouseleave", noHighlight)


    })
}

if (type == "temp") {
    // set the dimensions and margins of the graph
    var margin = { top: 30, right: 5, bottom: 30, left: 35 },
        width = 370 - margin.left - margin.right,
        height = 250 - margin.top - margin.bottom;

    // append the svg object to the body of the page
    var Svg = d3.select("#everydayAQI")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    //Read the data
    d3.csv(`static/data/` + year + `/bubble/year/` + city + `.csv`, function (data) {
        // console.log(data)
        var dateParse = d3.timeParse("%Y-%m-%d");
        // Add X axis
        var x = d3.scaleTime()
            .domain(d3.extent(data, function (d) {
                return dateParse(d.Date);
            }))
            .range([0, width ]);
        var xAxis = Svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x)
                .tickFormat(d3.timeFormat("%b%d"))
                .ticks(5));

        // Add Y axis
        // console.log(d3.max(data, function (d) { return d.temp; }))
        var y = d3.scaleLinear()
            .domain([d3.min(data, function (d) {
                return +d.temp;
            }), d3.max(data, function (d) {
                return +d.temp;
            })])
            .range([height, 0]);
        Svg.append("g")
            .call(d3.axisLeft(y));

        var z = d3.scaleLinear()
            .domain([0, d3.max(data, function (d) { return d.AQI; })])
            .range([0, 5]);
        var Color = d3.scaleOrdinal()
            .domain(['CO', 'SO2', 'NO2', 'O3', 'PM10', 'PM25'])
            .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

        // Add a clipPath: everything out of this area won't be drawn.
        var clip_bub = Svg.append("defs").append("svg:clipPath")
            .attr("id", "clip_bub")
            .append("svg:rect")
            .attr("width", width)
            .attr("height", height)
            .attr("x", 0)
            .attr("y", 0);

        // Color scale: give me a specie name, I return a color
        // var color = d3.scaleOrdinal()
        //     .domain(["setosa", "versicolor", "virginica"])
        //     .range(["#440154ff", "#21908dff", "#fde725ff"])

        // Add brushing
        var brush = d3.brushX()                 // Add the brush feature using the d3.brush function
            .extent([[0, 0], [width, height]]) // initialise the brush area: start at 0,0 and finishes at width,height: it means I select the whole graph area
            .on("end", updateChart) // Each time the brush selection changes, trigger the 'updateChart' function


        var svg_tool = d3.select("#everydayAQI")
            .append("div")
            .style("opacity", 0)
            .attr("class", "tooltip")
            .style("background-color", "white")
            .style("border", "solid")
            .style("border-width", "1px")
            .style("border-radius", "3px")
            .style("font-size", "8px")
            .style("position", "absolute")


        // -2- Create 3 functions to show / update (when mouse move but stay on same circle) / hide the tooltip
        var showTooltip = function (d) {

            svg_tool
                .style("opacity", 1)
                .html("污染物: " + d.Type + "<br>日期：" + d.Date + "<br>温度：" + Math.floor(d.temp * 100) / 100 + "<br>AQI: " + Math.floor(d.AQI * 100) / 100)
                .style("left", (d3.mouse(this)[0] + 60) + "px")
                .style("top", (d3.mouse(this)[1] + 60) + "px")
            d3.select(this)
                .style("stroke", "black")
                .style("opacity", 1)
        }
        var moveTooltip = function (d) {
            svg_tool
                .style("left", (d3.mouse(this)[0] + 60) + "px")
                .style("top", (d3.mouse(this)[1] + 60) + "px")
            d3.select(this)
                .style("stroke", "black")
                .style("opacity", 1)
        }
        var hideTooltip = function (d) {
            svg_tool
                .style("opacity", 0)
            d3.select(this)
                .style("stroke", "white")
                .style("opacity", 0.7)
        }

        // Create the scatter variable: where both the circles and the brush take place
        var scatter = Svg.append('g')
            .attr("clip-path", "url(#clip_bub)")

        // Add circles
        scatter
            .append("g")
            .attr("class", "brush")
            .call(brush);
        scatter
            .selectAll("circle")
            .data(data)
            .enter()
            .append("circle")
            .attr("class", function (d) { return "bubbles " + d.Type })
            .attr("cx", function (d) { return x(dateParse(d.Date)); })
            .attr("cy", function (d) { return y(d.temp); })
            .attr("r", function (d) { return z(d.AQI); })
            .style("fill", function (d) { return Color(d.Type) })
            .style("opacity", 0.7)
            .on("mouseover", showTooltip)
            .on("mousemove", moveTooltip)
            .on("mouseleave", hideTooltip)

        // Add the brushing


        // A function that set idleTimeOut to null
        var idleTimeout
        function idled() { idleTimeout = null; }

        // A function that update the chart for given boundaries
        function updateChart() {

            extent = d3.event.selection

            // If no selection, back to initial coordinate. Otherwise, update X axis domain
            if (!extent) {
                if (!idleTimeout) return idleTimeout = setTimeout(idled, 350); // This allows to wait a little bit
                x.domain(d3.extent(data, function (d) {
                    return dateParse(d.Date);
                }))
            } else {
                x.domain([x.invert(extent[0]), x.invert(extent[1])])
                scatter.select(".brush").call(brush.move, null) // This remove the grey brush area as soon as the selection has been done
            }

            // Update axis and circle position
            xAxis.transition().duration(1000).call(d3.axisBottom(x).tickFormat(d3.timeFormat("%b%d")).ticks(5))
            scatter
                .selectAll("circle")
                .transition().duration(1000)
                .attr("cx", function (d) { return x(dateParse(d.Date)); })
                .attr("cy", function (d) { return y(d.temp); })

        }




        // ---------------------------//
        //       HIGHLIGHT GROUP      //
        // ---------------------------//

        // What to do when one group is hovered
        var highlight = function (d) {
            // reduce opacity of all groups
            d3.selectAll(".bubbles").style("opacity", .05)
            // expect the one that is hovered
            d3.selectAll("." + d).style("opacity", 0.7)
        }

        // And when it is not hovered anymore
        var noHighlight = function (d) {
            d3.selectAll(".bubbles").style("opacity", 0.7)
        }

       // ---------------------------//
        //       LEGEND              //
        // ---------------------------//

        // Add legend: circles
        var valuesToShow = [100, 200, 500]
        var xCircle = -5
        var xLabel = 30
        var anothersvg = d3.select("#everydayAQI")
                            .append("svg")
                            .attr("width", 80)
                            .attr("height", 250)
                            .append("g")
                            .attr("transform",
                                "translate(" + margin.left + "," + margin.top + ")");
        anothersvg
            .selectAll("legend")
            .data(valuesToShow)
            .enter()
            .append("circle")
            .attr("cx", xCircle)
            .attr("cy", function (d) { return height - 20 - z(d) })
            .attr("r", function (d) { return z(d) })
            .style("fill", "none")
            .attr("stroke", "black")

        // Add legend: segments
        anothersvg
            .selectAll("legend")
            .data(valuesToShow)
            .enter()
            .append("line")
            .attr('x1', function (d) { return xCircle + z(d) })
            .attr('x2', xLabel)
            .attr('y1', function (d) { return height - 20 - z(d) })
            .attr('y2', function (d) { return height - 20 - z(d) })
            .attr('stroke', 'black')
            .style('stroke-dasharray', ('2,2'))

        // Add legend: labels
        anothersvg
            .selectAll("legend")
            .data(valuesToShow)
            .enter()
            .append("text")
            .attr('x', xLabel)
            .attr('y', function (d) { return height - 20 - z(d) })
            .text(function (d) { return d })
            .style("font-size", 10)
            .attr('alignment-baseline', 'middle')

        // Legend title
        anothersvg.append("text")
            .attr('x', xCircle)
            .attr("y", height + 15 - 20)
            .text("AQI")
            .attr("text-anchor", "middle")

        // Add one dot in the legend for each name.
        var size = 15
        var allgroups = ['PM25', 'PM10', 'O3', 'NO2', 'SO2', 'CO']
        anothersvg.selectAll("myrect")
            .data(allgroups)
            .enter()
            .append("circle")
            .attr("cx", -20)
            .attr("cy", function (d, i) { return 30 + i * (size) }) // 100 is where the first dot appears. 25 is the distance between dots
            .attr("r", 4)
            .style("fill", function (d) { return Color(d) })
            .on("mouseover", highlight)
            .on("mouseleave", noHighlight)

        // Add labels beside legend dots
        anothersvg.selectAll("mylabels")
            .data(allgroups)
            .enter()
            .append("text")
            .style("font-size", "10px")
            .attr("x",-20 + size * .4)
            .attr("y", function (d, i) { return 20 + i * (size) + (size / 2) + 3 }) // 100 is where the first dot appears. 25 is the distance between dots
            .style("fill", function (d) { return Color(d) })
            .text(function (d) { return d })
            .attr("text-anchor", "left")
            .style("alignment-baseline", "middle")
            .on("mouseover", highlight)
            .on("mouseleave", noHighlight)


    })
}

if (type == "psfc") {
    var margin = { top: 30, right: 5, bottom: 30, left: 35 },
        width = 370 - margin.left - margin.right,
        height = 250 - margin.top - margin.bottom;

    // append the svg object to the body of the page
    var Svg = d3.select("#everydayAQI")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    //Read the data
    d3.csv(`static/data/` + year + `/bubble/year/` + city + `.csv`, function (data) {
        // console.log(data)
        var dateParse = d3.timeParse("%Y-%m-%d");
        // Add X axis
        var x = d3.scaleTime()
            .domain(d3.extent(data, function (d) {
                return dateParse(d.Date);
            }))
            .range([0, width]);
        var xAxis = Svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x)
                .tickFormat(d3.timeFormat("%b%d")).ticks(5));

        // Add Y axis
        // console.log(d3.max(data, function (d) { return d.psfc; }))
        var min = d3.min(data, function (d) {
            return +d.psfc;
        })
        var  max = d3.max(data, function (d) {
            return +d.psfc;
        })
        // console.log(data)
        var y = d3.scaleLinear()
            .domain([ min ,max])
            .range([height, 0]);
        Svg.append("g")
            .call(d3.axisLeft(y));

        var z = d3.scaleLinear()
            .domain([0, d3.max(data, function (d) { return d.AQI; })])
            .range([0, 5]);
        var Color = d3.scaleOrdinal()
            .domain(['CO', 'SO2', 'NO2', 'O3', 'PM10', 'PM25'])
            .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

        // Add a clipPath: everything out of this area won't be drawn.
        var clip_bub = Svg.append("defs").append("svg:clipPath")
            .attr("id", "clip_bub")
            .append("svg:rect")
            .attr("width", width)
            .attr("height", height)
            .attr("x", 0)
            .attr("y", 0);

        // Color scale: give me a specie name, I return a color
        // var color = d3.scaleOrdinal()
        //     .domain(["setosa", "versicolor", "virginica"])
        //     .range(["#440154ff", "#21908dff", "#fde725ff"])

        // Add brushing
        var brush = d3.brushX()                 // Add the brush feature using the d3.brush function
            .extent([[0, 0], [width, height]]) // initialise the brush area: start at 0,0 and finishes at width,height: it means I select the whole graph area
            .on("end", updateChart) // Each time the brush selection changes, trigger the 'updateChart' function


        var svg_tool = d3.select("#everydayAQI")
            .append("div")
            .style("opacity", 0)
            .attr("class", "tooltip")
            .style("background-color", "white")
            .style("border", "solid")
            .style("border-width", "1px")
            .style("border-radius", "3px")
            .style("font-size", "8px")
            .style("position", "absolute")


        // -2- Create 3 functions to show / update (when mouse move but stay on same circle) / hide the tooltip
        var showTooltip = function (d) {

            svg_tool
                .style("opacity", 1)
                .html("污染物: " + d.Type + "<br>日期：" + d.Date + "<br>压强：" + Math.floor(d.psfc * 100) / 100 + "<br>AQI: " + Math.floor(d.AQI * 100) / 100)
                .style("left", (d3.mouse(this)[0] + 60) + "px")
                .style("top", (d3.mouse(this)[1] + 60) + "px")
            d3.select(this)
                .style("stroke", "black")
                .style("opacity", 1)
        }
        var moveTooltip = function (d) {
            svg_tool
                .style("left", (d3.mouse(this)[0] + 60) + "px")
                .style("top", (d3.mouse(this)[1] + 60) + "px")
            d3.select(this)
                .style("stroke", "black")
                .style("opacity", 1)
        }
        var hideTooltip = function (d) {
            svg_tool
                .style("opacity", 0)
            d3.select(this)
                .style("stroke", "white")
                .style("opacity", 0.7)
        }

        // Create the scatter variable: where both the circles and the brush take place
        var scatter = Svg.append('g')
            .attr("clip-path", "url(#clip_bub)")

        // Add circles
        scatter
            .append("g")
            .attr("class", "brush")
            .call(brush);
        scatter
            .selectAll("circle")
            .data(data)
            .enter()
            .append("circle")
            .attr("class", function (d) { return "bubbles " + d.Type })
            .attr("cx", function (d) { return x(dateParse(d.Date)); })
            .attr("cy", function (d) { return y(d.psfc); })
            .attr("r", function (d) { return z(d.AQI); })
            .style("fill", function (d) { return Color(d.Type) })
            .style("opacity", 0.7)
            .on("mouseover", showTooltip)
            .on("mousemove", moveTooltip)
            .on("mouseleave", hideTooltip)

        // Add the brushing


        // A function that set idleTimeOut to null
        var idleTimeout
        function idled() { idleTimeout = null; }

        // A function that update the chart for given boundaries
        function updateChart() {

            extent = d3.event.selection

            // If no selection, back to initial coordinate. Otherwise, update X axis domain
            if (!extent) {
                if (!idleTimeout) return idleTimeout = setTimeout(idled, 350); // This allows to wait a little bit
                x.domain(d3.extent(data, function (d) {
                    return dateParse(d.Date);
                }))
            } else {
                x.domain([x.invert(extent[0]), x.invert(extent[1])])
                scatter.select(".brush").call(brush.move, null) // This remove the grey brush area as soon as the selection has been done
            }

            // Update axis and circle position
            xAxis.transition().duration(1000).call(d3.axisBottom(x).tickFormat(d3.timeFormat("%b%d")).ticks(5))
            scatter
                .selectAll("circle")
                .transition().duration(1000)
                .attr("cx", function (d) { return x(dateParse(d.Date)); })
                .attr("cy", function (d) { return y(d.psfc); })

        }




        // ---------------------------//
        //       HIGHLIGHT GROUP      //
        // ---------------------------//

        // What to do when one group is hovered
        var highlight = function (d) {
            // reduce opacity of all groups
            d3.selectAll(".bubbles").style("opacity", .05)
            // expect the one that is hovered
            d3.selectAll("." + d).style("opacity", 0.7)
        }

        // And when it is not hovered anymore
        var noHighlight = function (d) {
            d3.selectAll(".bubbles").style("opacity", 0.7)
        }
// ---------------------------//
        //       LEGEND              //
        // ---------------------------//

        // Add legend: circles
        var valuesToShow = [100, 200, 500]
        var xCircle = -5
        var xLabel = 30
        var anothersvg = d3.select("#everydayAQI")
                            .append("svg")
                            .attr("width", 80)
                            .attr("height", 250)
                            .append("g")
                            .attr("transform",
                                "translate(" + margin.left + "," + margin.top + ")");
        anothersvg
            .selectAll("legend")
            .data(valuesToShow)
            .enter()
            .append("circle")
            .attr("cx", xCircle)
            .attr("cy", function (d) { return height - 20 - z(d) })
            .attr("r", function (d) { return z(d) })
            .style("fill", "none")
            .attr("stroke", "black")

        // Add legend: segments
        anothersvg
            .selectAll("legend")
            .data(valuesToShow)
            .enter()
            .append("line")
            .attr('x1', function (d) { return xCircle + z(d) })
            .attr('x2', xLabel)
            .attr('y1', function (d) { return height - 20 - z(d) })
            .attr('y2', function (d) { return height - 20 - z(d) })
            .attr('stroke', 'black')
            .style('stroke-dasharray', ('2,2'))

        // Add legend: labels
        anothersvg
            .selectAll("legend")
            .data(valuesToShow)
            .enter()
            .append("text")
            .attr('x', xLabel)
            .attr('y', function (d) { return height - 20 - z(d) })
            .text(function (d) { return d })
            .style("font-size", 10)
            .attr('alignment-baseline', 'middle')

        // Legend title
        anothersvg.append("text")
            .attr('x', xCircle)
            .attr("y", height + 15 - 20)
            .text("AQI")
            .attr("text-anchor", "middle")

        // Add one dot in the legend for each name.
        var size = 15
        var allgroups = ['PM25', 'PM10', 'O3', 'NO2', 'SO2', 'CO']
        anothersvg.selectAll("myrect")
            .data(allgroups)
            .enter()
            .append("circle")
            .attr("cx", -20)
            .attr("cy", function (d, i) { return 30 + i * (size) }) // 100 is where the first dot appears. 25 is the distance between dots
            .attr("r", 4)
            .style("fill", function (d) { return Color(d) })
            .on("mouseover", highlight)
            .on("mouseleave", noHighlight)

        // Add labels beside legend dots
        anothersvg.selectAll("mylabels")
            .data(allgroups)
            .enter()
            .append("text")
            .style("font-size", "10px")
            .attr("x",-20 + size * .4)
            .attr("y", function (d, i) { return 20 + i * (size) + (size / 2) + 3 }) // 100 is where the first dot appears. 25 is the distance between dots
            .style("fill", function (d) { return Color(d) })
            .text(function (d) { return d })
            .attr("text-anchor", "left")
            .style("alignment-baseline", "middle")
            .on("mouseover", highlight)
            .on("mouseleave", noHighlight)


    })
}


Svg.append("text")
    .style("font-size", "12px")
    .html("（点击拖动以放大，选取legend以高亮）")
    .attr("transform", "translate(" + (-20) + "," + (-10) + ")");
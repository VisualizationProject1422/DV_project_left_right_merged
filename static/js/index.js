document.onclick = function(e) {
    console.log(e.pageX)
    console.log(e.pageY)
}
// 参数
// layer_time: 表示目前选中的时间粒度  year/month/day
// layer_geo：此刻地图显示在哪一层级。province/city
// choose_geo：一个list，里面存着需要比较的对象  e.g. ['浙江省', '江苏省'] or ['杭州市', '湖州市']
// choose_time: 一个list 选中的时间段 e.g ['2013','2014']
var provinces = document.querySelectorAll('.province')
for (var i = 0; i < provinces.length; i++) {
    provinces[i].addEventListener('click', function() {
        // console.log(this.innerHTML)
        choose_geo.push(this.innerHTML)
        this.style.color = 'red'
    })
}

var times = document.querySelectorAll('.time')
for (var i = 0; i < times.length; i++) {
    times[i].addEventListener('click', function() {
        // console.log(this.innerHTML)
        choose_time.push(this.innerHTML)
        this.style.color = 'red'
    })
}

// part1 rank
// 啥都不选的时候(无论是中国地图还是省级地图) rank图默认比较 新出台的七大地理分区规划
// 只能在同一层级上做rank（省之间rank、市之间rank）
var doc_rank = document.getElementById('rank')
const width_rank = getComputedStyle(doc_rank, null)['width'].slice(0, -2);
const height_rank = getComputedStyle(doc_rank, null)['height'].slice(0, -2);
const margin_rank = { top: 5, right: 30, bottom: 2, left: 40 };
const innerWidth_rank = width_rank - margin_rank.left - margin_rank.right;
const innerHeight_rank = height_rank - margin_rank.top - margin_rank.bottom;
// rank的render函数
const render_rank = function (data, obj) {
    // Linear Scale: Data Space -> Screen Space;
    const g = rank.append('g')
                .attr('transform', `translate(${margin_rank.left}, ${margin_rank.top})`);
    const xScale = d3.scaleLinear()
        .domain([0, d3.max(data, (datum) => {
            return datum.AQI
        })])
        .range([0, innerWidth_rank]);

    // Introducing y-Scale; 
    const yScale = d3.scaleBand()
        .domain(data.map((datum) => {
            // console.log(datum)
            // console.log(datum[obj])
            return datum[obj]
        }))
        .range([0, innerHeight_rank])
        .padding(0.2)
    // y-axis
    const y_axis = d3.axisLeft(yScale) 
    // Adding axis
    g.append('g').call(y_axis);
    
    // 添加柱形
    g.selectAll('.rank_rect')
        .data(data).enter()
        .append('rect')
        .attr('class', 'rank_rect')
        .attr('id', datum => 'rank_rect' + data.indexOf(datum))
        .attr('y', datum => yScale(datum[obj]) )
        
        .attr('height', yScale.bandwidth())
        .attr('AQI_level', datum => AQI_level(datum['AQI']))
        .attr('fill', function() {
            var AQI_level = d3.select(this).attr('AQI_level')
            return AQI_level_color[ +(AQI_level) ]
        })
        .attr('location', datum => datum[obj] )
        .attr('AQI', datum => datum['AQI'] )
        .attr('rx', 10)
        .on("mousemove", function(d) {
            d3.select(this)
                .style('stroke', 'black')
                .style('stroke-width', 2)
            var buffer = this.getAttribute('id')
            buffer = buffer.substring(buffer.length - 1)
            d3.select(`#rank_text${buffer}`)
                .style('opacity', 1)
            tooltip.html( d[obj] + "<br>"
                        + "AQI: " + parseInt(d.AQI) + "<br>"
                        + "AQI_level: " + AQI_level_rule[d3.select(this).attr('AQI_level')]
                        )
                .style('opacity', 1)
                .style("top", (event.pageY) + "px")
                .style("left", (event.pageX + 5) + "px")
        })
        .on("mouseout", function() {
            d3.select(this)
                .style('stroke', 'none')
            var buffer = this.getAttribute('id')
            buffer = buffer.substring(buffer.length - 1)
            d3.select(`#rank_text${buffer}`)
                .style('opacity', 0)
            tooltip.style('opacity', 0)
        })
    g.selectAll('.rank_rect')
        .transition()
        .delay(function(d, i) {
            return i*300
        })
        .duration(2000)
        .attr('width', function(datum) {
            return xScale(datum['AQI'])
        })
    // 添加数值
    g.selectAll('.rank_text')
        .data(data).enter()
        .append('text')
        .attr('class', 'rank_text')
        .attr('id', datum => 'rank_text' + data.indexOf(datum))
        .attr('x', datum => xScale(datum['AQI']) + 5)
        .attr('y', datum => yScale(datum[obj]) + yScale.bandwidth()/2 + 10/2)
        .text(datum => parseInt(datum['AQI']))
        .style('opacity', 0)
        .style('font-size', 14)
    
}


// part2 stack
// 啥都不选的时候(无论是中国地图还是省级地图) stack图默认比较 新出台的七大地理分区规划
// 只能在同一层级上做stack
// 需要传入的参数 与part1共享参数
var doc_stack = document.getElementById('stack')
const width_stack = getComputedStyle(doc_stack, null)['width'].slice(0, -2);
const height_stack = getComputedStyle(doc_stack, null)['height'].slice(0, -2);
const margin_stack = { top: 15, right: 2, bottom: 20, left: 4 };
const innerWidth_stack = width_stack - margin_stack.left - margin_stack.right;
const innerHeight_stack = height_stack - margin_stack.top - margin_stack.bottom;
// stack的render函数
const render_stack = function (naiveData, naiveStack, naiveKeys, search_obj, max_value) {
    console.log(naiveKeys)
    const color = d3.scaleOrdinal()
                    .domain(naiveKeys)
                    .range(IAQI_color)
    // 画legend
    var stackLegendG = stack.selectAll('legendG')
                            .data(naiveKeys).enter()
                            .append('g')
                            .attr('class', 'legendG')
                            .attr('id', datum => `legendG${naiveKeys.indexOf(datum)}`)
                            .style('text-align', 'center')
                            .attr('opacity', 0)
                            .on('mouseover', function(d, i) {
                                d3.selectAll('.stack_group')
                                    .style('opacity', 0.4)
                                d3.selectAll('.legendG')
                                    .style('opacity', 0.4)

                                d3.select(this)
                                    .style('opacity', 1)
                                d3.select(`#stack_group${i}`)
                                    .style('opacity', 1)

                                d3.select(`#stack_group${i}`).selectAll('.stack_rect')
                                    .style('stroke-width', 1)
                                    .style('stroke', 'black')
                                d3.select(`#stack_group${i}`).selectAll('.stack_text')
                                    .style('opacity', 1)
                            })
                            .on('mouseout', function(d, i) {
                                d3.selectAll('.stack_group')
                                    .style('opacity', 1)
                                d3.selectAll('.legendG')
                                    .style('opacity', 1)
                                d3.selectAll('.stack_rect')
                                    .style('stroke', 'none')
                                d3.selectAll('.stack_text')
                                    .style('opacity', 0)
                            })
    stackLegendG.append('circle')
                .attr("cx", 5)
                .attr("cy", function (d, i) { return 20 + (5-i) * 22 })
                .attr('r', 5)
                .style("fill", function (d) { return color(d) })
    stackLegendG.append('text')
        .attr("x", 12)
        .attr("y", function(d, i) {
            return -96 + (5-i)*22
        })
        .attr('dy', '12em')
        .text(function(d, i) {
            return naiveKeys[i].slice(0,-5)
        })
        .style('font-size', '10px')
        .style('text-align', 'center')
        

    // 创建scale
    const xScale = d3.scaleBand()
                    .domain(naiveData.map(d => d[search_obj]))
                    .range([0, innerWidth_stack])
                    .padding(0.5)
    const yScale = d3.scaleLinear()
        .domain([0, d3.max(naiveStack, d => d3.max(d, subd => subd[1]))])
        .range([innerHeight_stack, 0]);

    const g = stack.append('g')
        .attr('transform', `translate(${margin_stack.left+20}, ${margin_stack.top})`);

    // 创建坐标轴
    const xAxis = d3.axisBottom(xScale)
    const xAxisGroup = g.append('g')
        .attr('id', 'xAxis')
        .call(xAxis)
        .attr('transform', `translate(0, ${innerHeight_stack})`)

    // 添加每一组 
    g.selectAll('.stack_group').data(naiveStack).enter().append('g')
        .attr('class', 'stack_group')
        .attr('id', function(d, i) {
            // console.log(`stack_group${i}`)
            return `stack_group${i}`
        })
        .attr('fill', datum => color(datum.key))
        .on("mouseover", function(d, i) {
            d3.selectAll('.stack_group')
                .style('opacity', 0.4)
            d3.selectAll('.legendG')
                .style('opacity', 0.4)

            d3.select(this)
                .style('opacity', 1)
            d3.select(`#legendG${i}`)
                .style('opacity', 1)

            d3.select(this).selectAll('.stack_rect')
                .style('stroke-width', 1)
                .style('stroke', 'black')
            d3.select(this).selectAll('.stack_text')
                .style('opacity', 1)
        })
        .on("mouseout", function() {
            d3.selectAll('.stack_group')
                .style('opacity', 1)
            d3.selectAll('.legendG')
                .style('opacity', 1)
            d3.select(this).selectAll('.stack_rect')
                .style('stroke', 'none')
            d3.select(this).selectAll('.stack_text')
                .style('opacity', 0)
        })
        .style('opacity', 0)
        // 为每一组添加柱形
        .selectAll('.stack_rect').data(datum => datum).enter().append('rect')
            .attr('class', 'stack_rect')
            .attr('y', datum => yScale(datum[1]))
            .attr('x', datum => xScale(datum.data[search_obj]))
            .attr('ry', 5)
            .attr('height', datum => yScale(datum[0]) - yScale(datum[1]))
            .attr('width', xScale.bandwidth())
    
    // 为每一组添加数值
    g.selectAll('.stack_group').selectAll('.stack_text')
        .data(datum => datum).enter().append('text')
        .attr('class', 'stack_text')
        .attr('x', datum => xScale(datum.data[search_obj]) + 2 )
        .attr('y', datum => yScale(datum[1]) + 10)
        .text(function(datum) {
            return parseInt((datum[1] - datum[0])/max_value * 100) + '%'
        })
        .style('font-size', 10)
        .style('fill', 'white')
        .style('opacity', 0)
    
    // 延迟动效
    stack.selectAll('.stack_group')
            .transition()
            .delay(function (d, i) { 
                return i*300
            })
            .duration(1000)
            .style("opacity", 1)
    stack.selectAll('.legendG')
            .transition()
            .delay(function(d, i) { return i * 300})
            .duration(1000)
            .style("opacity", 1)

    d3.selectAll('.tick text').attr('font-size', '1em');
}



// part3 scatter
// 显示在不同时间段下，中国所有城市的污染类型聚集情况。
// 参数: layer_time choose_time
var doc_scatter = document.getElementById('scatter')
const width_scatter = getComputedStyle(doc_scatter, null)['width'].slice(0, -2);
const height_scatter = getComputedStyle(doc_scatter, null)['height'].slice(0, -2);
const margin_scatter = { top: 15, right: 15, bottom: 20, left: 30 };
const innerWidth_scatter = width_scatter - margin_scatter.left - margin_scatter.right;
const innerHeight_scatter = height_scatter - margin_scatter.top - margin_scatter.bottom;

// const legend_color = {
//     '标准型':"AntiqueWhite", 
//     '偏工业型':"LightPink", 
//     '偏烟花型':"Red", 
//     '偏交通型':"orange",
//     '偏沙尘型':"gold",
//     '偏燃煤型':"green",
//     '偏二次型':"skyblue",
//     '其他型':"LightSteelBlue"};
// scatter的render函数
const render_scatter = function(city_tsne_data) {
    // console.log(city_tsne_data)
    console.log(choose_geo)
    const maingroup = scatter.append('g')
        .attr("id", "tsneMainGroup")
        .attr("transform", `translate(${margin_scatter.left}, ${margin_scatter.top})`)

    // x-axis
    const xScale = d3.scaleLinear()
        // .domain(d3.extent(data, d => d.x))
        .domain([0, 0])
        .range([0, innerWidth_scatter]);
    maingroup.append("g")
        .attr('class', 'xScaleGroup')
        .attr("transform", `translate(${0}, ${innerHeight_scatter})`)
        // .call(d3.axisBottom(xScale).tickSize(-innerHeight_scatter))
        .style('opacity', 0)

    // y-axis
    var yScale = d3.scaleLinear()
        .domain(d3.extent(city_tsne_data, d => d.y))
        .range([innerHeight_scatter, 0]);
    maingroup.append("g")
        .attr('class', 'ySacleGroup')
        .call(d3.axisLeft(yScale).tickSize(-innerWidth_scatter));

    // Set the zoom and Pan features: how much you can zoom, on which part, and what to do when there is a zoom
    var zoom = d3.zoom()
    .scaleExtent([0.5, 20])  // This control how much you can unzoom and zoom
    .extent([[0, 0], [innerWidth_scatter, innerHeight_scatter]])
    .on("zoom", updateChart);

    // This add an invisible rect on top of the chart area. This rect can recover pointer events: necessary to understand when the user zoom
    maingroup.append("rect")
        .attr('class', 'zoomArea')
        .attr("width", innerWidth_scatter)
        .attr("height", innerHeight_scatter)
        .style("fill", "none")
        .style("pointer-events", "all")
        // .attr('transform', 'translate(' + margin_scatter.left + ',' + margin_scatter.top + ')')
        .call(zoom)
        .on('mouseover', function() {
            d3.select(this).style('cursor', 'move')
        })
    // now the user can zoom and it will trigger the function called updateChart
    
    // Add a clipPath: everything out of this area won't be drawn.
    var clip = maingroup.append("defs").append("maingroup:clipPath")
        .attr("id", "clip")
        .append("maingroup:rect")
            .attr("width", innerWidth_scatter)
            .attr("height", innerHeight_scatter)
            .attr("x", 0)
            .attr("y", 0);

    // Create the scatter variable: where both the circles and the brush take place
    var scatter_dots = maingroup.append('g')
        .attr("clip-path", "url(#clip)")
    
    // city_tsne_data.forEach(item => {
    //     console.log(item.city)
    //     console.log(choose_geo)
    //     if (item.city in choose_geo) {
    //         console.log('enter')
    //         console.log(item)
    //     }
    // })
    var rect_point = []
    var circle_point = []
    choose_geo.forEach(choose_city_name => {
        var item_tsne_data = city_tsne_data.find(item => item.city == choose_city_name)
        rect_point.push(item_tsne_data)
    })

    circle_point = city_tsne_data.filter(function (val) { return rect_point.indexOf(val) === -1 })
    console.log(rect_point)
    console.log(circle_point)
    
    // add choose_city's circles
    if (layer_geo == 'city') {
        scatter_dots.selectAll('rect')
            .data(rect_point).enter()
            .append('rect')
                .attr('class', d => `rect cityType${d.gmm_label}`)
                .attr('id', d => d.city)
                .attr("x", d => xScale(d.x))
                .attr("y", d => yScale(d.y))
                .attr("width", 14)
                .attr('height', 14)
                .attr("fill", d => polluteColorScale(d['gmm_label']))
                .attr("fill-opacity", 0.8)
                .attr('stroke', 'black')
                .attr('stroke-width', 0.5)
                .on("mousemove", function (d, i) {
                    tooltip.html("pollute_group: " + d.gmm_label + "<br>" + "city: " + d.city)
                            .style('opacity', 1)
                            .style("top", (event.pageY) + "px")
                            .style("left", (event.pageX + 5) + "px")
                    // d3.selectAll('.dot')
                    //     .style('opacity', 0.2)
                    // d3.selectAll(`.cityType${d.gmm_label}`)
                    //     .attr('r', 4.5)
                    //     .style('opacity', 0.8)
                    //     .attr('stroke', 'black')
                    //     .attr('stroke-width', 0.1)
                })
                .on("mouseout", function (d, i) {
                    tooltip.style('opacity', 0)
                    // d3.selectAll('.dot')
                    //     .attr('r', 2.5)
                    //     .style('opacity', 0.8)
                    //     .attr('stroke', 'none')
                });
    } else {
        circle_point = city_tsne_data
    }
    // Add other circles
    scatter_dots.selectAll("circle")
                    .data(circle_point).enter()
                    .append("circle")
                        .attr('class', d => `dot cityType${d.gmm_label}`)
                        .attr('id', d => d.city)
                        .attr("cx", d => xScale(d.x))
                        .attr("cy", d => yScale(d.y))
                        .attr("r", 2.5)
                        .attr("fill", d => polluteColorScale(d['gmm_label']))
                        .attr("fill-opacity", 0.8)
                        .on("mousemove", function (d, i) {
                            tooltip.html("pollute_group: " + d.gmm_label + "<br>" + "city: " + d.city)
                                    .style('opacity', 1)
                                    .style("top", (event.pageY) + "px")
                                    .style("left", (event.pageX + 5) + "px")
                            d3.selectAll('.dot')
                                .style('opacity', 0.2)
                            d3.selectAll(`.cityType${d.gmm_label}`)
                                .attr('r', 4.5)
                                .style('opacity', 0.8)
                                .attr('stroke', 'black')
                                .attr('stroke-width', 0.1)
                        })
                        .on("mouseout", function (d, i) {
                            tooltip.style('opacity', 0)
                            d3.selectAll('.dot')
                                .attr('r', 2.5)
                                .style('opacity', 0.8)
                                .attr('stroke', 'none')
                        });

    // new X axis
    xScale.domain(d3.extent(city_tsne_data, d => d.x))
    maingroup.select(".xScaleGroup")
        .transition()
        .duration(2000)
        .style("opacity", "1")
        .call(d3.axisBottom(xScale).tickSize(-innerHeight_scatter))
    // 点的动效
    maingroup.selectAll(".dot")
        .transition()
        .delay(function (d, i) { return (i * 3) })
        .duration(2000)
        .attr("cx", d => xScale(d.x))
        .attr("cy", d => yScale(d.y))
    maingroup.selectAll(".rect")
        .transition()
        .delay(function (d, i) { return (i * 3) })
        .duration(2000)
        .attr("x", d => xScale(d.x))
        .attr("y", d => yScale(d.y))
    // A function that updates the chart when the user zoom and thus new boundaries are available
    function updateChart() {
        // recover the new scale
        var newXScale = d3.event.transform.rescaleX(xScale);
        var newYScale = d3.event.transform.rescaleY(yScale);

        // update axes with these new boundaries
        d3.select('.xSacleGroup').call(d3.axisBottom(newXScale).tickSize(-innerHeight_scatter))
        d3.select('.ySacleGroup').call(d3.axisLeft(newYScale).tickSize(-innerWidth_scatter))

        // update circle position
        scatter_dots.selectAll(".rect")
            .attr("x", d => newXScale(d.x))
            .attr("y", d => newYScale(d.y))
        scatter_dots.selectAll(".dot")
            .attr("cx", d => newXScale(d.x))
            .attr("cy", d => newYScale(d.y))
        
    }

    d3.selectAll('.tick text').attr('font-size', '1em');
}



// part4 leftMap
// 显示在不同时间段下，中国所有省份的污染类型地理分布。
// 参数: layer_time choose_time
var doc_leftMap = document.getElementById('leftMap')
const width_leftMap = getComputedStyle(doc_leftMap, null)['width'].slice(0, -2);
const height_leftMap = getComputedStyle(doc_leftMap, null)['height'].slice(0, -2);
const margin_leftMap = { top: 15, right: 15, bottom: 20, left: 30 };
const innerWidth_leftMap = width_leftMap - margin_leftMap.left - margin_leftMap.right;
const innerHeight_leftMap = height_leftMap - margin_leftMap.top - margin_leftMap.bottom;

const highlightCities = function(province, province_city_data) {
    // console.log(province)
    if (province.length >= 4 && (province == '内蒙古自治区' || province == '黑龙江省')) {
        province = province.slice(0, 3)
    } else {
        province = province.slice(0, 2)
    }
    // console.log(province)
    var city_list = []
    province_city_data.forEach(item => {
        if (item.Province == province) {
            city_list.push(item['City_Admaster'])
        }
    })
    // console.log(city_list)
    return city_list
}

// leftMap的render函数
const render_leftMap = function(province_tsne_data, province_city_data){
    const naiveGroups = ['group0', 'group1', 'group2', 'group3', 'group4', 'group5', 'group6', 'group7']
    // 画legend
    var leftMapLegendG = leftMap.selectAll('leftMapG')
                            .data(naiveGroups).enter()
                            .append('g')
                            .attr('class', 'leftMapG')
                            .attr('id', datum => `leftMapG${naiveGroups.indexOf(datum)}`)
                            .attr('opacity', 1)
                            .on('mouseover', function(d, i) {
                                d3.selectAll('.leftMapPath')
                                    .style('opacity', 0.4)
                                d3.selectAll('.leftMapG')
                                    .style('opacity', 0.4)

                                d3.select(this)
                                    .style('opacity', 1)
                                // console.log(i)
                                d3.selectAll(`.provinceType${i}`)
                                    .style('opacity', 1)
                                    .style('stroke-width', 1)
                                    .style('stroke', 'black')
                            })
                            .on('mouseout', function(d, i) {
                                d3.selectAll('.leftMapPath')
                                    .style('opacity', 1)
                                    .style('stroke', 'none')
                                d3.selectAll('.leftMapG')
                                    .style('opacity', 1)
                            })
    leftMapLegendG.append('circle')
                .attr("cx", 5)
                .attr("cy", function (d, i) { return 20 + i * 20 })
                .attr('r', 5)
                .style("fill", function (d, i) { return polluteColorScale(i) })
    leftMapLegendG.append('text')
                .attr("x", 12)
                .attr("y", function(d, i) {
                    return -96 + i*20
                })
                .attr('dy', '12em')
                .text(function(d, i) {
                    return naiveGroups[i]
                })
                .style('font-size', '10px')

    //Define default path generator
    var path = d3.geoPath();
    var projection = d3.geoMercator()
        .center([90, 43])
        .scale(200)
        .translate([innerWidth_leftMap / 2, innerHeight_leftMap / 2]);
    var path = d3.geoPath()
        .projection(projection);
                               
    $.getJSON('../static/china.json', function (root) {
        leftMap.selectAll("path")
            .data(root.features).enter()
            .append("path")
            .attr("stroke-width", 1)
            .attr('type', function(d, i){
                var pollute_province = province_tsne_data.find(item => item.province == d.properties.name)
                if (pollute_province) {
                    return pollute_province.gmm_label
                } else {
                    return;
                }
            })
            .attr('class', function(d, i) {
                var pollute_type = d3.select(this).attr('type')
                return `leftMapPath provinceType${pollute_type}`
            })
            .attr("fill", function (d, i) {
                return polluteColorScale(d3.select(this).attr('type'))
            })
            .attr("d", path)   //使用地理路径生成器
            .on('mouseover', function(d) {
                var city_list = highlightCities(d.properties.name, province_city_data)
                console.log(city_list)
                d3.selectAll('.dot')
                    .style('opacity', 0.2)
                city_list.forEach(city_name => {
                    d3.select(`#${city_name}`)
                        .style('opacity', 0.8)
                        .attr('r', 4.5)
                        .attr('stroke', 'black')
                        .attr('stroke-width', 0.1)
                })
            })
            .on("mousemove", function (d, i) {
                var pollute_province = province_tsne_data.find(item => item.province == d.properties.name)
                var pollute_type = d3.select(this).attr('type')
                tooltip.html("pollute_group: " + pollute_type + "<br>" 
                            + "province: " + d.properties.name + '<br>'
                            + 'AQI: ' + parseInt(pollute_province.AQI) + '<br>'
                            + 'PM2.5_IAQI: ' + parseInt(pollute_province['PM2.5_IAQI']) + '<br>'
                            + 'PM10_IAQI: ' + parseInt(pollute_province['PM10_IAQI']) + '<br>'
                            + 'SO2_IAQI: ' + parseInt(pollute_province['SO2_IAQI']) + '<br>'
                            + 'NO2_IAQI: ' + parseInt(pollute_province['NO2_IAQI']) + '<br>'
                            + 'CO_IAQI: ' + parseInt(pollute_province['CO_IAQI']) + '<br>'
                            + 'O3_IAQI: ' + parseInt(pollute_province['O3_IAQI'])
                            )
                        .style('opacity', 1)
                        .style("top", (event.pageY) + "px")
                        .style("left", (event.pageX + 5) + "px")
                
                d3.selectAll('.leftMapPath')
                    .style('opacity', 0.4)
                d3.selectAll('.leftMapG')
                    .style('opacity', 0.4)

                d3.selectAll(`.provinceType${pollute_type}`)
                    .style('opacity', 1)
                    .style('stroke-width', 1)
                    .style('stroke', 'black')
                d3.select(`#leftMapG${pollute_type}`)
                    .style('opacity', 1)
                
            })
            .on("mouseout", function (d, i) {
                tooltip.style('opacity', 0)
                d3.selectAll('.leftMapPath')
                    .style('opacity', 1)
                    .style('stroke', 'none')
                d3.selectAll('.leftMapG')
                    .style('opacity', 1)
                
                d3.selectAll('.dot')
                    .style('opacity', 0.8)
                    .attr('r', 2.5)
                    .attr('stroke', 'none')
            })
            .style('opacity', 0)
        
        // 延迟动效
        leftMap.selectAll('path')
            .transition()
            .delay(function (d, i) { 
                var type = d3.select(this).attr('type')
                if (type) {
                    return +(type) * 300
                } else {
                    return 300
                }
            })
            .duration(1000)
            .style("opacity", 1)
    })
}



// 当按下send按钮时，触发以下函数，开始调用后端数据和算法。
$("#send").click(function () {
    // console.log(choose_time)
    // console.log(choose_geo)
    // layer_time = $("#layer_time_input").val()
    // layer_geo = $("#layer_geo_input").val()
    $('#rank').empty()
    $('#stack').empty()
    $('#scatter').empty()
    $('#leftMap').empty()

    // 发送需求
    $.ajax({
        url: "http://127.0.0.1:5000/receive",
        type: "GET",
        data: {
            layer_time: layer_time,
            layer_geo: layer_geo,
            choose_time: JSON.stringify(choose_time),
            choose_geo: JSON.stringify(choose_geo)
        },
        success: function (data) {
            alert(data)
        },
        error: function () {
            alert("接收失败")
        }
    })

    // rank stack 统一进行 发送 && 接收; 再分别进行 处理 && 渲染
    // chart1 2 接收处理好的数据 && 处理 && 渲染
    $.getJSON("http://127.0.0.1:5000/extraction", function (extraction_data) {
        console.log('前端extraction接收到的数据data', extraction_data)
        console.log("前端extraction接收到的数据的类型：" + typeof (extraction_data))
        // chart1: rank  需要的 已经有了
        // processLongName(extraction_data, layer_geo)
        render_rank(extraction_data, layer_geo)

        // chart2: stack  对stack需要进一步处理
        // console.log(extraction_data[0], typeof(extraction_data[0]))
        const naiveKeys = ['PM2.5_IAQI', 'PM10_IAQI', 'SO2_IAQI', 'NO2_IAQI', 'CO_IAQI', 'O3_IAQI']
        var my_Stack = d3.stack()
            .keys(naiveKeys)
            .order(d3.stackOrderNone);
        var naiveStack = my_Stack(extraction_data);
        const last_IAQI = naiveStack[naiveStack.length - 1]
        const max_value = d3.max(last_IAQI, datum => datum[1])
        const IAQI_sum = []
        last_IAQI.forEach(every_province => {
            IAQI_sum.push(every_province[1])
        })
        for (var day = 0; day < extraction_data.length; day++) {
            naiveStack.forEach(every_IAQI => {
                IAQI_height = every_IAQI[day][1] - every_IAQI[day][0]
                start = every_IAQI[day][0] / IAQI_sum[day] * max_value
                IAQI_height_per = IAQI_height / IAQI_sum[day] * max_value
                end = start + IAQI_height_per
                every_IAQI[day][0] = start
                every_IAQI[day][1] = end
            })
        }
        render_stack(extraction_data, naiveStack, naiveKeys, layer_geo, max_value)        
    })

    // chart3: scatter 显示在不同时间段下，中国所有城市的污染类型聚集情况。
    // 参数：layer_time choose_time
    $.getJSON("http://127.0.0.1:5000/scatter", function(scatter_data) {
        console.log('前端scatter接收到的数据data', scatter_data)
        // console.log("前端scatter接收到的数据的类型：" + typeof (scatter_data))
        render_scatter(scatter_data)
    })

    // chart4: leftMap 显示在不同时间段下，中国所有省份的污染类型地理分布。
    // 参数：layer_time choose_time
    $.getJSON("http://127.0.0.1:5000/leftMap", function(leftMap_data) {
        console.log('前端leftMap接收到的数据data', leftMap_data)    
        // console.log("前端leftMap接收到的数据的类型：" + typeof (leftMap_data))
        $.getJSON("http://127.0.0.1:5000/readProvinceCity", function(province_city_data) {
            console.log('前端readProvinceCity接收到的数据data', province_city_data)
            render_leftMap(leftMap_data, province_city_data)
        })
    })

    

})





// @TODO: YOUR CODE HERE!
//SVG dimensions are determined by current width and height of the browser window
var svgWidth = 1200
var svgHeight = 600;

var margin = {
    top: 50,
    right: 50,
    bottom: 50,
    left: 50
};

var height = svgHeight - margin.top - margin.bottom;
var width = svgWidth - margin.left - margin.right;

//create an SVG wrapper, append an SVG group that will hold our chart, and shift the latter by left and top margins.
var svg = d3.select("#scatter")
    .append("svg")
    .attr("height", svgHeight)
    .attr("width", svgWidth);

var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

//import data from csv file
d3.csv("assets/data/data.csv").then((healthData) => {
    console.log(healthData)
    //Step 1 is to parse our data as numbers
    healthData.forEach((state) => {
        state.poverty = parseFloat(state.poverty);
        state.healthcare = parseFloat(state.healthcare);
        state.obesity = parseFloat(state.obesity);
        state.smokes = parseFloat(state.smokes);
    });

    //Step 2 is we need to create scale functions
    var xScale = d3.scaleLinear()
        // .domain([8, d3.max(healthData, d => d.poverty)])
        //d3.extent returns an array containing the min and max for the property specified
        .domain(d3.extent(healthData, d => d.poverty))
        .range([0, width]);
    var yScale = d3.scaleLinear()
        .domain([0, d3.max(healthData, d => d.healthcare)])
        .range([height, 0]);
    
    //Step 3 is to create axis functions
    var bottomAxis = d3.axisBottom(xScale);
    var leftAxis = d3.axisLeft(yScale)

    //Step is to append our axes to the chart
    chartGroup.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);
    chartGroup.append('g')
        .call(leftAxis);

    //Create our circles
    var circlesGroup = chartGroup.selectAll("circle")
    .data(healthData)
    .enter()
    .append("circle")
    .attr("cx", d => xScale(d.poverty))
    .attr("cy", d => yScale(d.healthcare))
    .attr("r", "10")
    .attr("fill", "green")
    .attr("opacity", ".5");

    //create a separte variable to do labels
    var circleText = chartGroup.selectAll()
    .data(healthData)
    .enter()
    .append("text")
    .attr("x", d => xScale(d.poverty))
    .attr("y", d => yScale(d.healthcare))
    .text(d => {return d.abbr})
    .attr("fill", "black");



    //Initialize our tool tip
    var toolTip = d3.tip()
        .attr("class", "tooltip")
        .offset([80, -60])
        .html((d) => {
            return `${d.state}<br>% Poverty: ${d.poverty}<br>% Healthcare: ${d.healthcare}`
        });
    //create tooltip in our chart
    chartGroup.call(toolTip);

    //create even listeners to display and hide the tool tip
    circlesGroup.on("click", function(data) {
        toolTip.show(data, this);
    })
    //onmouseout event
        .on("mouseout", function(data, index) {
            toolTip.hide(data);
        });


});

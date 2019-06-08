// @TODO: YOUR CODE HERE!
//SVG dimensions are determined by current width and height of the browser window
var svgWidth = 1200
var svgHeight = 600;

var margin = {
    top: 20,
    right: 50,
    bottom: 80,
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

//set a default x-axis
var chosenXAxis = "poverty";

//create a function to update your  x-scale var upon clik on axis label
function xScale(healthData, chosenXAxis) {
    //create scales
    var xLinearScale = d3.scaleLinear()
        .domain(d3.extent(healthData, d => d[chosenXAxis]))
        .range([0,width]);
    return xLinearScale;
};

//function used for updating xAxis var upon click on axis label
function renderAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);

    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);
    return xAxis;
}

//create a function for updating circles group with a transition to new circles
function renderCircles(circlesGroup, newXScale, chosenXAxis) {
    circlesGroup.transition()
        .duration(1000)
        .attr("cx", d => newXScale(d[chosenXAxis]))

    return circlesGroup;
}

//create function used for updating circles group new tooltip
function updateToolTip(chosenXAxis, circlesGroup) {

    if (chosenXAxis === "poverty") {
        var label = "% Poverty";
    }
    else if (chosenXAxis === "age") {
        var label = "Age(Median)";
    }
    else {
        var label = "Household Income(Median)";
    }

    //use our tool tip code created intially within our d3.csv function
    var toolTip = d3.tip()
        .attr("class", "tooltip")
        .offset([80, -60])
        .html((d) => {
            return `${d.state}<br>${label}: ${d[chosenXAxis]}<br>% Healthcare: ${d.healthcare}`
        });
    //create tooltip in our chart
    chartGroup.call(toolTip);

    //create even listeners to display and hide the tool tip
    circlesGroup.on("mouseover", function(data) {
        toolTip.show(data, this);
    })
        //onmouseout event
        .on("mouseout", function(data, index) {
        toolTip.hide(data);
        });
    
    return circlesGroup;
}

//import data from csv file
d3.csv("assets/data/data.csv").then((healthData) => {
    console.log(healthData)
    //Step 1 is to parse our data as numbers
    healthData.forEach((state) => {
        state.poverty = parseFloat(state.poverty);
        state.healthcare = parseFloat(state.healthcare);
        state.obesity = parseFloat(state.obesity);
        state.smokes = parseFloat(state.smokes);
        state.age = parseFloat(state.age);
        state.income = parseFloat(state.income);
    });

    //Step 2 is we need to create scale functions
    // var xScale = d3.scaleLinear()
        // .domain([8, d3.max(healthData, d => d.poverty)])
        //d3.extent returns an array containing the min and max for the property specified
        // .domain(d3.extent(healthData, d => d.poverty))
        // .range([0, width]);
    // using function developed earlier
    var xLinearScale = xScale(healthData,chosenXAxis);
    var yLinearScale = d3.scaleLinear()
        .domain([0, d3.max(healthData, d => d.healthcare)])
        .range([height, 0]);
    
    //Step 3 is to create axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale)

    //Step is to append our axes to the chart
    //created a xAxis to be called on by our function
    var xAxis = chartGroup.append("g")
        .classed("x-axis",true)
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);
    
    //append y axis
    chartGroup.append('g')
        .call(leftAxis);

    //Create our circles
    var circlesGroup = chartGroup.selectAll("circle")
        .data(healthData)
        .enter()
        .append("circle")
        // .attr("cx", d => xLinearScale(d.poverty))
        //using our initial param to begin making more dynamic
        .attr("cx", d => xLinearScale(d[chosenXAxis]))
        .attr("cy", d => yLinearScale(d.healthcare))
        .attr("r", "10")
        .attr("fill", "green")
        .attr("opacity", ".5");

    //create a separte variable to do labels
    //why doesn't selectAll('text') not work
    var circleText = chartGroup.selectAll()
    .attr("class","circleLabel")
    .data(healthData)
    .enter()
    .append("text")
    // .attr("x", d => xLinearScale(d.poverty))
    .attr("x", d => xLinearScale(d[chosenXAxis]))
    .attr("y", d => yLinearScale(d.healthcare))
    .text(d => {return d.abbr})
    .attr("text-anchor", "middle")
    .attr("font-size","8px")
    .attr("font-weight", "bold")
    .attr("fill", "black");



    //Initialize our tool tip
    // var toolTip = d3.tip()
    //     .attr("class", "tooltip")
    //     .offset([80, -60])
    //     .html((d) => {
    //         return `${d.state}<br>% Poverty: ${d.poverty}<br>% Healthcare: ${d.healthcare}`
    //     });
    //create tooltip in our chart
    // chartGroup.call(toolTip);

    //create even listeners to display and hide the tool tip
    // circlesGroup.on("mouseover", function(data) {
    //     toolTip.show(data, this);
    // })
    //onmouseout event
        // .on("mouseout", function(data, index) {
        //     toolTip.hide(data);
        // });
    
    // use the updateToolTip function we made above
    var circlesGroup = updateToolTip(chosenXAxis,circlesGroup);
    
    //create our axes labels(y-axis)
    chartGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .attr("class", "axisText")
        .text("Lacks Healthcare (%)");

    //create a group for multiple x-axis
    var xlabelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${width / 2}, ${height + (margin.top) + 15})`);
    
    // label for poverty %
    var povertyLabel = xlabelsGroup.append("text")
        .attr("class", "axisText")
        .attr("value", "poverty") //value to grab for event listener
        .classed("active",true)
        .text("In Poverty (%)");
    //label for median age
    var ageLabel = xlabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("class", "axisText")
        .attr("value", "age") //value to grab for event listener
        .classed("inactive", true)
        .text("Age(Median)")

    //label for household median income age
    var incomeLabel = xlabelsGroup.append("text")
       .attr("x", 0)
       .attr("y", 40)
       .attr("class", "axisText")
       .attr("value","income") //value to grab for event listener
       .classed("inactive",true)
       .text("Household Income(Median)")

    //create an x axis labels event listener
    xlabelsGroup.selectAll("text")
        .on("click", function() {
            //get value of selection
            var value = d3.select(this).attr("value");
            if (value !== chosenXAxis) {

                // replace chosenXAxis with our new value
                chosenXAxis = value;
                console.log(chosenXAxis)

                //call on xScale function again
                xLinearScale = xScale(healthData, chosenXAxis);

                //update x axis with transition by calling renderAxes function 
                xAxis = renderAxes(xLinearScale,xAxis);

                //Update circles with new x values by calling renderCircles function
                circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);

                //updates tooltips with new info, call our updateToolTip function
                circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

                //changes classes to change bold text
                if (chosenXAxis === "poverty") {
                    povertyLabel
                        .classed("active",true)
                        .classed("inactive",false);
                    ageLabel
                        .classed("active",false)
                        .classed("inactive",true);
                    incomeLabel
                        .classed("active",false)
                        .classed("inactive",true);   
                }
                else if (chosenXAxis === "age") {
                    povertyLabel
                        .classed("active",false)
                        .classed("inactive",true);
                    ageLabel
                        .classed("active",true)
                        .classed("inactive",false);
                    incomeLabel
                        .classed("active",false)
                        .classed("inactive",true);   
                }
                else {
                    povertyLabel
                        .classed("active",false)
                        .classed("inactive",true);
                    ageLabel
                        .classed("active",false)
                        .classed("inactive",true);
                    incomeLabel
                        .classed("active",true)
                        .classed("inactive",false); 
                }
            }

        })


});

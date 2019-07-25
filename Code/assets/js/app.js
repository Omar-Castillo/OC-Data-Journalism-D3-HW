// @TODO: YOUR CODE HERE!
//SVG dimensions are determined by current width and height of the browser window
var svgWidth = 1200
var svgHeight = 600;

var margin = {
    top: 20,
    right: 50,
    bottom: 80,
    left: 90
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
//set a default y-axis
var chosenYAxis = "healthcare"

//create a function to update your  x-scale and y-scale var upon clik on axis label
function xScale(healthData, chosenXAxis) {
    //create scales
    var xLinearScale = d3.scaleLinear()
        //used a percentage to adjust the xscale
        .domain(d3.extent(healthData, d => d[chosenXAxis]))
        .range([0,width]);

    return xLinearScale;
};

//create a function to update your  x-scale and y-scale var upon clik on axis label
function yScale(healthData, chosenYAxis) {
    //create scales
    var yLinearScale = d3.scaleLinear()
        .domain([0, d3.max(healthData, d => d[chosenYAxis])])
        .range([height, 0]);

    return yLinearScale;
};


//function used for updating xAxis var upon click on axis label
function renderXAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);

    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);
    return xAxis;
}

//function used for updating yAxis var upon click on axis label
function renderYAxes(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);

    yAxis.transition()
        .duration(1000)
        .call(leftAxis);
    return yAxis;
}

//create a function for updating circles group with a transition to new circles
function renderCircles(circlesGroup, newXScale, newYScale, chosenXAxis, chosenYAxis) {
    circlesGroup.transition()
        .duration(1000)
        .attr("cx", d => newXScale(d[chosenXAxis]))
        .attr("cy", d => newYScale(d[chosenYAxis]))

    return circlesGroup;
}

//create a function for updating the state labels
function updateCircleLabels(circleText, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis) {
    circleText.transition()
        .duration(1000)
        .attr("x", d => xLinearScale(d[chosenXAxis]))
        .attr("y", d => yLinearScale(d[chosenYAxis]))
        //test our function
        console.log("testing if function runs")


    return circleText;
}

//create function used for updating circles group new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {
    //run an if statement for x-axis
    if (chosenXAxis === "poverty") {
        var xlabel = "% Poverty";
    }
    else if (chosenXAxis === "age") {
        var xlabel = "Age(Median)";
    }
    else {
        var xlabel = "Household Income(Median)";
    }

    //run an if statement for the y-axis
    if (chosenYAxis === "healthcare") {
        var ylabel = "Lacks Healthcare(%)";
    }
    else if (chosenYAxis === "obesity") {
        var ylabel = "Obese(%)";
    }
    else {
        var ylabel = "Smokes(%)";
    }

    //use our tool tip code created intially within our d3.csv function
    var toolTip = d3.tip()
        .attr("class", "tooltip")
        .offset([80, -60])
        .html((d) => {
            return `${d.state}<br>${xlabel}: ${d[chosenXAxis]}<br>${ylabel}: ${d[chosenYAxis]}`
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
    var yLinearScale = yScale(healthData,chosenYAxis);
    // var yLinearScale = d3.scaleLinear()
    //     .domain([0, d3.max(healthData, d => d.healthcare)])
    //     .range([height, 0]);
    
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
   var yAxis = chartGroup.append('g')
        .call(leftAxis);

    //Create our circles
    var circlesGroup = chartGroup.selectAll("circle")
        .data(healthData)
        .enter()
        .append("circle")
        // .attr("cx", d => xLinearScale(d.poverty))
        //using our initial param to begin making more dynamic
        .attr("cx", d => xLinearScale(d[chosenXAxis]))
        .attr("cy", d => yLinearScale(d[chosenYAxis]))
        .attr("r", "10")
        .attr("fill", "#60EFDB")
        .attr("opacity", ".8");

    //create a separte variable to do labels
    //why doesn't selectAll('text') not work
    var circleText = chartGroup.selectAll("#statelabel")
        .attr("class","circleLabel")
        .data(healthData)
        .enter()
        .append("text")
        .attr("id","statelabel")
        // .attr("x", d => xLinearScale(d.poverty))
        .attr("x", d => xLinearScale(d[chosenXAxis]))
        .attr("y", d => yLinearScale(d[chosenYAxis]))
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
    var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

    //create a group for multiple y-axis
    var ylabelsGroup = chartGroup.append("g")
        .attr("transform", "rotate(-90)");
    
    //create label for healthcare % 
    var healthcareLabel = ylabelsGroup.append("text")
        .attr("y", 0 - margin.left + 40)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .attr("class", "axisText")
        .attr("value", "healthcare")
        .classed("active", true)
        .text("Lacks Healthcare (%)");

    //label for smoking
    var smokesLabel = ylabelsGroup.append("text")
        .attr("y", 0 - margin.left + 20)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .attr("class", "axisText")
        .attr("value", "smokes")
        .classed("inactive", true)
        .text("Smokes (%)");

    //label for obese
    var obeseLabel = ylabelsGroup.append("text")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .attr("class", "axisText")
        .attr("value", "obesity") //value to grab for event listenr
        .classed("inactive",true)
        .text("Obese (%)");
    
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
            var xvalue = d3.select(this).attr("value");
            if (xvalue !== chosenXAxis) {

                // replace chosenXAxis with our new value
                chosenXAxis = xvalue;
                console.log(chosenXAxis)

                //call on xScale function again AND yScale
                xLinearScale = xScale(healthData, chosenXAxis);
                yLinearScale = yScale(healthData, chosenYAxis);

                //update x axis AND y axis with transition by calling renderAxes function 
                xAxis = renderXAxes(xLinearScale,xAxis);
                yAxis = renderYAxes(yLinearScale,yAxis);

                //Update circles with new x values by calling renderCircles function
                circlesGroup = renderCircles(circlesGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);

                //updates tooltips with new info, call our updateToolTip function
                circlesGroup = updateToolTip(chosenXAxis,chosenYAxis, circlesGroup);

                //updates circleTextLabels calling our function
                circleText = updateCircleLabels(circleText, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);

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
    //
    ylabelsGroup.selectAll("text")
        .on("click", function() {
            //get value of selection
            var yvalue = d3.select(this).attr("value");
            if (yvalue !== chosenYAxis) {

                // replace chosenXAxis with our new value
                chosenYAxis = yvalue;
                console.log(chosenYAxis)

                //call on xScale function again AND yScale
                xLinearScale = xScale(healthData, chosenXAxis);
                yLinearScale = yScale(healthData, chosenYAxis);

                //update x axis AND y axis with transition by calling renderAxes function 
                xAxis = renderXAxes(xLinearScale,xAxis);
                yAxis = renderYAxes(yLinearScale,yAxis);

                //Update circles with new x values by calling renderCircles function
                circlesGroup = renderCircles(circlesGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);

                //updates tooltips with new info, call our updateToolTip function
                circlesGroup = updateToolTip(chosenXAxis,chosenYAxis, circlesGroup);

                //updates circleTextLabels calling our function
                circleText = updateCircleLabels(circleText, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);

                //changes classes to change bold text
                if (chosenYAxis === "healthcare") {
                    healthcareLabel
                        .classed("active",true)
                        .classed("inactive",false);
                    smokesLabel
                        .classed("active",false)
                        .classed("inactive",true);
                    obeseLabel
                        .classed("active",false)
                        .classed("inactive",true);   
                }
                else if (chosenYAxis === "smokes") {
                    healthcareLabel
                        .classed("active",false)
                        .classed("inactive",true);
                    smokesLabel
                        .classed("active",true)
                        .classed("inactive",false);
                    obeseLabel
                        .classed("active",false)
                        .classed("inactive",true);   
                }
                else {
                    healthcareLabel
                        .classed("active",false)
                        .classed("inactive",true);
                    smokesLabel
                        .classed("active",false)
                        .classed("inactive",true);
                    obeseLabel
                        .classed("active",true)
                        .classed("inactive",false); 
                }
            }

        })


});

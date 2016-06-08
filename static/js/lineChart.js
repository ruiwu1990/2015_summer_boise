queue()
	.defer(d3.json, "/data")
	.await(makeGraphs);

function makeGraphs(error, projectsJson) {
	//change json into objects arrary
	var NCCPProjects = projectsJson;
	var numElement = 30;
	var snowdownData=new Array(numElement);
	var date=new Array(numElement);

	//tempdata is used to record snowdown and date together as an array of objects
	var tempdata = new Array(numElement);
	for(var i =0; i < numElement ; i++)
	{
		snowdownData[i] = (NCCPProjects[i].snowdown);
		date[i] = (NCCPProjects[i].date);
		tempdata[i] = ({"date":NCCPProjects[i].date,"snowdown":NCCPProjects[i].snowdown});
	}

	// Set the dimensions of the canvas / graph
	var margin = {top: 30, right: 20, bottom: 30, left: 50},
		width = 60*numElement - margin.left - margin.right,
		height = 500 - margin.top - margin.bottom;

	// Parse the date / time
	var parseDate = d3.time.format("%Y-%m-%d").parse;

	// Set the ranges
	var x = d3.time.scale().range([0, width]);
	var y = d3.scale.linear().range([height, 0]);

	// Define the axes
	var xAxis = d3.svg.axis().scale(x)
		.orient("bottom");

	var yAxis = d3.svg.axis().scale(y)
		.orient("left");

	// Define the line
	var valueline = d3.svg.line()
		.x(function(d) { return x(d.date); })
		.y(function(d) { return y(d.snowdown); });
		
	// Adds the svg canvas
	var svg = d3.select("body")
		.append("svg")
		    .attr("width", width + margin.left + margin.right)
		    .attr("height", height + margin.top + margin.bottom)
		.append("g")
		    .attr("transform", 
		          "translate(" + margin.left + "," + margin.top + ")");

	//set up selectBox
	var selectBox= d3.select("body").append("select")
		.attr("class","mySelect")
		.attr("id","mySelectID");

	for(var i =0; i < Math.floor(NCCPProjects.length/numElement) ; i++)
	{
		//selectBox.append("option").text(NCCPProjects[i].date );
		selectBox.append("option").text(NCCPProjects[i * numElement].date + " to " + NCCPProjects[i * numElement + numElement -1].date);
	}

    tempdata.forEach(function(d) {
        d.date = parseDate(d.date);
        d.snowdown = d.snowdown;
    });

    // Scale the range of the data
	x.domain(d3.extent(tempdata, function(d) { return d.date; }));
    //x.domain(date);
    y.domain([0, d3.max(snowdownData)]);

    // Add the valueline path.
    svg.append("path")
        .attr("class", "line")
        .attr("d", valueline(tempdata));

    // Add the X Axis
    svg.append("g")
        .attr("class", "xaxis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    // Add the Y Axis
    svg.append("g")
        .attr("class", "yaxis")
        .call(yAxis)
	.append("text")
	  .attr("transform", "rotate(-90)")
	  .attr("y", 4)
	  .attr("x", -100)
	  .attr("dy", ".41em")
	  .style("text-anchor", "end")
	  .text("Snowdown")
	  .attr("fill", "black");

	var clickCount = 0;
	//On select, update with new data		
	d3.select("select")
		.on("click" , function() {
	
			//New values for dataset
			clickCount = document.getElementById('mySelectID').selectedIndex;
			for(var i =0; i < numElement ; i++)
			{
				snowdownData[i] = (NCCPProjects[i+clickCount*numElement].snowdown);
				date[i] = (NCCPProjects[i+clickCount*numElement].date);
				tempdata[i] = {"date":NCCPProjects[i+clickCount*numElement].date,"snowdown":NCCPProjects[i+clickCount*numElement].snowdown};
			}

			tempdata.forEach(function(d) {
				d.date = parseDate(d.date);
				d.snowdown = d.snowdown;
			});	

		    //update axis
		    //update y axis
		    y.domain([0, d3.max(snowdownData)]);
            svg.select(".yaxis")
                .transition().duration(900).ease("sin-in-out")  // https://github.com/mbostock/d3/wiki/Transitions#wiki-d3_ease
                .call(yAxis); 


			//update x axis
			x.domain(d3.extent(tempdata, function(d) { return d.date; }));
            svg.select(".xaxis")
                .transition().duration(900).ease("sin-in-out")  // https://github.com/mbostock/d3/wiki/Transitions#wiki-d3_ease
                .call(xAxis); 
			

			//Update line		
			svg.selectAll(".line")
			    .transition()
				.attr("d", valueline(tempdata));

			   				
		});


}


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

	var margin = {top: 20, right: 40, bottom: 30, left: 60},
		width = 60*numElement - margin.left - margin.right,
		height = 500 - margin.top - margin.bottom,
		padding = 100;

	var x = d3.scale.ordinal()
		.rangeRoundBands([0, width], .1);

	var y = d3.scale.linear()
		.range([height - padding, padding]);

	var xAxis = d3.svg.axis()
		.scale(x)
		.orient("bottom");

	var yAxis = d3.svg.axis()
		.scale(y)
		.orient("left");

	var svg = d3.select("body").append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
	  .append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	//set up selectBox
	var selectBox= d3.select("body").append("select")
		.attr("class","mySelect")
		.attr("id","mySelectID");
	

	for(var i =0; i < Math.floor(NCCPProjects.length/numElement) ; i++)
	{
		//selectBox.append("option").text(NCCPProjects[i].date );
		selectBox.append("option").text(NCCPProjects[i * numElement].date + " to " + NCCPProjects[i * numElement + numElement -1].date);
	}

	x.domain(date);
	y.domain([0, d3.max(snowdownData)]);

    // draw x axis with labels and move to the bottom of the chart area
    svg.append("g")
        .attr("class", "xaxis")   // give it a class so it can be used to select only xaxis labels  below
        .attr("transform", "translate(0," + (height - padding) + ")")
        .call(xAxis);
        

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
	  .attr("fill", "green");
	//create bar
	svg.selectAll(".bar")
	  .data(tempdata)
	.enter().append("rect")
	  .attr("class", "bar")
	  .attr("x", function(d) { return x(d.date); })
	  .attr("width", x.rangeBand())
	  .attr("y", function(d) { return y(d.snowdown); })
	  .attr("height", function(d) { return height - y(d.snowdown) - padding; })
      .attr("fill", function(d) {
					return "rgb(0, 0, " + Math.floor(d.snowdown-100) + ")";
	  });

	//create bar label
	svg.selectAll(".barText")//.barText means class barText
	   .data(tempdata)
	 .enter().append("text")
	   .attr("class", "barText")
	   .text(function(d) {
	   		return d.snowdown;
	   })
	   .attr("text-anchor", "middle")
	   .attr("x", function(d) { return x(d.date) + x.rangeBand()/2; })
	   .attr("y", function(d) {
	   		return y(d.snowdown) + 14;
	   })
	   .attr("font-family", "sans-serif")
	   .attr("font-size", "11px")
	   .attr("fill", "red");
//	   .attr("transform", "rotate(-90)")

    // now rotate text on x axis
    // solution based on idea here: https://groups.google.com/forum/?fromgroups#!topic/d3-js/heOBPQF3sAY
    // first move the text left so no longer centered on the tick
    // then rotate up to get 45 degrees.
   svg.selectAll(".xaxis text")  // select all the text elements for the xaxis
      .attr("transform", function(d) {
          return "translate(" + this.getBBox().height*-2 + "," + this.getBBox().height + ")rotate(-35)";
    });

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

			    //update axis
			    //update y axis
			    y.domain([0, d3.max(snowdownData)]);
                svg.select(".yaxis")
                    .transition().duration(900).ease("sin-in-out")  // https://github.com/mbostock/d3/wiki/Transitions#wiki-d3_ease
                    .call(yAxis); 
			    //svg.select(".yaxis_label")
                //    .text("Rescaled Axis");

				//update x axis
				x.domain(date);
                svg.select(".xaxis")
                    .transition().duration(900).ease("sin-in-out")  // https://github.com/mbostock/d3/wiki/Transitions#wiki-d3_ease
                    .call(xAxis); 
			    //svg.select(".xaxis_label")
                //    .text("Rescaled Axis");				
	
				//Update all rects
				svg.selectAll(".bar")
				  .data(tempdata)
				  .transition()
				  .attr("y", function(d) { return y(d.snowdown); })
				  .attr("height", function(d) { return height - y(d.snowdown) - padding; })
				  .attr("class", "bar")
				  .attr("fill", function(d) {
								return "rgb(0, 0, " + Math.floor(d.snowdown-100) + ")";
				  });
				//update label
				svg.selectAll(".barText")//.barText means class barText
				   .data(tempdata)
				   .transition()
				   .text(function(d) {
				   		return d.snowdown;
				   })
				   .attr("text-anchor", "middle")
				   .attr("x", function(d) { return x(d.date) + x.rangeBand()/2; })
				   .attr("y", function(d) {
			//	   		return height - y(d.snowdown) - padding + 14;
				   		return y(d.snowdown) + 14;
				   })
				   .attr("font-family", "sans-serif")
				   .attr("font-size", "11px")
				   .attr("fill", "red");

			   svg.selectAll(".xaxis text")  // select all the text elements for the xaxis
				  .attr("transform", function(d) {
					  return "translate(" + this.getBBox().height*-2 + "," + this.getBBox().height + ")rotate(-35)";
				});
				   				
			});

		d3.select("p")
			.on("click" , function() {
				sortBars();
			});

		var sortBars = function(){

				svg.selectAll("rect")
				   .sort(function(a, b) {
				   		return d3.ascending(a.snowdown, b.snowdown);
				   	})
				   .transition()
				   .delay(function(d, i) {
					   return i * 50;
				   })
				   .duration(1000)
				   .attr("x", function(d, i) {
				   		return x(d.date);
				   });

				//update label
				svg.selectAll(".barText")//.barText means class barText
				   .data(tempdata)
				   .transition()
				   .text(function(d) {
				   		return d.snowdown;
				   })
				   .attr("text-anchor", "middle")
				   .attr("x", function(d) { return x(d.date) + x.rangeBand()/2; })
				   .attr("y", function(d) {
				   		return y(d.snowdown) + 14;
				   })
				   .attr("font-family", "sans-serif")
				   .attr("font-size", "11px")
				   .attr("fill", "red");

		};

}


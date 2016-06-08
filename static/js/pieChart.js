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

	var w = 800,
	   h = 800,
	   r = Math.min(w, h) / 2,
	   data = snowdownData,
	   color = d3.scale.category20(),
	   arc = d3.svg.arc().outerRadius(r);

	var arctext = d3.svg.arc()
					.innerRadius(w/2)
					.outerRadius(w/3);

	var pie = d3.layout.pie();

	//Create SVG element
	var svg = d3.select("body")
	 .append("svg")
	   .data([data.sort(d3.descending)])
	   .attr("width", w)
	   .attr("height", h);

	var arcs = svg.selectAll("g.arc")
	   .data(pie(data))
	 .enter().append("g")
	   .attr("class", "arc")
	   .attr("transform", "translate(" + r + "," + r + ")");

	var paths = arcs.append("path")
	   .attr("fill", function(d, i) { return color(i); })
	   .attr("d", arctext);

	paths.transition()
	   .ease("bounce")
	   .duration(2000)
	   .attrTween("d", tweenPie);

	paths.transition()
	   .ease("elastic")
	   .delay(function(d, i) { return 2000 + i * 50; })
	   .duration(750)
	   .attrTween("d", tweenDonut);

	//Labels
	arcs.append("text")
		.attr("class", "arcText")
	    .attr("transform", function(d) {
	    	return "translate(" + arctext.centroid(d) + ")";
	    })
	    .attr("text-anchor", "middle")
		.style("fill-opacity", 1e-6)
	    .text(function(d) {
	    	return d.value;
	    })
		.transition()
		  .duration(3000)
		  .attr("y", 0)
		  .style("fill-opacity", 1);



	function tweenPie(b) {
	 b.innerRadius = 0;
	 var i = d3.interpolate({startAngle: 0, endAngle: 0}, b);
	 return function(t) {
	   return arc(i(t));
	 };
	}

	function tweenDonut(b) {
	 b.innerRadius = r * .6;
	 var i = d3.interpolate({innerRadius: 0}, b);
	 return function(t) {
	   return arc(i(t));
	 };
	}

	var showDate = true;
	//On select, update with new data		
	d3.select("svg")
		.on("click" , function() {

//the transition part does not work, stange
/*
		   svg.selectAll(".arcText")
			.data(pie(data))
			.transition()
			  .duration(750)
			  .attr("x", w/2)
			  .attr("y", h/2)
			  .style("fill-opacity", 1e-6);
*/

			if(showDate)
			{
				data = date;
	
			}
			else
			{
				data = snowdownData;
			}

			//update label
			svg.selectAll(".arcText")//.barText means class barText
			   .data(pie(data))
			   .transition()
			   .duration(1000)
			 //  .style("fill-opacity", 1)
			   .text(function(d) {
			   		return d.data;
			   });


			showDate = !showDate;
		});
	
}


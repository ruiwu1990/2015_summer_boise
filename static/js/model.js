//The data for our line
var lineData_not_interactive 
				 = [ { "x": 100,  "y": 100}, { "x": 100,  "y": 300},
				     { "x": 100,  "y": 300}, { "x": 200,  "y": 400},
                     { "x": 200,  "y": 100}, { "x": 200,  "y": 500}
				   ];

var lineData_interactive_river1 
				 = [
                     { "x": 100,  "y": 200}, { "x": 200,  "y": 300}
				   ];

var lineData_interactive_river2 
				 = [
                  	 { "x": 200,  "y": 350}, { "x": 300, "y": 450}
				   ];
 
//This is the accessor function we talked about above
var lineFunction = d3.svg.line()
                         .x(function(d) { return d.x; })
                         .y(function(d) { return d.y; })
                         .interpolate("linear");

//The SVG Container
var svgContainerWapper = d3.select(".riverParagraph").append("svg")
                                    .attr("width", 600)
                                    .attr("height", 600);
/*
//add lable
var lableName = svgContainerWapper.append("g");
lableName.append("text")
	.attr("x", "90")
	.attr("y", "90")
	.attr("transform", "rotate(90)")
	.text("Webb Creek");

lableName.moveToFront();
*/
var svgContainer = svgContainerWapper.append("g")
						.attr("transform", "translate(10,10)");

//The line SVG Path we draw
var lineGraph_not_interactive = svgContainer.append("path")
                            .attr("d", lineFunction(lineData_not_interactive))
                            .attr("stroke", "black")
                            .attr("stroke-width", 2)
                            .attr("fill", "none");

var myNumber = 255;
var hexString = myNumber.toString(16);
//after this hexString is #ff0000
hexString = "#" + hexString + hexString + "00";

var lineGraph_interactive_river1 = svgContainer.append("path")
                            .attr("d", lineFunction(lineData_interactive_river1))
                            .attr("stroke", hexString)
                            .attr("stroke-width", 2)
                            .attr("fill", "none");

var lineGraph_interactive_river2 = svgContainer.append("path")
                            .attr("d", lineFunction(lineData_interactive_river2))
                            .attr("stroke", "blue")
                            .attr("stroke-width", 2)
                            .attr("fill", "none");

//model input
var airtemp;
var precip;
var elevation;
var areastream;

//when user press this button, the webpage will generate a result of this model
//select class by .
var resultButton = d3.select(".oneResult").append("input")
	.attr("type","button")
	.attr("value","Result")
	.attr("onclick","runModelOneTime()");


// when the input range changes, update  
d3.select("#riverWidth").on("input", function() {
	lineGraph_interactive_river1.attr("stroke-width", this.value/2);
	//input precip
	precip = this.value;
});

d3.select("#riverTemp").on("input", function() {
	var greenNum = 255;
	var redNum = Math.floor(greenNum - (greenNum*this.value/100));
	var tempHexString;
	greenNum = Math.floor(greenNum*this.value/100);
	var greenString;
	var redString;

	//if red num < 16 then when you change it into string it will be just one letter not "0f"
	if(redNum == 0)
		redString = "00";
	else if(redNum < 16)
		redString = "0" + redNum.toString(16);
	else
		redString = redNum.toString(16);

	if(greenNum == 0)
		greenString = "00";
	else if(greenNum < 16)
		greenString = "0" + greenNum.toString(16);
	else
		greenString = greenNum.toString(16);

    tempHexString = "#" + redString + greenString + "00";
	lineGraph_interactive_river1.attr("stroke", tempHexString);

	//input air temperature
	//-50 to 50 centigrades
	airtemp = this.value -50;
});

//this is model part
function runModelOneTime()
{
	//test data
	//airtemp = 1.39;
	//precip = 1.72;
	elevation = 1043;
	areastream = 89916;

	var streamflow;
	var streamtemp;
	//because the users just run our model once per click
	//rain bank and snow bank is always 0
	var rainbank = 0;
	var snowbank = 0;

	var fishdensity;
	//air temperature is bigger than 0, the precip is rain
	//or precip is snow
	if(airtemp > 0)
	{
		rainbank = rainbank + precip;
		streamflow = 0.009 * rainbank;
		//change inch into cm
		streamflow = streamflow * 2.54;
	}
	else
	{
		snowbank = snowbank + precip;
		//this part is not clear, seems we do not use snowbank
		streamflow = 0.009 * (precip) + 0.05 * airtemp;
		//change inch into cm
		streamflow = streamflow * 2.54;
	}
	
	streamtemp = 0.056785714 + ( (20.4 - 0.056785714) / (1 + Math.exp(0.056785714*(20.4 - airtemp))) );
	fishdensity = -0.05449 + 0.004116 * streamtemp + (-0.3048) * streamflow + 0.0003579 * elevation;

	var fishpopulation = fishdensity * areastream;

	if(fishpopulation < 0)
		fishpopulation = 0;

	d3.select(".oneResult").append("p")
		.text("air temp is " + airtemp.toFixed(2) + ", precip is " + parseFloat(precip).toFixed(2) + ", fish population is " + parseInt(fishpopulation));
}






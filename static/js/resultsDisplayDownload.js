//this is used to record the date information in the input csv file
//and used for offering right information for download file
var 	xAxisValue = [];
//now just support download x chosen areas
var linechart = new Dygraph(
    document.getElementById("lineChartdiv"),
    "input.csv", // path to CSV file
    {
		xValueFormatter: Dygraph.dateString_,
    	xValueParser: function(x) 
		{ 
				xAxisValue.push(x);
        		var m = parseDate(x);
        		//return m.getTime();
				return m;
    	},
    	xTicker: Dygraph.dateTicker

	}        // optionslinechart
  );
//this function is used to parse date YYYY-MM-DD
function parseDate(input) {
  var parts = input.split('-');
  // new Date(year, month [, day [, hours[, minutes[, seconds[, ms]]]]])
  return new Date(parts[0], parts[1]-1, parts[2]); // Note: months are 0-based
}

//this is the original scale
var xScaleStart;
var xScaleEnd;
var xScale;

linechart.ready(function() {
	xScaleStart = linechart.xAxisRange()[0];
	xScaleEnd = linechart.xAxisRange()[1];
	xScale = xScaleEnd - xScaleStart;
});

var generateResultButton = d3.select(".confirmButton").append("input")
	.attr("type","button")
	.attr("value","Results")
	.attr("onclick","generateResult()");

function generateResult()
{

	var data = "";
	//this var is used to generate right date value
	//var d = new Date(0);

	//each line is a input, and generaate a result
	for(var rowNum = 0 ; rowNum < linechart.numRows() ; rowNum = rowNum + 1)
	{
		//0: date, 1: precip, 2: air temp, 3: elevation, 4: areastream
		var result = runModel(linechart.getValue(rowNum,2), linechart.getValue(rowNum,1), linechart.getValue(rowNum,3), linechart.getValue(rowNum,4));

		data = data + linechart.getValue(rowNum,0) + ',' + result + '\n';
	}

	linechart = new Dygraph(
		document.getElementById("lineChartdiv"),
		data, // path to CSV file
		{
/*
			xValueFormatter: Dygraph.dateString_, 
			xValueParser: function(x) { return 1000*parseInt(x); }, 
			xTicker: Dygraph.dateTicker,
*/
			labels: [ "Date", "Fish" ]

		}        // options
	);

	//get initial scale of model
	xScaleStart = linechart.xAxisRange()[0];
	xScaleEnd = linechart.xAxisRange()[1];
	xScale = xScaleEnd - xScaleStart;

	//when user press this button, a csv file of the chosen area will be downloaded
	//select class by .
	var downloadCSVButton = d3.select(".confirmButton").append("input")
		.attr("type","button")
		.attr("value","downloadCSV")
		.attr("onclick","downloadData()");	
}


//var graphPos = linechart.dateWindow;
function downloadData()
{
	var xTempScaleStart = linechart.xAxisRange()[0];
	var xTempScaleEnd = linechart.xAxisRange()[1];

	//startElementIndex is the first chosen element index
	var startElementIndex = Math.ceil(linechart.numRows()*(xTempScaleStart - xScaleStart)/xScale);
	var endElementIndex = Math.floor(linechart.numRows()*(xTempScaleEnd - xScaleStart)/xScale);

	d3.select(".confirmButton").append("p")
	.text('the first element index is ' + startElementIndex + ', the last element index is ' + endElementIndex);

	//this is used to change data into csv file and download it
	//var data = [["Minsk",100000,123], ["Riga",200000,321]];
	var data = [];
	var tempTuple = [];

	//push the lable into csv
	data.push(['date','fish']);	

	//double loop, out loop for rows, inner loop for columns
	for(var rowNum = startElementIndex ; rowNum < endElementIndex ; rowNum = rowNum + 1)
	{
		for(var colNum = 0 ; colNum < linechart.numColumns() ; colNum = colNum + 1)
		{
			//this means if the input value is not date
			if(colNum != 0)
				tempTuple.push(linechart.getValue(rowNum,colNum));
			else
				tempTuple.push(xAxisValue[rowNum]);
		}
		data.push(tempTuple);
		tempTuple = [];
	}

	alasql("SELECT * INTO CSV('modelOutput.csv') FROM ?",[data]);
}

//this is model part
function runModel(airtemp, precip, elevation, areastream)
{
	//test data
	//airtemp = 1.39;
	//precip = 1.72;
	//elevation = 1043;
	//areastream = 89916;

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

	return fishpopulation;
}


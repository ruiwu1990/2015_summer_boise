//this part is about personal information display
//this part is inspired from
//http://bl.ocks.org/mbostock/3808234
var width_Information = 800,
    height_Information = 800;

/*
var svgInformation = d3.select("body").append("svg")
    .attr("width", width_Information)
    .attr("height", height_Information)
  .append("g")
    .attr("transform", "translate(32," + (height_Information / 2) + ")");
*/

var svgInformation = d3.select("body").append("p");

function update(data) {

	d3.select(".tempParagraph").remove();
	var svgInformation = d3.select(".informParagraph")
						//.data(data)
						//.append("p").text(data);
						.append("p")
						.attr("class","tempParagraph")
						.text(data.inform);

	
/*
  // DATA JOIN
  // Join new data with old elements, if any.
  var text = svgInformation.selectAll("text")
      .data(data, function(d) { return d; });

  // UPDATE
  // Update old elements as needed.
  text.attr("class", "update")
    .transition()
      .duration(750)
      .attr("x", function(d, i) { return i * 32; });

  // ENTER
  // Create new elements as needed.
  text.enter().append("text")
      .attr("class", "enter")
      .attr("dy", ".35em")
      .attr("y", -60)
      .attr("x", function(d, i) { return i * 32; })
      .style("fill-opacity", 1e-6)
      .text(function(d) { return d; })
    .transition()
      .duration(750)
      .attr("y", 0)
      .style("fill-opacity", 1);

  // EXIT
  // Remove old elements as needed.
  text.exit()
      .attr("class", "exit")
    .transition()
      .duration(750)
      .attr("y", 60)
      .style("fill-opacity", 1e-6)
      .remove();
*/
}

//this part is inspired from
//http://www.ourd3js.com/wordpress/?p=606
var width = 600;
var height = 600;
var img_w = 77;
var img_h = 90;

var svg = d3.select(".flowChart").append("svg")
						.attr("width",width)
						.attr("height",height);


d3.json("relationFlowChart.json",function(error,root){
	
	if( error ){
		return console.log(error);
	}
	console.log(root);
	
	var force = d3.layout.force()
					.nodes(root.nodes)
					.links(root.edges)
					.size([width,height])
					.linkDistance(200)
					.charge(-1500)
					.start();
/*					
	var label_text_1 = svg.append("text")
						.attr("class","labeltext")
						.attr("x",10)
						.attr("y",16)
						.text("Force: start");
						
	var label_text_2 = svg.append("text")
						.attr("class","labeltext")
						.attr("x",10)
						.attr("y",40)
						.text("Force: end");
*/					
	var edges_line = svg.selectAll("line")
						.data(root.edges)
						.enter()
						.append("line")
						.style("stroke","#ccc")
						.style("stroke-width",1);
						
	var edges_text = svg.selectAll(".linetext")
						.data(root.edges)
						.enter()
						.append("text")
						.attr("class","linetext")
						.text(function(d){
							return d.relation;
						});
	
	var drag = force.drag()
				.on("dragstart",function(d,i){
					d.fixed = true;    //after drag, set the target as fixed
					label_text_2.text("Drag: start");
				})
				.on("dragend",function(d,i){
					label_text_2.text("Drag: end");
				})
				.on("drag",function(d,i){
					label_text_2.text("Drag: in progress");
				});

	var nodes_img = svg.selectAll("image")
						.data(root.nodes)
						.enter()
						.append("image")
						.attr("width",img_w)
						.attr("height",img_h)
						.attr("xlink:href",function(d){
							return d.image;
						})
						.on("mouseover",function(d,i){
							//display line text
							edges_text.style("fill-opacity",function(edge){
								if( edge.source === d || edge.target === d ){
									return 1.0;
								}
							});

							edges_line.style("stroke",function(edge){
								if( edge.source === d || edge.target === d ){
									return "red";
								}
							});
							//this part is used to display personal information
							update(d);
						})
						.on("mouseout",function(d,i){
							//disappear line text
							edges_text.style("fill-opacity",function(edge){
								if( edge.source === d || edge.target === d ){
									return 0.0;
								}
							});

							edges_line.style("stroke",function(edge){
								if( edge.source === d || edge.target === d ){
									return "#ccc";
								}
							});
						})
						.on("dblclick",function(d,i){
							d.fixed = false;
						})
						.call(drag);
	
	var text_dx = -20;
	var text_dy = 20;
	
	var nodes_text = svg.selectAll(".nodetext")
						.data(root.nodes)
						.enter()
						.append("text")
						.attr("class","nodetext")
						.attr("dx",text_dx)
						.attr("dy",text_dy)
						.text(function(d){
							return d.name;
						});
/*	
	//start force
	force.on("start", function(){
		label_text_1.text("Force: start");
	});
	
	//end force
	force.on("end", function(){
		label_text_1.text("Force: end");
	});
*/						
	force.on("tick", function(){
		
		//change label text
		//label_text_1.text("Force: in progress");
		
		//limited the node boundary
		root.nodes.forEach(function(d,i){
			d.x = d.x - img_w/2 < 0     ? img_w/2 : d.x ;
			d.x = d.x + img_w/2 > width ? width - img_w/2 : d.x ;
			d.y = d.y - img_h/2 < 0      ? img_h/2 : d.y ;
			d.y = d.y + img_h/2 + text_dy > height ? height - img_h/2 - text_dy : d.y ;
		});
	
		//update edge position
		 edges_line.attr("x1",function(d){ return d.source.x; });
		 edges_line.attr("y1",function(d){ return d.source.y; });
		 edges_line.attr("x2",function(d){ return d.target.x; });
		 edges_line.attr("y2",function(d){ return d.target.y; });
		 
		 //update line text position
		 edges_text.attr("x",function(d){ return (d.source.x + d.target.x) / 2 ; });
		 edges_text.attr("y",function(d){ return (d.source.y + d.target.y) / 2 ; });
		 
		 
		 //update node images and text
		 nodes_img.attr("x",function(d){ return d.x - img_w/2; });
		 nodes_img.attr("y",function(d){ return d.y - img_h/2; });
		 
		 nodes_text.attr("x",function(d){ return d.x });
		 nodes_text.attr("y",function(d){ return d.y + img_w/2; });
	});
});
  



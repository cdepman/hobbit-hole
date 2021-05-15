
var nodes = [
  {type:'person',id:'jeremy',name:'Jeremy', yearsInHole:'2011 - 2016',"image": "jeremy.png", og: true},
  {type:'person',id:'aseem',name:'Aseem', yearsInHole:'2011 - 2019',"image": "aseem.png", og: true},
  {type:'person',id:'pramod',name:'Pramod', yearsInHole:'2011 - 2014',"image": "pramod.png", og: true},
  {type:'person',id:'chris',name:'Chris', yearsInHole:'2012 - 2014',"image": "chris.png"},
  {type:'person',id:'alex',name:'Alex', yearsInHole:'2014 - 2017',"image": "alex.png"},
  {type:'person',id:'david',name:'David', yearsInHole:'2014 - 2017',"image": "david.png"},
  {type:'person',id:'charlie',name:'Charlie', yearsInHole:'2016 - 2020',"image": "charlie.png"},
  {type:'person',id:'jp',name:'JP', yearsInHole:'2016 - 2017',"image": "jp.png"},
  {type:'person',id:'remi',name:'Remi', yearsInHole:'2017 - 2021',"image": "remi.png"},
  {type:'person',id:'kyle',name:'Kyle', yearsInHole:'2017 - 2021',"image": "kyle.png"},
  {type:'person',id:'sam',name:'Sam', yearsInHole:'2019 - 2020',"image": "sam.png"},
  {type:'person',id:'duc',name:'Duc', yearsInHole:'2020 - 2021',"image": "duc.png"},
]

var edges = [
  {id:1,source:'pramod',target:'chris',type:'og_hobbit'},
  {id:2,source:'pramod',target:'jeremy',type:'og_hobbit'},
  {id:3,source:'aseem',target:'pramod',type:'og_hobbit'},
  {id:8,source:'chris',target:'david',type:'hobbit'},
  {id:9,source:'jeremy',target:'charlie',type:'hobbit'},
  {id:5,source:'pramod',target:'alex',type:'hobbit'},
  {id:11,source:'pramod',target:'remi',type:'hobbit'},
  {id:6,source:'chris',target:'jp',type:'hobbit'},
  {id:12,source:'aseem',target:'kyle',type:'hobbit'},
  {id:13,source:'kyle',target:'sam',type:'hobbit'},
  {id:14,source:'remi',target:'duc',type:'hobbit'},
]


//defining the chart
var myChart = hobbitHoleFamilyTree().nodes(nodes)
                           .links(edges);

//defining the width and height of the svg
var width = window.innerWidth, // default width
   height = window.innerHeight;

//drawing the svg and calling the hobbitHoleFamilyTree opject.

var svg = d3.select('body').append("svg")
            .attr("width", width)
            .attr("height", height)
            .call(myChart);

function hobbitHoleFamilyTree() {


  var nodes = [],
      links = [] // default height

  function my(svg) {

    //set the repel force - may need to be tweaked for multiple data
    //the lower the strength the more they will repel away from each other
    //the larger the distance, the more apart they will be
    var repelForce = d3.forceManyBody().strength(-6000).distanceMax(600)
                       .distanceMin(500);

    //start the simulation
    //alpha decay - if less, force takes longer but is better positioned
    //center just keeps everything in the svg - otherwise you won't see it however much you pan or zoom
    //repel force see above
    //link distance - repel takes precidence - try upping or lowering the strength and changing the distances
    //collide - this is on maximum strength and is higher for family (bigger radius) than others so should keep
    //families further apart than people
    var simulation = d3.forceSimulation()
                      .alphaDecay(0.04)
                        .velocityDecay(0.4)
                        .force("center", d3.forceCenter(width / 2, height / 2))
                       .force("xAxis",d3.forceX(width/2).strength(.1))
                       .force("yAxis",d3.forceY(height/2).strength(.1))
                       .force("repelForce",repelForce)
                       .force("link", d3.forceLink().id(function(d) { return d.id }).distance(dist).strength(0.4))
                       .force("collide",d3.forceCollide().radius(function(d) { return d.r * 50; }).iterations(10).strength(1))

    function dist(d){
      //used by link force
      return 200

    }

    //define the links
    var links = svg.selectAll()
        .data(edges)
        .enter()
        .append("line")
        .attr("stroke-width",function(d){
            if(d.type == 'og_hobbit'){
              return "4px"
            } else{
              return "2px"
            }})
      .attr("stroke", function(d){ 
        if(d.type == 'og_hobbit'){
          return "gold"
        }
        return "lightblue"
      });

    //draw the nodes with drag functionality
    var node = svg.selectAll()
        .data(nodes)
        .enter()
        .append("g")
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));

    //define defs and patterns - for the images
    var defs = node.append("defs");


    defs.append('pattern')
        .attr("id", function(d,i){return "my_image" + i})
        .attr("width", 1)
        .attr("height", 1)
        .append("svg:image")
        .attr("xlink:href", function(d) {return d.image})
        .attr("height", "120")
        .attr("width", "120")
        .attr("x", 0)
        .attr("y", 0);

    //append circles
    node.append("circle")
        .attr("class","circle")
        .attr("r", 60)
          .attr("fill",function(d,i){
            if(d.type == "family"){return "white"}
            else{return "url(#my_image" + i + ")"}})
          .attr("stroke", function(d){
            if (d.type == "family"){return "gold";
            } else { return "tan"}})
            .attr("stroke-width","2px")


    //title case function used by tooltip and labels
    function titleCase(str) {
        str = str.toLowerCase().split(' ');
        for (var i = 0; i < str.length; i++) {
            str[i] = str[i].charAt(0).toUpperCase() + str[i].slice(1);
        }
        return str.join(' ');
    }

    node.append("rect")
      .attr("width", 120)
      .attr("height", 50)
      .attr("rx", 6)
      .attr("x", -60)
      .attr("y", 55)
      .style("fill", function(d) { return "#fff"; })
      .style("stroke", function(d) { return d3.rgb("#fff").darker(); })

    node.append("text")
      .style("fill", "black")
      .attr("dx", 0)
      .attr("dy", 75)
      .attr("text-anchor","middle")
      .text(function(d) {
          return titleCase(d.name);
      });
    node.append("text")
      .style("fill", "black")
      .attr("dx", 0)
      .attr("dy", 100)
      .attr("text-anchor","middle")
      .text(function(d) {
          return titleCase(d.yearsInHole);
      });
      
    node.append("circle")
      .attr("r", (d) => d.og ? 20 : 0)
      .style("fill", "gold")
      .attr("cx", 40)
      .attr("cy", -47)
    
    node.append("text")
      .style("fill", "black")
      .attr("dx", 40)
      .attr("dy", -40)
      .attr("text-anchor","middle")
      .text((d) => d.og ? "OG" : "");

    //finally - attach the nodes and the links to the simulation
    simulation.nodes(nodes);
    simulation.force("link")
              .links(edges);

    //and define tick functionality
   simulation.on("tick", function() {

            node.attr("transform", function(d){ return "translate(" + d.x + "," + d.y + ")"})
          .attr("cx", function(d) { return d.x = Math.max(60, Math.min(width - 60, d.x)); })
          .attr("cy", function(d) { return d.y = Math.max(60, Math.min(height - 60, d.y)); })

        links.attr("x1", function(d) {return d.source.x;})
             .attr("y1", function(d) {return d.source.y;})
             .attr("x2", function(d) {return d.target.x;})
             .attr("y2", function(d) {return d.target.y;})
    });


    function dragstarted(d) {

       if (!d3.event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      if(d.type == 'family'){
        //stickiness - toggles the class to fixed/not-fixed to trigger CSS
        var my_circle = d3.select(this).selectAll('circle')
        if(my_circle.attr('class') == 'fixed'){
          my_circle.attr("class","not-fixed")
        }else{
          my_circle.attr("class","fixed")
        }
      }
    }

    function dragged(d) {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
    }

    function dragended(d) {
       if (!d3.event.active) simulation.alphaTarget(0);
       //stickiness - unfixes the node if not-fixed or a person
       var my_circle = d3.select(this).selectAll('circle')
       if(my_circle.attr('class') == 'not-fixed'  || d.type !== 'family'){
         d.fx = null;
         d.fy = null;
       }

    }

    function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
      //for arcs - from excellent link - http://jsbin.com/quhujowota/1/edit?html,js,output
        var angleInRadians = (angleInDegrees-90) * Math.PI / 180.0;

      return {
        x: centerX + (radius * Math.cos(angleInRadians)),
        y: centerY + (radius * Math.sin(angleInRadians))
      };
    }

    function describeArc(x, y, radius, startAngle, endAngle){
      //for arcs - from excellent link - http://jsbin.com/quhujowota/1/edit?html,js,output

        var start = polarToCartesian(x, y, radius, endAngle);
        var end = polarToCartesian(x, y, radius, startAngle);

        var largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

        var d = [
            "M", start.x, start.y,
            "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
        ].join(" ");

        return d;
    }
  }

  my.width = function(value) {
    if (!arguments.length) return width;
    width = value;
    return my;
  };

  my.nodes = function(value) {
    if (!arguments.length) return nodes;
    nodes = value;
    return my;
  };

  my.links = function(value) {
    if (!arguments.length) return links;
    links = value;
    return my;
  };

  my.height = function(value) {
    if (!arguments.length) return height;
    height = value;
    return my;
  };

  return my;
}

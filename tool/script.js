var width = 700,
  height = 600;

var projection = d3.geo.mercator()
  .center([-73.94, 40.70])
  .scale(50000)
  .translate([100 + (width) / 2, (height) / 2]);

var x = d3.scale.linear().range([0, 260]).domain([2010, 2016]);
var y = d3.scale.linear().range([100, 0]).domain([.5, 1.0]);

var svg = d3.select("body")
  .style('color', 'black')
  .append("svg")
  .attr("width", width)
  .attr("height", height);

// title
var info = svg.append("g")
  .attr("id", "infoblock");

var mouseOverProp = {
  'color': '#fff',
  'fill-opacity': '1'
}


var Palletes = [
  ["#B7F8C7", "#91DFAE", "#70C699", "#52AD89", "#39937A", "#257A6C", "#14615E"],
  ["#DAF495", "#CAEA8C", "#BAE083", "#AAD67B", "#9BCC73", "#8DC26B", "#7FB964"]
];


var districtDatum;

d3.json("districts_t.json", function(error, nyb) {
  console.log('districts uploaded')

  districtDatum = topojson.feature(nyb, nyb.objects.districts).features;


  var path = d3.geo.path()
    .projection(projection);

  var g = svg.append("g")
             .attr('id','parks');

  console.log('parks uploaded')
  d3.json("parks_t.json", function(error, prks) {

    var path = d3.geo.path()
      .projection(projection);

    var ps = g.append("g")
      .selectAll(".parkP")
      .data(topojson.feature(prks, prks.objects.parks).features)
      .enter().append("path")
      .attr("class", "park")
      .attr("d", path);

  })



  g.append("g")
    .attr("id", "background")
    .append("path")
    .datum(topojson.merge(nyb, nyb.objects.districts.geometries))
    .attr("class", "back")
    .attr("d", path);



  svg.append("g")
    .attr("id", "districts")
    .selectAll(".state")
    .data(topojson.feature(nyb, nyb.objects.districts).features)
    .enter().append("path")
    .attr("class", "district")
    .attr("id", function(d) {
      return "district " + d.id;
    })
    .attr("d", path)
    .on("mouseover", function(d) {
      drawInfoCard(d)
    })
    .on("mouseout", function() {
      // Remove the tooltip
      d3.select("#tooltip").remove();
      d3.select("#distrCard").remove();
    });


  function drawInfoCard(d) {

    var mHeight = [80, 200, 200][MODE]
      // console.log(MODE)
    coordinates = path.centroid(d);
    //Create the tooltip label
    svg.append("text")
      .attr("id", "tooltip")
      .attr("x", coordinates[0])
      .attr("y", coordinates[1])
      .attr("text-anchor", "middle")
      .attr("font-family", "sans-serif")
      .attr("font-size", "11px")
      .attr("font-weight", "bold")
      .attr("fill", "black")
      .text(d.properties.SYSTEM);

    var card = svg.select("#infoblock")
      .append("g")
      .attr("transform", "translate(16,120)")
      .attr("id", 'distrCard');

    card.append("rect")
      .attr("id", 'cardBack')
      .attr("width", 310)
      .attr("height", mHeight)

    card.append("text")
      .attr("x", 10)
      .attr("y", 25)
      .attr("id", 'dID')
      .text(d.properties.SYSTEM);

    card.append("text")
      .attr("x", 70)
      .attr("y", 18)
      .attr("id", "COUNCILDIS")
      .text("Council districts: " + d.properties.COUNCILDIS)


    if (MODE > 0) {
      graphmaker(card, d)
    }
  }



  function graphmaker(card, d) {
    var plot = card.append("g")
      .attr("class", "plot")
      .attr("transform", "translate(10,70)")

    yRange = [
      [0.5, 1.0],
      [100, 1000]
    ][MODE - 1];

    // Y-axis
    var y = d3.scale.linear().range([100, 0]).domain(yRange);
    var yAxis = d3.svg.axis().scale(y).orient("right").ticks(3);
    plot.append("g").attr("class", "y axis2 plot")
      .attr("transform", "translate(265,8)")
      .call(yAxis).append("text").attr("transform", "rotate(-90)")

    // X-axis

    var x = d3.scale.linear().range([0, 260]).domain([2010, 2016]);
    var xAxis = d3.svg.axis().scale(x).orient("bottom").ticks(3);
    plot.append("g").attr("class", "x axis2 plot")
      .attr("transform", "translate(0,110)")
      .call(xAxis);

    // District plot

    var prop = [
      ['score2010', 'score2011', 'score2012',
        'score2013', 'score2014', 'score2015'
      ],
      ['2010', '2011', '2012', '2013', '2014', '2015']
    ][MODE - 1];

    var dummy = [{
      'xx': 2010,
      'yy': .6
    }, {
      'xx': 2011,
      'yy': .6
    }, {
      'xx': 2012,
      'yy': .6
    }, {
      'xx': 2013,
      'yy': .6
    }, {
      'xx': 2014,
      'yy': .6
    }, {
      'xx': 2015,
      'yy': .6
    }];

    var average = [{
      'xx': 2010,
      'yy': .6
    }, {
      'xx': 2011,
      'yy': .6
    }, {
      'xx': 2012,
      'yy': .6
    }, {
      'xx': 2013,
      'yy': .6
    }, {
      'xx': 2014,
      'yy': .6
    }, {
      'xx': 2015,
      'yy': .6
    }, ]

    //  populate currentLine
    for (index = 0; index < prop.length; ++index) {
      dummy[index]['yy'] = d.properties[prop[index]];
    };

    //  populate average
    for (index = 0; index < prop.length; ++index) {
      average[index]['yy'] = getAverage(prop[index]);
    };


    var lineFunct = d3.svg.line()
      .x(function(d) {
        return x(d.xx)
      })
      .y(function(d) {
        return y(d.yy)
      })
      .interpolate('basis');

      // PLOT LINES

    plot.append("path")
      .attr("class", "mainline")
      .attr("d", lineFunct(dummy));
    //
    plot.append("path")
        .attr("class", "averageline")
        .attr("d", lineFunct(average));

        // legend
    var legend = card.append("g")
    .attr("class","legend")
    .attr("transform","translate(10,30)")
    .style("font-size","12px")

    legend.append("text")
    .attr("x", 15)
    .attr("y", 17)
    .attr("class", "legendText")
    .text(["District score", "Calls per district"][MODE-1])

    legend.append("text")
    .attr("x", 15)
    .attr("y", 29)
    .attr("class", "legendTexy")
    .text(["Average districts score", "Average number of calls per district"][MODE-1])

    legend.append("rect").attr("width", 12)
      .attr("height", 8).attr("id","DistrictLegend" )
      .attr("transform", "translate(0,10)");

    legend.append("rect").attr("width", 12)
        .attr("height", 3).attr("id","AverageLegend" )
        .attr("transform", "translate(0,24)");
  }

  // ---- RADIO BUTTONS
  var modes = ["Property", "Scores", "Complains"],
    MODE = 0; // Choose the rectangle as default

  //
  var form = d3.select("body")
    .append("div")
    .append("h1")
    .attr('id', 'title')
    .text("NYC Parks Quality");


  // Create the shape selectors
  var form = d3.select("body")
    .append("div")
    .attr('id', 'formDiv')
    .append("form");

  var labelEnter = form.selectAll("span")
    .data(modes)
    .enter()
    .append("span")
    .attr('class', 'rButton');

  labelEnter.append("input")
    .attr({
      type: "radio",
      class: "shape",
      name: "mode",
      value: function(d, i) {
        return i;
      }
    })
    .property("checked", function(d, i) {
      return (i === MODE);
    });

  labelEnter.append('label').text(function(d) {
    return d;
  });



  function plotLegend(mode) {
    if (mode > 0) {
      var name = ['PIP Scores, 2015', '311 Calls, 2015'][mode - 1]
      var prop = ['score2015', 2015][mode - 1]

      var w = 110,
        h = 300;
      var maximumColor = Palletes[mode - 1][6];
      var minimumColor = Palletes[mode - 1][0];
      var minimum = getDataRange(prop)[0];
      var maximum = Math.max(getDataRange(prop)[1], 1);
      // console.log(maximum);

      svg.select('#legend').remove()

      var key = svg.append('g').attr("id", "legend").attr("width", w).attr("height", h).attr("transform", "translate(16,327)");

      var legend = key.append("defs").append("svg:linearGradient")
        .attr("id", "gradient")
        .attr("x1", "100%").attr("y1", "0%")
        .attr("x2", "100%").attr("y2", "100%")
        .attr("spreadMethod", "pad");

      legend.append("stop").attr("offset", "0%")
        .attr("stop-color", maximumColor)
        .attr("stop-opacity", 1);

      legend.append("stop").attr("offset", "100%")
        .attr("stop-color", minimumColor)
        .attr("stop-opacity", 1);

      key.append("rect").attr("width", w - 100)
        .attr("height", h - 100).style("fill", "url(#gradient)")
        .attr("transform", "translate(0,10)");

      var y = d3.scale.linear().range([193, 0]).domain([minimum, maximum]);
      var yAxis = d3.svg.axis().scale(y).orient("right").ticks(6);
      key.append("g").attr("class", "y axis").attr("transform", "translate(8,13)").call(yAxis).append("text").attr("transform", "rotate(-90)").attr("y", 32).attr("dy", ".62em").style("text-anchor", "end").text(name);
      key.selectAll("g").filter(function(d) {
        return d;
      }).classed("minor", true);
    } else {
      svg.select('#legend').remove()
    }
  }

  //  ViZ MODES
  d3.selectAll("input").on("change", change);

  function change() {
    //  change viz mode
    mode = this.value;
    MODE = mode;
    // console.log(mode);
    choropleth(mode);
    plotLegend(mode)

  }



  function choropleth(mode) {
    // var rate = d3.map();


    function quantize(mode, d) {
      if (mode == 0) {
        return "red"
      } else {
        var prop = ['score2015', 2015][mode - 1]


        var quantizer = d3.scale.quantize()
          .domain(getDataRange(prop))
          .range(Palletes[mode - 1]);


        return quantizer(d.properties[prop]);
      }

    };

    var opacity = ['0', '0.6', '0.6'][mode];

    d3.selectAll('.district').transition()
      .style('fill-opacity', opacity)
      .style('fill', function(d) {
        return quantize(mode, d);
      })



    d3.selectAll('.park').transition()
      .style('fill', function() {
        return ["rgb(155, 226, 155)", "rgb(210, 223, 210)", "rgb(210, 223, 210)"][mode]
      })


  };




  function getDataRange(currentAttribute) {
    var min = Infinity,
      max = -Infinity;

    d3.selectAll('.district')
      .each(function(d, i) {
        var currentValue = d.properties[currentAttribute];
        if (currentValue <= min && currentValue != -99 && currentValue != 'undefined') {
          min = currentValue;
        }
        if (currentValue >= max && currentValue != -99 && currentValue != 'undefined') {
          max = currentValue;
        }
      });
    return [min, max]; //boomsauce
  }

  function getAverage(currentAttribute) {
    var n = 0,
      sum = 0;

    d3.selectAll('.district')
      .each(function(d, i) {
        var currentValue = d.properties[currentAttribute];
        n += 1;
        sum += currentValue;
      });
    return sum / n; //boomsauce
  }

  // console.log(getAverage(2015))

})

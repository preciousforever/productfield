import d3 from 'd3';
import jquery from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import GlobalStyles from '../../styles/GlobalStyles'
import {connect} from 'react-redux';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import Radium from 'radium';
import {Map} from 'immutable';
import {ForceFieldCalculationSingleton, coordinateSystemTransformation} from '../../ForceFieldCalculation';
import {ForceFieldDescriptor} from '../../ForceFieldDescriptor';

export default Radium(React.createClass({
  mixins: [PureRenderMixin],

  componentWillReceiveProps: function(nextProps) {
    var calculationPoints = coordinateSystemTransformation(nextProps.points)
    ForceFieldCalculationSingleton.getInstance().setEnergies(calculationPoints);

    var svgContainer = d3.select(".force-field-canvas").select("svg");

    var dateLastRender = new Date(this.props.lastTimestamp);
    var dateNow = new Date();

    //Timerenderer. UpdateLines is only called, when e certain time has expired
    if(dateNow - dateLastRender > 300)
    {
        this.props.setLastRenderTimestamp(Date.now());
        this.updateLines(svgContainer);
    }
  },

  getPreferences: function() {
    const navbarHeight = 50;
    const paddingBottom = 30;
    const dotsInField = 20;
    var availableHeight = $(window).height() - navbarHeight - paddingBottom;
    var gridUnit = Math.min($(window).width(), availableHeight) / dotsInField;
    var fieldSize = gridUnit * dotsInField

    return {
      fieldSize: fieldSize,
      scale: fieldSize / $(window).width(),
      gridUnit: gridUnit,
      triangleSize: 2.5,
      minLengthForArrowsToDisplay: 2,
      width:  $(window).width(),
      height: $(window).height() - navbarHeight,
      skin: {
        dots: "#304FFE",
        marker: "#304FFE",
        arrows: "#F2F2F2",
        background: '#FFFFFF'
      }
    }
  },

  updateLines: function(svgContainer) {

    var preferences = this.getPreferences();
    var forceField = ForceFieldCalculationSingleton.getInstance();

    svgContainer.selectAll("line").each(function(d,i){

      var line = d3.select(this);

      var x = parseInt(line.attr("x1"));
      var y = parseInt(line.attr("y1"));

      var result = forceField.forceVectorAtPoint(x,y);

      var length = Math.sqrt(Math.pow(result.x/preferences.gridUnit, 2) + Math.pow(result.y/preferences.gridUnit, 2));

      var xDelta = result.x / preferences.gridUnit;
      var yDelta = result.y / preferences.gridUnit;

      var x2 = x;
      var y2 = y - length;

      line.attr("x2",x2);
      line.attr("y2",y2);

      //creates new arrow-triangle coordiantes for spares of lines
      var triangleCoordinates = [x2, y2, x2 + preferences.triangleSize, y2, x2, y2 - preferences.triangleSize, x2 - preferences.triangleSize, y2, x2, y2].join();

      var svgTriangle = d3.select("#triangle" + x + "" + y);
      svgTriangle.attr("points", triangleCoordinates);

      //Calculation of degree for direction
      var a = Math.atan(result.y / result.x);
      var deg = (180 / Math.PI) * a;

      if(yDelta > 0) {
        var deg = 180 / a;
      } else {
        var deg = 180 / a + 180;
      }

      //Rotation of triangle and line in dependence of direction degree
      svgTriangle.attr("transform", "rotate(" + deg + "," + x + "," + y + ")" );
      line.attr("transform", "rotate(" + deg + "," + x + "," + y + ")" );

    });
  },

  normalizeCoordinates: function(x, y) {
    var preferences = this.getPreferences();

    var translatedX = (x - preferences.width / 2);
    var translatedY = (y - preferences.height / 2);

    var normalizedX = translatedX / preferences.width * 2 * preferences.width / preferences.fieldSize;
    var normalizedY = -1 * translatedY / preferences.height * 2 * preferences.height / preferences.fieldSize;

    return [normalizedX, normalizedY];
  },

  renderPoints: function(svgContainer) {
    var preferences = this.getPreferences();

    var width = preferences.width - 5;
    var height = preferences.height - 5;
    var group = svgContainer.append("g").attr("width", width).attr("height", height);

    //Creates all Points for the Forcefield
    var offsetX = Math.floor(width - preferences.fieldSize) / 2 % preferences.gridUnit;
    var offsetY = Math.floor(height / 2 - preferences.fieldSize / 2) % preferences.gridUnit;

    for(var x = offsetX; x < preferences.width; x = x + preferences.gridUnit){
      for(var y = offsetY; y < preferences.height; y = y + preferences.gridUnit){
        //Get Forcefieldvectors and already calculated values for directions of points and arrows
        var forceField = ForceFieldCalculationSingleton.getInstance();
        var result = forceField.forceVectorAtPoint((x - preferences.width / 2) * preferences.scale, (y - preferences.height  / 2) * preferences.scale);

        var length = Math.sqrt(Math.pow(result.x/preferences.gridUnit, 2) + Math.pow(result.y/preferences.gridUnit, 2));

        //Show Arrows and lines only if they're long enough
        var xDelta = result.x / preferences.gridUnit;
        var yDelta = result.y / preferences.gridUnit;

        var x2 = x;
        var y2 = y - length;

        //Calculation of degree for direction
        var a = Math.atan(result.y / result.x);
        var deg = (180 / Math.PI) * a;

        if(yDelta > 0) {
          var deg = 180 / a;
        } else {
          var deg = 180 / a + 180;
        }

        var doDrawForces = false;
        if(doDrawForces) {
          //creates the lines
          svgContainer.append("line")
                      .attr("x1", x)
                      .attr("y1", y)
                      .attr("x2", x2)
                      .attr("y2", y2)
                      .attr("stroke-width", 1)
                      .attr("stroke", "black")
                      .attr("transform", "rotate(" + deg + "," + x + "," + y + ")" ); // Rotation of the line in dependence of the direction delta

          //creates arrow-triangles on spares of lines
          var triangleCoordinates = [x2, y2, x2 + preferences.triangleSize, y2, x2, y2 - preferences.triangleSize, x2 - preferences.triangleSize, y2, x2,y2].join();
          svgContainer.append("polyline")
                      .attr("id", "triangle" + x + "" + y)
                      .attr("points", triangleCoordinates)
                      .attr("transform", "rotate(" + deg + "," + x + "," + y + ")" ) // Rotation of the tirangles in dependence of the direction delta
                      .style("fill", "black");
        }



        group.append("circle")
                       .attr("cx", x)
                       .attr("cy", y)
                       .attr("r", .8)
                       .style("fill", preferences.skin.dots);
      }
    }
  },

  mouseDebugger: function(event) {
    event.preventDefault();
    const point = event.currentTarget;
    const field = point;

    var newX = ((event.pageX - field.offsetLeft) * 100) / field.offsetWidth;
    var newY = ((event.pageY - field.offsetTop) * 100) / field.offsetHeight;

    var pxX = event.pageX - field.offsetLeft;
    var pxY = event.pageY - field.offsetTop;

    var [normalizedX, normalizedY] = this.normalizeCoordinates(pxX, pxY);

    console.log(pxX, pxY, this.normalizeCoordinates(pxX, pxY));

    var descriptor = new ForceFieldDescriptor(normalizedX, normalizedY);
    console.log(descriptor.getClassNames());

  },

  componentDidMount: function() {
    this.renderField();
    $(window).resize(this.renderField);
    $('#field').mousemove(this.mouseDebugger);
  },

  renderField: function() {
    this.props.setLastRenderTimestamp(Date.now());

    var preferences = this.getPreferences();

    var fieldSize = preferences.fieldSize;
    var gridUnit = preferences.gridUnit;
    var gridUnit = preferences.gridUnit;

    var triangleSize = preferences.triangleSize;
    var minLengthForArrowsToDisplay = preferences.minLengthForArrowsToDisplay;

    var width = preferences.width - 5;
    var height = preferences.height - 5;

    //Creates overall svgContainer
    d3.select(".force-field-canvas").select('svg').remove();
    var svgContainer = d3.select(".force-field-canvas").append("svg").attr("width", width).attr("height", height)

    this.renderPoints(svgContainer);

    //Creates inner svgContainer for the inner Field
    var coreContainer = svgContainer.append("svg")
                                    .attr("width", fieldSize)
                                    .attr("height", fieldSize)
                                    .attr("x", Math.floor(width / 2 - fieldSize / 2))
                                    .attr("y", Math.floor(height / 2 - fieldSize / 2));

    coreContainer.append("rect")
                        .attr("class", "visual-debug")
                        .attr("width", fieldSize)
                        .attr("height", fieldSize)
                        .style("fill", "RGBA(255, 0, 0, 0.4)")

    //creates inner blue Circle for the Field
    coreContainer.append("circle")
                 .attr("cx", fieldSize/2)
                 .attr("cy", fieldSize/2)
                 .attr("r", Math.sqrt(2 * gridUnit * gridUnit))
                 .style("fill", "none")
                 .style("stroke-opacity", 1)
                 .style("stroke-width", 2)
                 .style("stroke", preferences.skin.marker);


    //Coordinates for the the edges as marker
    var characterMarkerCoordinates = [2 * gridUnit - 1/2 * gridUnit,2 * gridUnit,2 * gridUnit,2 * gridUnit,2 * gridUnit,2 * gridUnit - 1/2 * gridUnit].join()

    var g = coreContainer.append("g")
                 .attr("width", 10 * gridUnit)
                 .attr("height", 10 * gridUnit)
                 .attr("id", "chrome");

    [0, 90, 180, 270].forEach(function(deg) {
      g.append("polyline")
                     .attr("points", characterMarkerCoordinates)
                     .style("fill", "none")
                     .style("stroke-opacity", .7)
                     .style("stroke-width", 2)
                     .style("stroke", preferences.skin.marker)
                     .attr("transform", "rotate(" + deg + ", " + 10 * gridUnit + ", " + 10 * gridUnit + ")")

      g.append("circle")
                     .attr("r", 2.5)
                     .attr("cx", 5 * gridUnit)
                     .attr("cy", 5 * gridUnit)
                     .style("fill", preferences.skin.marker)
                     .attr("transform", "rotate(" + deg + ", " + 10 * gridUnit + ", " + 10 * gridUnit + ")")

    });

  },

  render: function() {
    const canvasStyle = this.getCanvasStyle();
    return <div className='force-field-canvas' style={canvasStyle}></div>
  },

  getCanvasStyle: function() {
    return {
      height: '100%',
      width: '100%',
    }
  }
}));

import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import {ForceArrow} from './components/Editor/Stage/Renderer/ForceArrow';
import {Forces} from './components/Editor/Stage/Renderer/Forces';
import {Grid} from './components/Editor/Stage/Renderer/Grid';
import {Marker} from './components/Editor/Stage/Renderer/Marker';
import {Renderer} from './components/Editor/Stage/Renderer';
import {Slider} from './components/Editor/Stage/Energy/Slider';
import {Energy} from './components/Editor/Stage/Energy';
import {StateProxy} from './components/state_proxy';

class SvgComponent extends Component {
  render() {
    const {origin, width, height} = this.props;
    return (
      <svg
        style={this.props.style}
        width={width}
        height={height}
        viewBox={`-${origin.x} -${origin.y} ${width} ${height}`}>
        {this.props.children}
      </svg>
    );
  }
}

SvgComponent.defaultProps = {
  width: 300,
  height: 300,
  origin: {x: 0, y: 0},
  style: {},
};

function normalizeCoordinates(x,y) {
  return [x,y];
}

function deNormalizeCoordinates(x,y) {
  return [x,y];
}

// const dotsInField = 20;
// const maximumFieldSize = Math.floor(Math.min(this.props.width, this.props.height)) - 50;
// const gridUnit = Math.floor(maximumFieldSize / dotsInField);
// const fieldSize = gridUnit * dotsInField
const energies = [
  {id: '1', x: 1, y: 1, strength: -2, isMuted: false},
  {id: '2', x: 10, y: 10, strength: 2, isMuted: false},
];

ReactDOM.render(
  <div style={{padding: '10px'}}>
    <h2>Forces</h2>
    <SvgComponent
      origin={{x: 150, y: 150}}
      style={{padding: '10px', backgroundColor: 'lightgray', overflow: 'visible'}}>
      {StateProxy(
        <Forces
          energies={energies}
          stageWidth={300}
          stageHeight={300}
          fieldSize={250}
          gridUnit={15}
          skin={{negativeArrow: '#ff0000', positiveArrow: '#00ff00'}}
          normalizeCoordinates={normalizeCoordinates}
        />
      )}
    </SvgComponent>
    <h2>ForceArrow</h2>
    <SvgComponent
      width={100}
      height={100}
      style={{backgroundColor: 'lightgray', overflow: 'visible'}}>
      {StateProxy(
        <ForceArrow
          x={50}
          y={50}
          x2={60}
          y2={60}
          deg={90}
          triangleSize={4}
          skin={{negativeArrow: '#ff0000', positiveArrow: '#00ff00'}}
          normalizeCoordinates={normalizeCoordinates}
        />
      )}
    </SvgComponent>
    <h2>Grid</h2>
    <SvgComponent origin={{x: 150, y: 150}} style={{padding: '10px', backgroundColor: 'lightgray', overflow: 'visible'}}>
      {StateProxy(
        <Grid
          gridUnit={15}
          dotsPerSide={5}
          skin={{dots: '#ff0000'}}
          normalizeCoordinates={normalizeCoordinates}
        />
      )}
    </SvgComponent>
    <h2>Marker</h2>
    <SvgComponent
      origin={{x: 150, y: 150}}
      style={{padding: '10px', backgroundColor: 'lightgray', overflow: 'visible'}}>
      {StateProxy(
        <Marker
          gridUnit={15}
          skin={{marker: '#ff0000'}}
        />
      )}
    </SvgComponent>
    <h2>Renderer</h2>
    {StateProxy(
      <Renderer
        width={300}
        height={300}
        fieldSize={250}
        gridUnit={15}
        triangleSize={4}
        minLengthForArrowsToDisplay={2}
        normalizeCoordinates={normalizeCoordinates}
        skin={{
          background: 'rgba(150,150,0,0.4)',
          dots: '#ff0000',
          marker: '#00ff00',
          negativeArrow: '#ff0000',
          positiveArrow: '#00ff00'
        }}
      />
    )}
    <h2>Slider</h2>
    {StateProxy(
      <Slider value={3} isPresentation={false} onChange={(value) => console.log(`Slider.onChange(${value})`)} />
    )}
    <h2>Energy</h2>
    {StateProxy(
      <Energy
        id={1}
        x={0}
        y={0}
        isMuted={true}
        strength={2}
        isPresentation={false}
        normalizeCoordinates={normalizeCoordinates}
        deNormalizeCoordinates={deNormalizeCoordinates}
        onEdit={(e) => console.log(`Energy.onEdit()`)} />
    )}
    {StateProxy(
      <Energy
        id={2}
        x={33}
        y={44}
        isMuted={false}
        isEditing={true}
        strength={2}
        isPresentation={false}
        normalizeCoordinates={normalizeCoordinates}
        deNormalizeCoordinates={deNormalizeCoordinates}
        onEdit={(e) => console.log(`Energy.onEdit()`)} />
    )}
    {StateProxy(
      <Energy
        id={3}
        x={77}
        y={80}
        isMuted={false}
        strength={-3}
        isPresentation={false}
        normalizeCoordinates={normalizeCoordinates}
        deNormalizeCoordinates={deNormalizeCoordinates}
        onEdit={(e) => console.log(`Energy.onEdit()`)} />
    )}
  </div>,
  document.getElementById('component-library')
);

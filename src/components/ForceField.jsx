import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import {connect} from 'react-redux';
import EditBar from './ForceField/EditBar';
import Point from './ForceField/Point';
import * as actionCreators from '../action_creators'

export const ForceField = React.createClass({
  mixins: [PureRenderMixin],

  getPoints: function() {
    return this.props.points || [];
  },

  render: function() {
    var forceFieldStyle = this.getForceFieldStyle();

    return <div className="force-field">

      <div className="force-field-stage" style={forceFieldStyle} >
        {this.getPoints().map(point =>
          <Point key={point.get('id')}
                 id={point.get('id')}
                 x={point.get('x')}
                 y={point.get('y')}
                 strength={point.get('strength')}
                 editPoint={this.props.editPoint}
                 movePoint={this.props.movePoint}
          />
        )}
      </div>
      <EditBar editingPoint={this.props.editingPoint} addPoint={this.props.addPoint} deletePoint={this.props.deletePoint} setStrength={this.props.setStrength}/>
    </div>;
  },

  getForceFieldStyle: function() {
    return {
      fontFamily: 'Roboto, sans-serif',
      position: 'relative',
      margin: '0 auto',
      width: '560px',
      height: '560px',
      transition: 'width 0.2s, height 0.2s',
    }
  }
});

function mapStateToProps(state) {
  return {
    points: state.get('points'),
    editingPoint: state.get('editingPoint')
  };
}

export const ForceFieldContainer = connect(mapStateToProps, actionCreators)(ForceField);
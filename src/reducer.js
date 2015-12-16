import {Map} from 'immutable';
import {ForceFieldCalculationSingleton, coordinateSystemTransformation} from './ForceFieldCalculation'

function setState(state, newState) {
  var newEnergies = coordinateSystemTransformation(newState.get('energies').toJS())

  ForceFieldCalculationSingleton.getInstance().setEnergies(newEnergies);
  return state.merge(newState);
}

function moveEnergy(state, newEnergy) {
  state.set('editingEnergy', newEnergy)
  var newEnergies = state.get('energies').map(function(energy) {
    if (energy.get('id') == newEnergy.id) {
      return energy.merge(newEnergy);
    } else {
      return energy
    }
  });

  return state.set('energies', newEnergies);
}

function addEnergy(state, energy) {
  const currentEnergies = state.get('energies');
  const nextID = (currentEnergies.size > 0) ? (currentEnergies.max().get('id') + 1) : 1;
  const newEnergies = currentEnergies.push(Map({id: nextID, x: energy.x, y: energy.y, strength: energy.strength || 0}));
  return state.set('energies', newEnergies);
}

function editEnergy(state, energy) {
  return state.set('editingEnergy', energy)
}

function setLastRenderTimestamp(state, timestamp) {
  return state.set('lastTimestamp', timestamp)
}

function setPresentationState(state, presentation = false) {
  return state.set('isPresentation', presentation)
}

function deleteEnergy(state) {
  var deletingEnergyId = state.getIn(['editingEnergy', 'id'])
  var newEnergies = state.get('energies').filter(function(energy) {
    return energy.get('id') !== deletingEnergyId;
  });
  return state.set('editingEnergy', null).set('energies', newEnergies);
}

function setStrength(state, newStrength) {
  var energyId = state.getIn(['editingEnergy', 'id'])

  var newEnergies = state.get('energies').map(function(energy) {
    if (energy.get('id') == energyId) {
      return energy.set('strength', newStrength);
    } else {
      return energy
    }
  });

  return state.setIn(['editingEnergy', 'strength'], newStrength).set('energies', newEnergies);
}

export default function(state = Map(), action) {
  switch (action.type) {
  case 'SET_STATE':
    return setState(state, action.state);
  case 'MOVE_ENERGY':
    return setState(state, moveEnergy(state, action.energy));
  case 'ADD_ENERGY':
    return setState(state, addEnergy(state, action.energy));
  case 'DELETE_ENERGY':
    return setState(state, deleteEnergy(state))
  case 'EDIT_ENERGY':
    return setState(state, editEnergy(state, action.energy))
  case 'SET_STRENGTH':
    return setState(state, setStrength(state, action.strength))
  case 'SET_PRESENTATION':
    return setState(state, setPresentationState(state, action.presentation))
  }

  return state;
}

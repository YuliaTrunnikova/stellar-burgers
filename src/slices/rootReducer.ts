import { combineReducers } from '@reduxjs/toolkit';
import stellarBurgerSlice from './StellarBurgerSlice';

const rootReducer = combineReducers({
  burgers: stellarBurgerSlice
});

export default rootReducer;

'use strict';

var numBetLevels = 24;

// How much money (cash) each player starts with.
var MONEY_PER_PLAYER = 600;

var maxPrice = 10
var cheapestPrice = 3/maxPrice

function getBetPrice(i) {
  return Math.ceil(maxPrice * Math.pow( cheapestPrice, i / (numBetLevels-1) ))
}

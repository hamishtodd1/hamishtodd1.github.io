'use strict';

var numBetLevels = 24;

// Bet and money boxes are RECTANGLES. Their height is whatever the layout
// derives; this is their width as a proportion of that height. 1 = square.
var boxWidthPerHeight = 1.4;

var maxPrice = 10;
var cheapestPriceProportion = 0.3;

// How much money (cash) each player starts with.
var MONEY_PER_PLAYER = Math.ceil(maxPrice * numBetLevels * 0.7); //0.7 is eyeballed

function getBetPrice(i) { // i == 0 is the TOP one, bottom is i = numBetLevels-1
  let power = (i+1) / (numBetLevels-1);

  return Math.floor(maxPrice * Math.pow( cheapestPriceProportion, power ))
}
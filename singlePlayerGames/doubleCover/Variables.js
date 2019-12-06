//-----Mathematical constants
var TAU = Math.PI * 2;
var PHI = (1+Math.sqrt(5)) / 2;
var zAxis = new THREE.Vector3(0,0,1); //also used as a placeholder normal
var yAxis = new THREE.Vector3(0,1,0);
var xAxis = new THREE.Vector3(1,0,0);

//-----Fundamental
var ourclock = new THREE.Clock( true ); //.getElapsedTime ()
var delta_t = 0;
var logged = 0;
var debugging = 0;

var isMobileOrTablet = false;

//Static. At least in some sense.
var gentilis;

var scene;
var camera;

THREE.Quaternion.prototype.distanceTo = function(q2)
{
	var theta = Math.acos(this.w*q2.w + this.x*q2.x + this.y*q2.y + this.z*q2.z);
	return theta;
}
THREE.Quaternion.prototype.fourDAngleTo = function(q2)
{
	return Math.acos(this.w*q2.w + this.x*q2.x + this.y*q2.y + this.z*q2.z);
}
THREE.Quaternion.prototype.negate = function()
{
	this.x *= -1;
	this.y *= -1;
	this.z *= -1;
	this.w *= -1;
}
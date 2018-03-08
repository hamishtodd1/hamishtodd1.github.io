/*
	Visual beauty is also a factor, as is number of objects. That's how you get Turner, Escher in there

	Simple controls. The reason you like platformers...

	Sandwich space

	you can use color. That comes in when you smoosh things down

	turtle geometry is good but low "learning/minute"
	Direction I'd like to go in

	"Smoosh a scale down to nothing"

	"the real political spectrum".
	At least add "compassion" - some people are conservative for right or wrong reasons
	And hey, some people are surely left wing because they are lazy

	Two planes, both with points in them; move one point around changes where the other plane is coming from

	Complex plane: there are two planes.
		Click the number, and the number it maps to is highlighted in the other
		Number or numbers. Depending on function it could be line or loop
		And maybe you could click a patch, or get the boundary of a patch, or draw a line
		And you could use this to capture things or see if loops close up? That's proper math
	This could be done with a frag shader

*/

function initMyGraph()
{
	var display = new THREE.Group();

	var visualBounds = new THREE.Mesh(new THREE.BoxGeometry(1,1,1), new THREE.MeshPhongMaterial());
	visualBounds.geometry.applyMatrix(new THREE.Matrix4().makeTranslation(0.5,0.5,0.5));
	display.add(visualBounds);

	function DataPoint(name,coords)
	{
		var representation = new THREE.Mesh(new THREE.SphereGeometry(0.01), new THREE.MeshPhongMaterial({color:0x000000}));
		display.add(representation)
		representation.position.set(coords[0],coords[1],coords[2]);

		var sign = makeTextSign(name);
		sign.position.copy(representation.position)
	}
	DataPoint.prototype.update = function()
	{
		this.visible = (this.position.distanceTo(viewingHyperPlane) < 0.01);
		if(hovering)
		{
			sign.visible = false;
		}
	}

	var dataPoints = [];
	//	proportion of learning that is interactive		worldliness		rigor		average stuff learned per minute		visual beauty?
	dataPoints.push(DataPoint("Engare",
		[1.0,											0.4,			1.0,		0.9]));
	dataPoints.push(DataPoint("Virus, the Beauty of the Beast",
		[0.35,											1.0,			0.8,		0.8]));
	dataPoints.push(DataPoint("Earth: a Primer",
		[0.65,											0.9,			0.9,		0.6]));
	dataPoints.push(DataPoint("Parable of the Polygons",
		[0.5,											1.0,			0.7,		0.9]));
	dataPoints.push(DataPoint("Working with turtle geometry",
		[0.9,											0.5,			1.0,		0.3]));
	dataPoints.push(DataPoint("Aban Hawkins and the 1000 Spikes",
		[1.0,											0.2,			1.0,		0.6]));
	dataPoints.push(DataPoint("Dichronauts",
		[0.1,											0.2,			0.5,		0.4]));
	dataPoints.push(DataPoint("Bond Breaker",
		[0.8,											0.9,			0.9,		0.8]));

}
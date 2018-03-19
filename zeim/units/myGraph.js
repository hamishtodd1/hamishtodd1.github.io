/*
	want to mark 0 and 1

	Visual beauty is also a factor, as is number of objects. That's how you get Turner, Escher in there

	Simple controls. The reason you like platformers...


	you can use color. That comes in when you smoosh things down

	turtle geometry is good but low "learning/minute"
	Direction I'd like to go in

	"Smoosh a scale down to nothing"

	"the real political spectrum".
	At least add "compassion" - some people are conservative for right or wrong reasons
	And hey, some people are surely left wing because they are lazy
	Sandwich space, political space, personality space (gender)

	Two planes, both with points in them; move one point around changes where the other plane is coming from

	Complex plane: there are two planes.
		Click the number, and the number it maps to is highlighted in the other
		Number or numbers. Depending on function it could be line or loop
		And maybe you could click a patch, or get the boundary of a patch, or draw a line
		And you could use this to capture things or see if loops close up? That's proper math
	This could be done with a frag shader

	Script
		I'm not looking to make value judgements here
*/

function initMyGraph()
{
	var display = new THREE.Group();
	var displaySize = 0.2;
	display.scale.setScalar(displaySize)
	display.position.z = -0.5;
	display.position.x -= displaySize/2;
	display.position.y -= displaySize/2;
	scene.add(display);

	markedThingsToBeUpdated.push(display)
	display.update = function()
	{
		if(mouse.clicking && mouse.lastClickedObject === visualBounds.volumeMesh)
		{
			var oldCenterWorld = worldClone(visualBounds.volumeMesh.geometry.boundingSphere.center,display);

			var angle = 3 * mouse.ray.direction.angleTo(mouse.previousRay.direction);
			var axis = mouse.ray.direction.clone().cross(mouse.previousRay.direction).normalize(); //put it in object space?
			axis.applyQuaternion(display.quaternion.clone().inverse());
			var quat = new THREE.Quaternion().setFromAxisAngle(axis,angle);
			display.quaternion.multiply(quat);

			var newCenterWorld = worldClone(visualBounds.volumeMesh.geometry.boundingSphere.center,display);
			display.position.sub(newCenterWorld).add(oldCenterWorld);
		}
	}

	var cubeCoords = [
			0,0,0,
			1,0,0,
			0,1,0,
			1,1,0,

			0,0,1,
			1,0,1,
			0,1,1,
			1,1,1,
			];
	var facesData = JSON.parse( "[[2,0,1,3],[2,6,4,0],[7,6,2,3],[7,5,4,6],[3,1,5,7],[4,5,1,0]]" );
	var visualBounds = Shape(cubeCoords,facesData, 1);
	visualBounds.verticesMesh.material.color.setRGB(0,0,0)
	visualBounds.volumeMesh.material.transparent = true;
	visualBounds.volumeMesh.material.color.setRGB(0x0000FF)
	visualBounds.volumeMesh.material.opacity = 0.3;
	visualBounds.volumeMesh.geometry.computeBoundingSphere();
	
	display.add(visualBounds);

	{
		var axisLabels = [];
		axisLabels[0] = makeTextSign("worldliness");
		axisLabels[1] = makeTextSign("rigor");
		axisLabels[2] = makeTextSign("proportion of learning that is interactive");
		for(var i = 0; i < axisLabels.length; i++)
		{
			//y goes to -x, z goes to -y, x goes to -y
			markedThingsToBeUpdated.push(axisLabels[i])
			axisLabels[i].material.color.setRGB(0.3,0.9,0.6)
			axisLabels[i].update = rotateToFaceCamera;
			axisLabels[i].position.setComponent(i,0.5)
			if(i===1)
			{
				axisLabels[i].position.x = -axisLabels[i].scale.x * 0.05
			}
			else
			{
				axisLabels[i].position.y = -0.08
			}
			axisLabels[i].scale.multiplyScalar(0.1)
			display.add(axisLabels[i]);
		}
	}

	{
		var fourthValue = 1;
		function changeValue(newValue)
		{
			fourthValue = newValue;
		}
		ourSlider = SliderSystem(changeValue, fourthValue, true);
		markedThingsToBeUpdated.push(ourSlider)
		scene.add(ourSlider)
		ourSlider.scale.multiplyScalar(0.1)
		ourSlider.position.set(-0.16,-0.1,-0.4)
		ourSlider.rotation.z = TAU / 4;
		console.log(ourSlider.position)
	}

	var lastDataPointClicked = null;

	var surfacesMaterial = new THREE.MeshPhongMaterial({
		color:0x0000FF,
		transparent:true,
		opacity:0.3,
		side:THREE.DoubleSide
	})
	var pointRadius = 0.03
	var pointGeometry = new THREE.SphereGeometry(pointRadius);
	function DataPoint(name,coords)
	{
		var dataPoint = new THREE.Mesh(pointGeometry, new THREE.MeshPhongMaterial({color:0xFF0000}));
		display.add(dataPoint)
		dataPoint.position.set(coords[0],coords[1],coords[2]);

		{
			var tracers = Array(3)
			for(var i = 0; i < 3; i++)
			{
				tracers[i] = new THREE.Mesh(new THREE.CylinderBufferGeometryUncentered(pointRadius/4,1),new THREE.MeshPhongMaterial({color:0x808080}))
				tracers[i].position.copy(dataPoint.position);
				tracers[i].position.setComponent(i,0);
				tracers[i].scale.y = dataPoint.position.getComponent(i);
				display.add(tracers[i])
			}
			tracers[0].rotation.z = -TAU / 4;
			tracers[2].rotation.x = TAU / 4;

			var surfaces = new THREE.Mesh(new THREE.BoxGeometry(coords[0],coords[1],coords[2]), surfacesMaterial);
			surfaces.position.set(coords[0]/2,coords[1]/2,coords[2]/2);
			var unusedFaces = [2,3,6,7,10,11];
			for(var i = 0; i < unusedFaces.length; i++)
			{
				surfaces.geometry.faces[unusedFaces[i]].set(0,0,0)
			}
			display.add(surfaces);
		}

		var sign = makeTextSign(name);
		sign.scale.multiplyScalar(pointRadius*2)
		sign.position.y = -pointRadius*2
		dataPoint.add(sign)
		markedThingsToBeUpdated.push(sign);
		sign.update = rotateToFaceCamera;

		markedThingsToBeUpdated.push(dataPoint)
		clickables.push(dataPoint)
		dataPoint.onClick = function()
		{
			lastDataPointClicked = this;
		}
		dataPoint.update = function()
		{
			this.visible = Math.abs( coords[3] - fourthValue ) < 0.1;

			sign.visible = ( lastDataPointClicked === this) && this.visible;
			surfaces.visible = sign.visible;
			for(var i = 0; i < 3; i++)
			{
				tracers[i].visible = sign.visible;
			}
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
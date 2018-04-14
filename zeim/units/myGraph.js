/*
	Could totes tween the surfaces

	Not sure whether surfaces should disappear when you change learning density!

	Visual beauty is also a factor, as is number of objects. That's how you get Turner, Escher in there

	Simple controls. The reason you like platformers...

	Feels like, whatever number of dimensions you have, two is the max you ever want to see plotted

	you can use color. That comes in when you smoosh things down

	Your cursor is visible?

	Could make it so each axis is r, g, b. The points are colored with the rgb values

	"Smoosh a scale down to nothing"
	Swap the unseen dimension obv, or rearrange those that are there
	click a side of the graph, it rotates around so that's the only side you see

	Smoosh it down to a single scale and you see a simple "ranking"

	"the REAL political spectrum", with that dumb one crossed out
		At least add "compassion" - some people are conservative for right or wrong reasons
		And hey, some people are surely left wing because they want to laze around on benefits
		Eh, that's more "personality space"
		When you vote, you're maybe choosing who you're closer to
		Sandwich space, political space, personality space (gender)

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
	var displaySize = 0.8;
	display.scale.setScalar(displaySize)
	display.position.z = -displaySize * 18;
	display.position.x -= displaySize / 2;
	display.position.y -= displaySize / 2;
	markPositionAndQuaternion( display );
	scene.add(display);

	var userHasClickedAPoint = false;

	markedThingsToBeUpdated.push(display)
	display.update = function()
	{
		if(mouse.clicking && display.children.includes(mouse.lastClickedObject) )
		{
			var oldCenterWorld = worldClone(visualBounds.geometry.boundingSphere.center,display);

			var angle = 20 * mouse.ray.direction.angleTo(mouse.previousRay.direction);
			var axis = mouse.ray.direction.clone().cross(mouse.previousRay.direction).normalize(); //put it in object space?
			axis.applyQuaternion(display.quaternion.clone().inverse());
			var quat = new THREE.Quaternion().setFromAxisAngle(axis,angle);
			display.quaternion.multiply(quat);

			var newCenterWorld = worldClone(visualBounds.geometry.boundingSphere.center,display);
			display.position.sub(newCenterWorld).add(oldCenterWorld);
		}

		if(!userHasClickedAPoint)
		{
			var sinTime = Math.sin( ourClock.elapsedTime * 9 );
			for(var i = 0, il = pointGeometry.vertices.length; i < il; i++)
			{
				pointGeometry.vertices[i].setLength( pointRadius * (1.4 + 0.4 * sinTime) );
			}
			pointGeometry.verticesNeedUpdate = true;
			pointMaterial.emissive.r = 0.5 - 0.4 * sinTime;
		}
	}

	var visualBounds = new THREE.Mesh(new THREE.OriginCorneredPlaneGeometry(), new THREE.MeshPhongMaterial({
		transparent:true,
		opacity:0.3, 
		color:0xFF0000}));
	clickables.push(visualBounds)
	var axes = Array(3);
	var squareGeo = new THREE.OriginCorneredPlaneGeometry();
	for(var i = 0; i < 3; i++)
	{
		axes[i] = new THREE.Mesh(new THREE.CylinderBufferGeometryUncentered(0.03,1,16,true), new THREE.MeshPhongMaterial({color:0x000000, transparent:true,opacity:0.7}))
		clickables.push(axes[i])
		display.add(axes[i]);
	}
	var side = squareGeo.clone().applyMatrix(new THREE.Matrix4().makeRotationY(TAU/4)).applyMatrix(new THREE.Matrix4().makeTranslation(0,0,1))
	visualBounds.geometry.merge(side);
	var bottom = squareGeo.clone().applyMatrix(new THREE.Matrix4().makeRotationX(-TAU/4)).applyMatrix(new THREE.Matrix4().makeTranslation(0,0,1))
	visualBounds.geometry.merge(bottom);
	axes[0].rotation.z =-TAU / 4;
	axes[2].rotation.x = TAU / 4;
	visualBounds.geometry.computeBoundingSphere();
	
	display.add(visualBounds);

	{
		var fourthValue = 1;
		function changeValue(newValue)
		{
			fourthValue = newValue;
		}
		ourSlider = SliderSystem(changeValue, fourthValue, true, function(){},true);
		markedThingsToBeUpdated.push(ourSlider)
		scene.add(ourSlider)
		ourSlider.scale.multiplyScalar(display.scale.x / 2)
		ourSlider.position.set(
			-display.scale.x * 1.2,
			display.position.y + ourSlider.scale.x/2,
			display.position.z)
		ourSlider.rotation.z = TAU / 4;
	}

	{
		var axisLabels = [];
		axisLabels[0] = makeTextSign('Proportion of learning that is interactive("fun")');

		axisLabels[1] = makeTextSign("Worldliness / applicability");
		axisLabels[2] = makeTextSign("Rigor");
		axisLabels[3] = makeTextSign('Learning "density"');
		for(var i = 0; i < 3; i++)
		{
			markPositionAndQuaternion(axisLabels[i])
			axisLabels[i].material.color.setRGB(0.3,0.9,0.6)
			if(i < 3)
			{
				axisLabels[i].position.setComponent(i,0.5)
				markedThingsToBeUpdated.push(axisLabels[i])
				axisLabels[i].update = rotateToFaceCamera;
			}
			if( i===1 )
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
		// axisLabels[3].scale.multiplyScalar(0.1)
		ourSlider.add(axisLabels[3])
		axisLabels[3].material.color.setRGB(0.3,0.9,0.6)
		axisLabels[3].scale.x /= ourSlider.scale.x;
		axisLabels[3].scale.y /= ourSlider.scale.y;
		axisLabels[3].scale.multiplyScalar(axisLabels[0].scale.y*axisLabels[0].parent.scale.y)
		axisLabels[3].position.y = -1.2 * axisLabels[3].scale.y;
		axisLabels[3].position.x = 0.5;
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
	var pointMaterial = new THREE.MeshPhongMaterial({color:0xFF0000});
	function DataPoint(name,coords)
	{
		for(var i = 0; i < dataPoints.length; i++ )
		{
			for(var j = 0; j < coords.length; j++)
			{
				if(dataPoints[i].coords[j] !== coords[j])
				{
					break;
				}
				if(j === coords.length-1)
				{
					console.error("overlap: ",name,dataPoints[i].name)
					return;
				}
			}
		}

		var dataPoint = new THREE.Mesh(pointGeometry, pointMaterial);
		markObjectProperty( dataPoint, "visible" );
		dataPoint.coords = coords;
		dataPoint.name = name;
		display.add(dataPoint)
		dataPoint.position.set(coords[0],coords[1],coords[2]);

		{
			var tracers = Array(3)
			for(var i = 0; i < 3; i++)
			{
				tracers[i] = new THREE.Mesh(new THREE.CylinderBufferGeometry(pointRadius*1.5,pointRadius*1.5, 0.02),new THREE.MeshPhongMaterial({color:0x808080}))
				tracers[i].position.copy(dataPoint.position);
				tracers[i].position.setComponent((i+1)%3,0);
				tracers[i].position.setComponent((i+2)%3,0);
				markObjectProperty( tracers[i], "visible" )
				display.add(tracers[i])
			}
			tracers[0].rotation.z = -TAU / 4;
			tracers[2].rotation.x = TAU / 4;

			var surfaces = new THREE.Mesh(new THREE.BoxGeometry(coords[0]+0.0005,coords[1]+0.0005,coords[2]+0.0005), surfacesMaterial);
			surfaces.position.set(coords[0]/2,coords[1]/2,coords[2]/2);
			var unusedFaces = [2,3,6,7,10,11];
			for(var i = 0; i < unusedFaces.length; i++)
			{
				surfaces.geometry.faces[unusedFaces[i]].set(0,0,0)
			}
			display.add(surfaces);
			markObjectProperty( surfaces, "visible" );
		}

		var sign = makeTextSign(name);
		markObjectProperty( sign, "visible" );
		markPositionAndQuaternion(sign)
		sign.scale.multiplyScalar(pointRadius*2)
		var originalSignScale = sign.scale.clone();
		sign.position.y = -pointRadius*2
		dataPoint.add(sign)
		markedThingsToBeUpdated.push(sign);
		sign.update = rotateToFaceCamera;

		markedThingsToBeUpdated.push(dataPoint)
		clickables.push(dataPoint)
		dataPoint.onClick = function()
		{
			lastDataPointClicked = this;
			if(!userHasClickedAPoint)
			{
				userHasClickedAPoint = true;
				for(var i = 0, il = pointGeometry.vertices.length; i < il; i++)
				{
					pointGeometry.vertices[i].setLength( pointRadius );
				}
				pointGeometry.verticesNeedUpdate = true;
				pointMaterial.emissive.r = 0;
			}
		}
		dataPoint.update = function()
		{
			this.visible = Math.abs( coords[3] - ourSlider.children[0].position.x ) < 0.0501;

			surfaces.visible = ( lastDataPointClicked === this) && this.visible;
			for(var i = 0; i < 3; i++)
			{
				tracers[i].visible = surfaces.visible;
			}
		}

		return dataPoint
	}

	var dataPoints = [];
	//need visualization of mouse
	//	proportion of learning that is interactive		worldliness		rigor		average stuff learned per minute		visual beauty?
	dataPoints.push(DataPoint("Portal",
		[0.9,											0.6,			1.0,		1.0]));
	dataPoints.push(DataPoint("Nano Pandas",
		[1.0,											0.65,			0.9,		0.7]));
	dataPoints.push(DataPoint("Miegakure",
		[0.95,											0.6,			1.0,		1.0]));
	dataPoints.push(DataPoint("Perspective",
		[1.0,											0.7,			1.0,		0.9]));
	dataPoints.push(DataPoint("Naya's Quest",
		[1.0,											0.55,			1.0,		1.0]));
	dataPoints.push(DataPoint("What I'll aim for",
		[0.7,											0.85,			0.9,		1.0]));
	dataPoints.push(DataPoint("VVVVVV",
		[1.0,											0.2,			1.0,		0.8]));
	dataPoints.push(DataPoint("World of Goo",
		[1.0,											0.6,			0.9,		0.8]));
	dataPoints.push(DataPoint("Incredipede",
		[1.0,											0.65,			0.9,		0.8]));
	dataPoints.push(DataPoint("Virus, the Beauty of the Beast",
		[0.35,											1.0,			0.8,		0.8]));
	dataPoints.push(DataPoint("Earth: a Primer",
		[0.65,											0.9,			0.9,		0.7]));
	dataPoints.push(DataPoint("Parable of the Polygons",
		[0.6,											1.0,			0.7,		1.0]));
	dataPoints.push(DataPoint("Most EEs",
		[0.75,											0.9,			0.8,		0.9]));
	dataPoints.push(DataPoint("Braid",
		[0.9,											0.75,			1.0,		1.0]));

	//----So that there's something to scroll to
	dataPoints.push(DataPoint("Aban Hawkins and the 1000 Spikes",
		[1.0,											0.1,			1.0,		0.7]));
	dataPoints.push(DataPoint("Teaching oneself turtle geometry",
		[0.9,											0.5,			1.0,		0.3]));
	dataPoints.push(DataPoint("Dichronauts",
		[0.1,											0.3,			0.7,		0.5]));
	dataPoints.push(DataPoint("Bond Breaker",
		[0.8,											0.9,			0.9,		0.8]));
	dataPoints.push(DataPoint("Sim City",
		[1.0,											0.9,			0.5,		0.2]));
	dataPoints.push(DataPoint("No-context Falstad",
		[1.0,											0.7,			1.0,		0.2]));
	dataPoints.push(DataPoint("No-context Hypernom",
		[1.0,											0.7,			1.0,		0.3]));
	dataPoints.push(DataPoint("No-context A Slower Speed Of Light",
		[0.9,											0.8,			1.0,		0.1]));
	dataPoints.push(DataPoint("Werner Herzog documentary",
		[0.0,											0.8,			0.6,		0.8]));
	dataPoints.push(DataPoint("David Attenborough documentary",
		[0.0,											0.7,			0.8,		0.7]));
	dataPoints.push(DataPoint("Brian Cox documentary",
		[0.0,											0.6,			0.7,		0.5]));
	dataPoints.push(DataPoint("A rigorous newspaper",
		[0.0,											1.0,			0.7,		0.9]));

	//----Corners
	dataPoints.push(DataPoint("Bejeweled",
		[1.0,											0.1,			0.0,		0.0]));
	dataPoints.push(DataPoint("Farmville",
		[1.0,											0.9,			0.0,		0.0]));
	dataPoints.push(DataPoint("Martin Gardner book",
		[0.0,											0.1,			1.0,		0.9]));
	dataPoints.push(DataPoint("Richard Feynman book",
		[0.0,											0.9,			0.9,		0.9]));
	dataPoints.push(DataPoint("Godel Escher Bach",
		[0.2,											0.6,			0.8,		0.9]));
	//Collective dynamics of small world networks?

	/*
		Script
			Ultimately, there is a rigor-worldliness tradeoff in maths and science and that's happenning with us
			Anything that isn't maths or isn't game design is not rigorous
			Some of this, especially the rigor stuff, comes from the actual argument that I'm making

			Ultimately there will always be a negative correlation between rigor and worldliness, any philosopher of science can tell you that
			What is both non-trivial and an important constraint for EE makers is this fact that worldliness also negatively correlates with interactiveness
			Only when learning density is high though?

			"Sim City" - you're not necessarily more rigorous
			Turtle learning is wonderful but it's philosophically different from what I'm after

			If you're learning a lot, and it's interactive, then it is almost by definition rigorous

			Gotta admit, this was a line that I was fitting myself so obviously there's room for deception here,
			but my point might be that if you agree with me about point placement then you should probably agree that these trends exist

			"The bug with opacity is unintentional, sorry about that folks"


			v2
				These are all just me making up some numbers
				Pretty much everything with high learning density ends up in this
				There's a certain trend
	*/
}
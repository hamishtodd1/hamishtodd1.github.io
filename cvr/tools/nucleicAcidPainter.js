/*
	pucker of the ribose to the base-phosphate perpendicular
		http://x3dna.org/highlights/sugar-pucker-correlates-with-phosphorus-base-distance
*/

function initNucleicAcidPainter()
{
	var nucleicAcidPainter = new THREE.Object3D();
	scene.add(nucleicAcidPainter)
	
	var radius = 0.05;
	var ball = new THREE.Mesh(new THREE.EfficientSphereBufferGeometry(radius), new THREE.MeshLambertMaterial({transparent:true,color:0x00FF00, opacity: 0.7}));
	nucleicAcidPainter.add( ball );
	ball.geometry.computeBoundingSphere();
	nucleicAcidPainter.boundingSphere = ball.geometry.boundingSphere;

	holdables.push(nucleicAcidPainter)

	var label = makeTextSign( "NucleicAcidPainter" );
	label.position.z = radius;
	label.scale.setScalar(radius/3)
	nucleicAcidPainter.add(label);

	//different segments. Do not screw around lightly, their positions are expected to be where they currently are
	{
		var guaninePdbRead = {
			elements:["O","N","N","N","N","N","C","C","C","C","C","C"],
			coords:[
				22.727, -21.860, 0.000,

				22.727, -26.480, 0.000,
				25.518, -23.701, 0.000,
				25.518, -26.179, 0.000,
				21.393, -24.170, 0.000,
				20.059, -26.480, 0.000,

				24.060, -24.170, 0.000,
				24.060, -25.710, 0.000,
				22.727, -23.400, 0.000,
				21.393, -25.710, 0.000,
				26.416, -24.940, 0.000,

				26.012, -27.701, 0.000
			]
		}
		
		var guanineBondData = [[[[],[],1,6,7],[[],[],1,6,8]],[],[[[],[],1,0,8]],[[[],[],1,1,7],[[],[],1,1,9],[[],[],1,2,6],[[],[],1,2,10],[[],[],1,3,7],[[],[],1,3,10],[[],[],1,3,11],[[],[],1,4,8],[[],[],1,4,9],[[],[],1,5,9]],[],[],[],[],[],[]];


		//other nucleobases
		var adeninePdbRead = {
			elements:["N","N","N","N","N","C","C","C","C","C"],
			coords:[
				new THREE.Vector3( 7.205,   0.231,   0.000),
				new THREE.Vector3( 7.205,  -2.248,   0.000),
				new THREE.Vector3( 4.414,  -2.549,   0.000),
				new THREE.Vector3( 3.080,  -0.239,   0.000),
				new THREE.Vector3( 4.414,   2.071,   0.000),
				new THREE.Vector3( 5.747,  -0.239,   0.000),
				new THREE.Vector3( 5.747,  -1.779,   0.000),
				new THREE.Vector3( 4.414,   0.531,   0.000),
				new THREE.Vector3( 8.103,  -1.009,   0.000),
				new THREE.Vector3( 3.080,  -1.779,   0.000),
			]
			
		}

		var thyminePdbRead = {
			elements:["C","C","C","N","C","O","N","C","O"],
			coords:[
				new THREE.Vector3( 4.001,   2.310,   0.000),
				new THREE.Vector3( 2.667,   1.540,   0.000),
				new THREE.Vector3( 2.667,   0.000,   0.000),
				new THREE.Vector3( 1.334,  -0.770,   0.000),
				new THREE.Vector3( 0.000,   0.000,   0.000),
				new THREE.Vector3(-1.334,  -0.770,   0.000),
				new THREE.Vector3( 0.000,   1.540,   0.000),
				new THREE.Vector3( 1.334,   2.310,   0.000),
				new THREE.Vector3( 1.334,   3.850,   0.000),
			]
		}

		var cytosinePdbRead = {
			elements:["H","C","C","N","C","O","N","C","N"],
			coords:[
				new THREE.Vector3( 4.001,   2.310,   0.000),
				new THREE.Vector3( 2.667,   1.540,   0.000),
				new THREE.Vector3( 2.667,   0.000,   0.000),
				new THREE.Vector3( 1.334,  -0.770,   0.000),
				new THREE.Vector3( 0.000,   0.000,   0.000),
				new THREE.Vector3(-1.334,  -0.770,   0.000),
				new THREE.Vector3( 0.000,   1.540,   0.000),
				new THREE.Vector3( 1.334,   2.310,   0.000),
				new THREE.Vector3( 1.334,   3.850,   0.000),
			]
		}

		var uracilPdbRead = {
			elements:["O","C","N","C","C","C","O","N"],
			coords:[
				new THREE.Vector3( 4.001,  -0.770,   0.000),
				new THREE.Vector3( 2.667,   0.000,   0.000),
				new THREE.Vector3( 1.334,  -0.770,   0.000),
				new THREE.Vector3( 0.000,   0.000,   0.000),
				new THREE.Vector3( 0.000,   1.540,   0.000),
				new THREE.Vector3( 1.334,   2.310,   0.000),
				new THREE.Vector3( 1.334,   3.850,   0.000),
				new THREE.Vector3( 2.667,   1.540,   0.000)
			]
		}

		var usefulConstant = 1.6/Math.sqrt(3);
		var phosphatePdbRead = {
			elements:["P", "O","O","O","O"],
			coords:[
				 0,0,0,

				 usefulConstant, usefulConstant, usefulConstant,
				-usefulConstant,-usefulConstant, usefulConstant,
				-usefulConstant, usefulConstant,-usefulConstant,
				 usefulConstant,-usefulConstant,-usefulConstant
			]
		}
		var phosphateBondData = [[],[],[],[],[],[],[[[],[],1,0,1],[[],[],1,0,2],[[],[],1,0,3],[[],[],1,0,4]],[],[],[]];

		var connectingAtomsPdbRead = {
			elements:["O", "C","C","C","C","C", "O","O"],
			coords:[
				 0,0,0,

				 1,1-2/Math.sqrt(2),0,
				 1+1/Math.sqrt(2), 1-1/Math.sqrt(2), 0,
				 1,1,0,
				 0,1,0,
				 0,2,0,

				 0,3,0,
				1+1/Math.sqrt(2),1+1/Math.sqrt(2),0
			]
		}
		var pentoseOxygenIndex = 0;
		var fivePrimeOxygenIndex = 6;
		var threePrimeOxygenIndex = 7;
		for(var i = 0; i < connectingAtomsPdbRead.coords.length; i++ )
		{
			connectingAtomsPdbRead.coords[i] *= 1.6;
		}
	}

	function getClosestPhosphateOxygenPosition(phosphate, position)
	{
		var closestPhosphateOxygenPosition = null;
		var closestDist = Infinity;

		for(var i = 1; i < phosphate.atoms.length; i++)
		{
			var assemblageRelativePosition = phosphate.atoms[i].position.clone()
			if(phosphate.parent === assemblage)
			{
				assemblageRelativePosition.applyMatrix4(phosphate.matrix);
			}
			else
			{
				phosphate.localToWorld(assemblageRelativePosition)
				assemblage.worldToLocal(assemblageRelativePosition)
			}

			if( assemblageRelativePosition.distanceTo(position) < closestDist )
			{
				closestDist = assemblageRelativePosition.distanceTo(position);
				closestPhosphateOxygenPosition = assemblageRelativePosition;
			}
		}

		return closestPhosphateOxygenPosition;
	}

	var groups = [];
	var activeGroup = null;
	var activeConnectingAtoms = null;

	function createActiveGroup()
	{
		if(activeGroup && activeGroup.atoms.length === 5)
		{
			var newGroup = makeModelFromElementsAndCoords( guaninePdbRead.elements,guaninePdbRead.coords );

			var danglerPosition = newGroup.atoms[newGroup.atoms.length-1].position;
			var slightlyOffPlanarPosition = new THREE.Vector3(-0.4944533635103241,0,-1.5216819218592725).normalize();
			var correctorQuat = new THREE.Quaternion().setFromUnitVectors(slightlyOffPlanarPosition,new THREE.Vector3(-1,0,0))
			for(var i = 0; i < newGroup.atoms.length; i++)
			{
				newGroup.atoms[i].position.sub(danglerPosition)
				newGroup.atoms[i].position.applyAxisAngle(xVector,-TAU/4)
				newGroup.atoms[i].position.applyQuaternion(correctorQuat)
				newGroup.setAtomRepresentationPosition( newGroup.atoms[i] );
			}
		}
		else
		{
			var newGroup = makeModelFromElementsAndCoords( phosphatePdbRead.elements,phosphatePdbRead.coords );
		}

		if(activeGroup)
		{
			THREE.SceneUtils.detach( activeGroup, activeGroup.parent, scene )
			THREE.SceneUtils.attach( activeGroup, scene, assemblage );
		}

		nucleicAcidPainter.add( newGroup );
		newGroup.scale.multiplyScalar(getAngstrom())
		groups.push(newGroup);
		activeGroup = newGroup;

		if(activeGroup.atoms.length === 5 && groups.length > 1 )
		{
			activeConnectingAtoms = makeModelFromElementsAndCoords( connectingAtomsPdbRead.elements,connectingAtomsPdbRead.coords );
			assemblage.add(activeConnectingAtoms)
		}
		else
		{
			activeConnectingAtoms = null;
		}

		return newGroup;
	}

	objectsToBeUpdated.push(nucleicAcidPainter)
	nucleicAcidPainter.ordinaryParent = scene;
	nucleicAcidPainter.update = function()
	{
		label.visible = this.parent === scene;

		if(this.parent === this.ordinaryParent)
		{
			return;
		}

		var ourPosition = this.getWorldPosition(new THREE.Vector3());
		assemblage.updateMatrixWorld();
		assemblage.worldToLocal(ourPosition);

		if( this.parent.button1 )
		{
			if(!this.parent.button1Old)
			{
				createActiveGroup(ourPosition,this.parent.quaternion)
			}
		}

		if( activeConnectingAtoms )
		{
			var previousPhosphate = groups[groups.length-3];
			var base = groups[groups.length-2];

			activeConnectingAtoms.setAtomRepresentationPosition(activeConnectingAtoms.atoms[1],base.position)

			var fivePrimePhosphateOxygenPositionToConnect = getClosestPhosphateOxygenPosition(previousPhosphate, base.position);
			activeConnectingAtoms.setAtomRepresentationPosition(activeConnectingAtoms.atoms[fivePrimeOxygenIndex],fivePrimePhosphateOxygenPositionToConnect)
			activeConnectingAtoms.setAtomRepresentationPosition(activeConnectingAtoms.atoms[5],base.position.clone().lerp(fivePrimePhosphateOxygenPositionToConnect,3/4))
			activeConnectingAtoms.setAtomRepresentationPosition(activeConnectingAtoms.atoms[4],base.position.clone().lerp(fivePrimePhosphateOxygenPositionToConnect,2/4))
			activeConnectingAtoms.setAtomRepresentationPosition(activeConnectingAtoms.atoms[pentoseOxygenIndex],base.position.clone().lerp(fivePrimePhosphateOxygenPositionToConnect,1/4))

			var threePrimePhosphateOxygenPositionToConnect = activeGroup.atoms[1].position.clone()
			activeGroup.localToWorld(threePrimePhosphateOxygenPositionToConnect)
			assemblage.worldToLocal(threePrimePhosphateOxygenPositionToConnect)
			activeConnectingAtoms.setAtomRepresentationPosition(activeConnectingAtoms.atoms[3],base.position.clone().lerp(threePrimePhosphateOxygenPositionToConnect,2/3))
			activeConnectingAtoms.setAtomRepresentationPosition(activeConnectingAtoms.atoms[2],base.position.clone().lerp(threePrimePhosphateOxygenPositionToConnect,1/3))
			activeConnectingAtoms.setAtomRepresentationPosition(activeConnectingAtoms.atoms[threePrimeOxygenIndex],threePrimePhosphateOxygenPositionToConnect)

			/*
				"User error mitigation":
					Ideally we would work out "closest state that works".
					Just keep previous state and the phosphate atoms apart from O5 all translate and rotate away
					Take it further away than it can go and it "drags" the nucleotide? Or, hey, whole assemblage

				Aaarg and what about the relationship between the phosphates?
				What if you want to go back and change your mind about the previous phosphate?
				No, we are assuming you can see tetrahedra for the phosphates
				Folks can go back and reorient them
				The point is that this is a first pass anyway		
			*/
		}
	}
	nucleicAcidPainter.onLetGo = function()
	{
		if( !activeGroup )
		{
			return;
		}

		if(activeGroup.atoms.length === 5)
		{
			activeGroup.parent.remove(activeGroup);
		}
		else
		{
			THREE.SceneUtils.detach( activeGroup, activeGroup.parent, scene )
			THREE.SceneUtils.attach( activeGroup, scene, assemblage );
		}

		//hydroxl group goes where phosphate might be

		activeConnectingAtoms = null;
		groups = [];
		activeGroup = null;

		// Send it off to coot
	}

	return nucleicAcidPainter;
}
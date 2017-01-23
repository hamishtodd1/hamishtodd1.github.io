function UpdateHands(Models,Controllers, indicatorsound)
{
//	if(Controllers[0].geometry.boundingSphere)
//		console.log(Controllers[0].geometry.boundingSphere.center)
//	if(VRMODE) for(var i = 0; i < Controllers.length; i++)
//	{
//		if( Controllers[i].Gripping && Controllers[i].heldObject === null )
//		{
//			var controllerRadius = Controllers[i].children[0].geometry.boundingSphere.radius;
//			for(var j = 0; j < Models.length; j++)
//			{
//				var modelRadius = Models[j].geometry.boundingSphere.radius; //might be one of its children
//				if( Controllers[i].position.distanceTo( Models[j].position ) < modelRadius + controllerRadius )
//					Controllers[i].heldObject = true;
//			}
//		}
//		else{
//			Controllers[i].heldObject = true;
//			
//			//to apply the hand's movement to an object, multiply the inverse of the hand's previous matrix by the new
//			//then multiply the object's matrix by that.
//		}
//	}
}

function AttemptPickup(UserController, GrabbableObject)
{
	var alreadyholdingthisobject = 0;
	for(var j = 0; j < UserController.children.length; j++){
		if(UserController.children[j].uuid === GrabbableObject.uuid)
			alreadyholdingthisobject = 1;
	}
	
	if(!alreadyholdingthisobject)
	{
		UserController.updateMatrixWorld();
		THREE.SceneUtils.attach(GrabbableObject, Scene, UserController);
	}
}

function point_in_BoxHelper(ourpoint,boxgeometryarray){
	//going to assume that these always hold true
	var maxX = boxgeometryarray[0];
	var maxY = boxgeometryarray[1];
	var maxZ = boxgeometryarray[2];
	
	var minX = boxgeometryarray[18];	
	var minY = boxgeometryarray[19];	
	var minZ = boxgeometryarray[20];
	
	if( minX <= ourpoint.x && ourpoint.x <= maxX &&
		minY <= ourpoint.y && ourpoint.y <= maxY &&
		minZ <= ourpoint.z && ourpoint.z <= maxZ )
		return 1;
	else return 0;
}

function protein_overlap(proteinA, proteinB)
{
	var totalOverlap = 0;
	for(var i = 0, il = proteinA.atomPositions.length; i < il; i++)
	{
		for(var j = 0, jl = proteinB.atomPositions.length; j < jl; j++)
		{
			var dist = proteinA.atomPositions[i].distanceTo(proteinB.atomPositions[j]);
			var overlap = /* some cubic function */ dist;
			totalOverlap += overlap;
		}
	}
	return overlap;
}
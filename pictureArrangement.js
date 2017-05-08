var pictureMovementDuration = 1.5;
function updatePictureMovementEditor()
{
	if(isMouseDown && pictureGrabbed === 999 && cornerGrabbed = 999 )
	{
		for(var i = 0; i < slideObjects.length; i++)
		{
			if(slideObjects[i].parent.uuid !== scene.uuid)
				continue;
			if( MousePosition.distanceTo(slideObjects[i].position) < playing_field_dimension / 2 * slideObjects[i].scale.x )
			{
				pictureGrabbed = i;
				break;
			}
			else if( MousePosition.distanceTo(slideObjects[i].position) < playing_field_dimension / 2 * Math.sqrt(2) * slideObjects[i].scale.x )
			{
				cornerGrabbed = i;
				break;
			}
		}
	}
	
	if( pictureGrabbed !== 999)
		slideObjects[ pictureGrabbed ].position.add(Mouse_delta);
	
	if(cornerGrabbed !== 999)
	{
		var pictureScaleChange = MousePosition.distanceTo( slideObjects[ pictureGrabbed ].position ) / OldMousePosition.distanceTo( slideObjects[ pictureGrabbed ].position );
		slideObjects[ pictureGrabbed ].scale.multiplyScalar(pictureScaleChange);
	}
	
	if( !isMouseDown && isMouseDown_previously && pictureGrabbed !== 999 )
	{
		for(var i = 0; i < slideObjects[ pictureGrabbed ].stateListings.length; i++ )
		{
			if( our_CurrentTime > slideObjects[ pictureGrabbed ].stateListings[i].timing ) //if we've just past it, it was the previous one
			{
				slideObjects[ pictureGrabbed ].stateListings[i-1].positionX = slideObjects[pictureGrabbed].position.x;
				slideObjects[ pictureGrabbed ].stateListings[i-1].positionY = slideObjects[pictureGrabbed].position.y;
				break;
			}
		}
	}
}

function saveCurrentPictureStates()
{
	var stateJustBeforeNewOne = 0;
	for(var i = 0; i < slideObjects.length; i++)
	{
		if(slideObjects[i].parent.uuid === scene.uuid)
		{
			for(var i = 0; i < slideObjects[ slideGrabbed ].stateListings.length; i++ )
			{
				//all movements take the same amount of time so it is possible for some to be incompatible
				if(math.abs( slideObjects[ slideGrabbed ].stateListings[i].timing - our_CurrentTime ) < pictureMovementDuration)
					slideObjects[ slideGrabbed ].stateListings.splice( i );
				
				if( slideObjects[ slideGrabbed ].stateListings[i].timing < our_CurrentTime )
					stateJustBeforeNewOne = i;
			}
			
			//save the state. Possibly they need to be in order
			slideObjects[ slideGrabbed ].stateListings.splice(stateJustBeforeNewOne+1, 0, new Float32Array([
				our_CurrentTime,
				slideObjects[i].position.x,
				slideObjects[i].position.y,
				slideObjects[i].scale.x
				]));
		}
	}
}
function deletePictureStatesOfThoseInScene() //can use this, but as a final measure, in general things should delete nicely
{
	for(var i = 0; i < slideObjects.length; i++)
	{
		if(slideObjects[i].parent.uuid === scene.uuid)
		{
			slideObjects[i].stateListings.length = 1; //keep the first
		}
	}
}

function printPictureStates()
{
	var statesArray = Array( slideObjects.length );
	for( var i = 0; i < slideObjects.length; i++ )
	{
		statesArray[i] = Array( slideObjects[i].stateListings.length );
		for(var i = 0; i < slideObjects[i].stateListings.length; i++)
			statesArray[i].push(new Float32Array([
				slideObjects[i].timing,
				
				slideObjects[i].positionX,
				slideObjects[i].positionY,
				
				slideObjects[i].scale,
			] ) );
	}
	
	console.log(statesArray)
}

function importPictureStates(statesArray)
{
	if( typeof statesArray === 'undefined')
	{
		statesArray = Array( slideObjects.length );
		//you need to give them all one to start with
		for(var i = 0; i < statesArray.length; i++)
			statesArray[i] = [0,0,0,1]; //scale often needs to be that 1024 thing
	}
	
	for( var i = 0; i < slideObjects.length; i++ )
	{
		statesArray[i] = Array(slideObjects[i].stateListings.length);
		for(var i = 0; i < statesArray[i].length; i++)
		{
			slideObjects[i].timing = statesArray[i][0];
			
			slideObjects[i].positionX = statesArray[i][1];
			slideObjects[i].positionY = statesArray[i][2];
			
			slideObjects[i].scale = statesArray[i][3];
		}
	}
}

function updateSlideObject()
{
	var stateGoingTo = 0;
	for(var i = 0, il = this.stateListings.length; i < il; i++)
	{
		if( our_CurrentTime < this.stateListings[i].timing )
		{
			stateGoingTo = i;
		}
		else break; //the last one was us
	}
	
	if(stateGoingTo === 0)
	{
		this.position.x = this.stateListings[0].positionX;
		this.position.y = this.stateListings[0].positionY;
	}
	
	var pointBetween = move_smooth( pictureMovementDuration, our_CurrentTime - (this.stateListings[stateGoingTo].timing - pictureMovementDuration ) );
	
	this.position.x = this.stateListings[stateGoingTo-1].positionX + pointBetween * ( this.stateListings[stateGoingTo].positionX - this.stateListings[stateGoingTo-1].positionX );
	this.position.y = this.stateListings[stateGoingTo-1].positionY + pointBetween * ( this.stateListings[stateGoingTo].positionY - this.stateListings[stateGoingTo-1].positionY );
	
	this.scale.setScalar( this.stateListings[stateGoingTo-1].scale + pointBetween * ( this.stateListings[stateGoingTo].scale - this.stateListings[stateGoingTo-1].scale ) );
}

for(var i = 0; i < slideObjects.length; i++)
{
	slideObjects[i].update();
}
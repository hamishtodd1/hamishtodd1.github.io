//we assume natural parent is scene
function ensureAttachment(child, parent)
{
	if(child.parent !== parent)
	{
		THREE.SceneUtils.attach( child, scene, parent );
	}
}

function ensureDetachment(child, parent)
{
	if(child.parent === parent)
	{
		THREE.SceneUtils.detach( child, parent, scene );
	}
}

function desktopLoop(ourVREffect, socket, controllers, VRInputSystem, visiBox, thingsToBeUpdated, holdables ) {
	frameDelta = ourClock.getDelta();
	
	VRInputSystem.update( socket);
	
	for(var i = 0; i < controllers.length; i++)
	{
		if(Math.abs( controllers[i].thumbStickAxes[1] ) > 0.001)
		{
			modelAndMap.scale.setScalar( modelAndMap.scale.x * (1+controllers[i].thumbStickAxes[1] / 100) );
			var minScale = 0.0000001;
			if( modelAndMap.scale.x < minScale )
				modelAndMap.scale.setScalar( minScale )
		}
		
		if( controllers[i].grippingTop )
		{
			if( controllers[i].children.length === 1)
			{
				for(var holdable in holdables )
				{
					if( controllers[i].overlappingHoldable(holdables[holdable]) )
					{
						if( controllers[i].children.length > 1)
						{
							console.warn("was going to attach something else")
							break;
						}
						
						THREE.SceneUtils.detach( holdables[holdable], holdables[holdable].parent, scene );
						THREE.SceneUtils.attach( holdables[holdable], scene, controllers[i] );
					}
				}
			}
		}
		else
		{
			for(var holdable in holdables )
			{
				if( holdables[holdable].parent === controllers[i])
				{
					THREE.SceneUtils.detach( holdables[holdable], controllers[i], scene );
					THREE.SceneUtils.attach( holdables[holdable], scene, holdables[ holdable ].ordinaryParent );
				}
			}
		}
	}
	
	var bothAttachedController = RIGHT_CONTROLLER_INDEX;
	
	if( controllers[RIGHT_CONTROLLER_INDEX].grippingSide && controllers[LEFT_CONTROLLER_INDEX].grippingSide )
	{
		ensureDetachment(visiBox, controllers[1-bothAttachedController]);
		
		ensureAttachment(visiBox, controllers[bothAttachedController]);
		ensureAttachment(modelAndMap, controllers[bothAttachedController]);
		
		var handSeparationDifferential = controllers[0].position.distanceTo( controllers[1].position ) / 
			controllers[0].oldPosition.distanceTo( controllers[1].oldPosition );
		
		visiBox.position.multiplyScalar( 1 / visiBox.scale.x ); 
		visiBox.scale.setScalar( visiBox.scale.x * handSeparationDifferential );
		visiBox.position.multiplyScalar(visiBox.scale.x);
		
		modelAndMap.position.multiplyScalar( 1 / modelAndMap.scale.x ); 
		modelAndMap.scale.setScalar( modelAndMap.scale.x * handSeparationDifferential );
		modelAndMap.position.multiplyScalar(modelAndMap.scale.x);
	}
	else
	{
		if( controllers[bothAttachedController].grippingSide )
		{
			ensureAttachment(visiBox, controllers[bothAttachedController]);
			ensureAttachment(modelAndMap, controllers[bothAttachedController]);
		}
		else
		{
			ensureDetachment(visiBox, controllers[bothAttachedController]);
			ensureDetachment(modelAndMap, controllers[bothAttachedController]);
		}
		
		if( controllers[1-bothAttachedController].grippingSide )
		{
			ensureAttachment(visiBox, controllers[1-bothAttachedController]);
		}
		else
		{
			ensureDetachment(visiBox, controllers[1-bothAttachedController]);
		}
	}
	
	for( var thing in thingsToBeUpdated)
	{
		if( thingsToBeUpdated[thing].length !== undefined)
		{
			for(var i = 0, il = thingsToBeUpdated[thing].length; i < il; i++)
				thingsToBeUpdated[thing][i].update();
		}
		else
			thingsToBeUpdated[thing].update();
	}
	
	modelAndMap.map.material.linewidth = 0.2 / modelAndMap.position.distanceTo(camera.position);
	modelAndMap.map.material.needsUpdate = true;
	
	socket.send("loopDone");
	
	ourVREffect.requestAnimationFrame( function(){
		ourVREffect.render( scene, camera );
		desktopLoop(ourVREffect, socket, controllers, VRInputSystem, visiBox, thingsToBeUpdated, holdables );
	} );
}
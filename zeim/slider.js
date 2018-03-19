//vibration if you drag it off the side would be good
function SliderSystem(changeValue, initialValue, monitorCompletely, onTrackerGrab)
{
	var sliderSystem = new THREE.Mesh(new THREE.PlaneBufferGeometry(1,1), new THREE.MeshBasicMaterial({color:0xDADADA}));
	sliderSystem.geometry.applyMatrix(new THREE.Matrix4().makeTranslation(0.5,0,0))
	sliderSystem.onClick = function(cameraSpaceClickedPoint)
	{
		var localGrabbedPoint = cameraSpaceClickedPoint.clone();
		camera.localToWorld(localGrabbedPoint);
		sliderSystem.worldToLocal(localGrabbedPoint);

		tracker.position.x = localGrabbedPoint.x;
		changeValue( tracker.position.x );

		tracker.cameraSpaceClickedPoint = cameraSpaceClickedPoint;
	}
	clickables.push(sliderSystem);

	var trackerDefaultColor = new THREE.Color(0x298AF1);
	var trackerJoltedColor = new THREE.Color(1,0,0);
	var tracker = new THREE.Mesh(
		new THREE.CylinderBufferGeometry(1,1,1,32), 
		new THREE.MeshBasicMaterial({color:trackerDefaultColor, /*transparent:true, opacity:1*/}));
	tracker.position.x = initialValue;
	changeValue(tracker.position.x);
	clickables.push(tracker)
	sliderSystem.add(tracker);
	tracker.geometry.applyMatrix(new THREE.Matrix4().makeRotationX(TAU/4))
	tracker.cameraSpaceClickedPoint = null;
	tracker.onClick = function(cameraSpaceClickedPoint)
	{
		this.cameraSpaceClickedPoint = cameraSpaceClickedPoint;
		if(onTrackerGrab)
		{
			onTrackerGrab();
		}
	}

	sliderSystem.joltedness = 0;

	sliderSystem.update = function()
	{
		var specifiedValueAtStart = tracker.position.x;
		sliderSystem.joltedness -= frameDelta * 5.5;
		if(sliderSystem.joltedness < 0)
		{
			sliderSystem.joltedness = 0;
		}

		if( mouse.clicking && ( mouse.lastClickedObject === tracker || mouse.lastClickedObject === sliderSystem ) )
		{
			if(mouse.justMoved)
			{
				var prev = tracker.position.clone()
				mouse.applyDrag(tracker);
				tracker.position.z = 0;
				tracker.position.y = 0;

				if( tracker.position.x < 0 )
				{
					tracker.position.x = 0;
					sliderSystem.joltedness = 1.35;
				}
				else if( 1 < tracker.position.x )
				{
					tracker.position.x = 1;
					sliderSystem.joltedness = 1.35;
				}
			}
		}
		else
		{
			tracker.cameraSpaceClickedPoint = null;
		}

		tracker.material.color.copy(trackerDefaultColor);
		tracker.material.color.lerp(trackerJoltedColor,clamp(sliderSystem.joltedness,0,1))

		if(tracker.position.x !== specifiedValueAtStart)
		{
			changeValue(tracker.position.x);
		}
	}

	sliderSystem.setDimensions = function(length, height)
	{
		if(!height)
		{
			height = length / 8;
		}
		sliderSystem.scale.set(length,height,1);
		var trackerRadius = height * 0.8;
		tracker.scale.set( trackerRadius / length, trackerRadius / height,trackerRadius / height * 0.00001);
	}
	sliderSystem.setDimensions(1)

	sliderSystem.setValue = function(trackerPositionX)
	{
		tracker.position.x = trackerPositionX;
	}

	if(monitorCompletely)
	{
		markPositionAndQuaternion(sliderSystem)
		markObjectProperty(tracker.position,"x")

		markObjectProperty(sliderSystem,"joltedness")
		markObjectProperty(tracker.material.color,"r")
		markObjectProperty(tracker.material.color,"g")
		markObjectProperty(tracker.material.color,"b")
	}

	return sliderSystem;
}
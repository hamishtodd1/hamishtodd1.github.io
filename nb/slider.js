//vibration if you drag it off the side would be good
function SliderSystem(changeValue, initialValue, pulseTilUsed, chapter)
{
	var sliderSystem = new THREE.Mesh(
		new THREE.PlaneBufferGeometry(1,1),
		new THREE.MeshBasicMaterial({color:0x000000}));
	sliderSystem.geometry.applyMatrix(new THREE.Matrix4().makeTranslation(0.5,0,0))
	sliderSystem.onClick = function(intersection)
	{
		var localGrabbedPoint = intersection.point.clone();
		this.worldToLocal(localGrabbedPoint)
		tracker.clickedPoint = localGrabbedPoint;

		tracker.position.x = localGrabbedPoint.x;
	}
	chapter.add(sliderSystem,"clickables")
	chapter.add(sliderSystem,"sceneElements")

	var trackerDefaultColor = new THREE.Color(0x298AF1);
	var trackerJoltedColor = new THREE.Color(1,0,0);
	var tracker = makeTextSign("P")
	tracker.material.depthTest = true
	tracker.position.z = 0.006
	tracker.geometry.applyMatrix(new THREE.Matrix4().scale(new THREE.Vector3().setScalar(50)))
	tracker.position.x = initialValue;
	changeValue(tracker.position.x);
	chapter.add(tracker,"clickables")
	sliderSystem.add(tracker);
	tracker.clickedPoint = null;
	var defaultTrackerScale = new THREE.Vector3(1,1,1);

	var userKnowsAboutMovement = true;
	if(pulseTilUsed)
	{
		userKnowsAboutMovement = false;
	}

	tracker.onClick = function(intersection)
	{
		this.clickedPoint = intersection.point.clone();
		sliderSystem.worldToLocal(this.clickedPoint)
	}

	sliderSystem.joltedness = 0;

	sliderSystem.update = function()
	{
		if(!userKnowsAboutMovement)
		{
			tracker.scale.copy(defaultTrackerScale);
			var sinTime = Math.sin( clock.elapsedTime * 9 );
			tracker.scale.x *= 1 + 0.3 * sinTime;
			tracker.scale.y *= 1 + 0.3 * sinTime;
		}
		else
		{
			tracker.scale.copy(defaultTrackerScale);
		}

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
				var newClickedPoint = mouse.rayIntersectionWithZPlane(0)
				this.worldToLocal(newClickedPoint)
				tracker.position.x += newClickedPoint.x - tracker.clickedPoint.x

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

				tracker.clickedPoint.copy(newClickedPoint)
			}

			userKnowsAboutMovement = true;
		}
		else
		{
			tracker.clickedPoint = null;
		}

		tracker.material.color.copy(trackerDefaultColor);
		tracker.material.color.lerp(trackerJoltedColor,clamp(sliderSystem.joltedness,0,1))

		if(tracker.position.x !== specifiedValueAtStart)
		{
			changeValue(tracker.position.x);
		}
	}
	chapter.add(sliderSystem,"updatables")

	sliderSystem.setDimensions = function(length, height)
	{
		if(!height)
		{
			height = length / 8;
		}
		sliderSystem.scale.set(length,height,1);
		var trackerRadius = height * 0.8;
		defaultTrackerScale.set( trackerRadius / length, trackerRadius / height,trackerRadius / height * 0.00001);
	}
	sliderSystem.setDimensions(1)

	sliderSystem.setValue = function(trackerPositionX)
	{
		tracker.position.x = trackerPositionX;
	}

	return sliderSystem;
}
/*
	Started 2:00pm (on my partner's laptop, so fewer keyboard shortcuts)
	20m spent working on slider code

	Spec:
		Demonstrate the *formation* and *propagation* of traffic waves.
		Users should be able to explore *different models of driver behavior*
			and *understand* their *effects on wave formation*.
		it is up to you to determine the salient features of traffic waves that you’d like to highlight
		After you’ve completed the assignment, please write a brief paragraph explaining the feature you’re highlighting

		visualization conveys the “core idea”
		Decide which elements are core to the UX, and which are simply nice to have
		think carefully about *which* controls to provide to the user.

	Next thing to do is get traffic waves to emerge

	controls
		click to have a little bird cross in front of car; causes teeeny tiny slowdown
		click to put in a stop sign?
		Do want to control car separation
		Control driver behaviour
		NEED TO GET SOME SLIDER WORKING, AND A LABEL AT LEAST
		It could be a "car producing machine"
			all the sliders on it
			car only gets updated with sliders when it is made again

	Driver behaviour
		How much of a delay?
		How much overcompensation?
		/omniscience about what the car in front of them will do
		How much do they "want" to be at the same speed as the person in front
		initial velocity, and willingness to get close is kind of a behaviour

	Show the emergent position of the wave
		even better: a colored strip showing the velocity of a car that will be at that location
		And then we press the space bar to see it at a different angle and see that it's a sine wave!
		They could "shade" the color of the rectangle they go over at what ever velocity they go over it at
		Then add "imaginary cars" shading in the road

	"Nice to have" things
		Puzzle: can you get a wave with *this* wavelength and *this* amplitude (slowness)? show it next to the road
			Can you get that even if we set certain other values to some specific value?
			Can you use [geogebra-esque visual programming language] to discover the specific formula that solves for wavelength and amplitude?
		And a thing that gets you to think about morality and game theory!
		look at the acceleration of the car in front, not just their velocity
		Checking for tailgaters and speeding up (but how much??? and how to compare with speed of car in front?)
		Road that is not a single straight line
			Bends, multiple lanes, Merging and diverging, roundabouts
			May make better use of space on the screen with a spiral or zigzag
			HOWEVER: anything deviating from a single straight lines may be expected to have an impact on driver behaviour.
			Interesting, but not necessarily what we are teaching about
		comparison to "ideal" / robot car:
			communicate arbitrarily fast and come to collective decisions about what should happen next
				Currently car "update" functions are called in fairly random order. Would be replaced with something more sophisticated
		Markings to make it look more like a road at least
		Stop signs
		animated bird, cars (drivers getting annoyed?)
		make the bird reaction a bit smarter - eg nobody hits it
		make the drivers super super smart
		Cars (lorries?) of different lengths and accelerations

	Paragraph:
		Note how the bird is long since out of the way - but its effects are still felt!
*/

function initTrafficWaves()
{
	let roadWidth = 0.06
	let roadLength = 2.3
	let road = new THREE.Mesh(new THREE.BoxGeometry(roadLength,roadWidth,0.001), new THREE.MeshBasicMaterial({color:0xCCCCCC}))
	scene.add(road)

	let cars = []
	let standardCarWidth = roadWidth*0.8
	let standardCarLength = standardCarWidth*1.2
	let standardDesiredTailgatingDistance = standardCarLength * 2

	let carFactory = new THREE.Mesh(new THREE.PlaneBufferGeometry(roadWidth*3, roadWidth*3, 0.02))
	{
		carFactory.position.x = -1 + roadWidth * 1.5
		carFactory.position.z = 0.03
		scene.add( carFactory )

		// let title = makeTextSign("Car factory!",false,false,true)
		// title.position.z = 0.03
		// title.scale.multiplyScalar(0.1)
		// carFactory.add( title )

		let tailgatingSlider = SliderSystem( function( newStandardTailgatingDistance)
		{
			standardDesiredTailgatingDistance = newStandardTailgatingDistance
		}, standardDesiredTailgatingDistance, false, null, true)
		tailgatingSlider.scale.multiplyScalar(0.3)
		tailgatingSlider.position.y -= roadWidth
		tailgatingSlider.position.x -= 0.3
		scene.add(tailgatingSlider)

		// let otherSlider = SliderSystem(changeValue, standardDesiredTailgatingDistance, false, null, true)
		// otherSlider.scale.multiplyScalar(0.3)
		// otherSlider.position.y -= 0.3
		// otherSlider.position.x += 0.3
		// scene.add(otherSlider)
	}

	let velocityLimit = 0.01 //should be frame rate dependent

	let bird = new THREE.Mesh(new THREE.CircleBufferGeometry(roadWidth * 0.16), new THREE.MeshBasicMaterial({color:0x000000}) )
	bird.scale.x = 0.5
	bird.position.z = 0.2
	scene.add(bird)
	updateFunctionsToBeCalled.push(function()
	{
		bird.position.y += 0.01
		if(mouse.clicking && !mouse.oldClicking && mouse.lastClickedObject === null)
		{
			bird.position.y = road.position.y - roadWidth
			bird.position.x = mouse.zZeroPosition.x
		}
	})

	function Car()
	{
		let car = new THREE.Mesh(new THREE.BoxGeometry(standardCarLength,standardCarWidth,0.002))
		car.velocity = 0
		cars.push(car)
		road.add(car)
		car.sittingInFatory = true

		updateFunctionsToBeCalled.push(function()
		{
			if(car.sittingInFatory)
			{
				//see if we can get out
				let leftmostCar = null
				for(let i = 0; i < cars.length; i++)
				{
					if(cars[i] === car || cars[i].sittingInFatory )
					{
						continue;
					}

					if( leftmostCar === null || cars[i].position.x < leftmostCar.position.x )
					{
						leftmostCar = cars[i]
					}
				}

				if(leftmostCar === null) //nothing on the road
				{
					car.sittingInFatory = false
				}
				else if(leftmostCar.position.x > carFactory.position.x + standardDesiredTailgatingDistance)
				{
					car.position.x = leftmostCar.position.x - standardDesiredTailgatingDistance
					car.sittingInFatory = false
				}
				else
				{
					return
				}
			}

			let positionOfCarInFrontOfMe = Infinity
			let carInFrontOfMe = null
			for(let i = 0; i < cars.length; i++)
			{
				if(cars[i] === car || cars[i].sittingInFatory )
				{
					continue;
				}

				if(Math.abs(cars[i].position.x - car.position.x) < standardCarLength )
				{
					// console.warn("crash!")
				}

				if(cars[i].position.x > car.position.x && cars[i].position.x < positionOfCarInFrontOfMe )
				{
					carInFrontOfMe = cars[i]
				}
			}

			if(carInFrontOfMe !== null)
			{
				//I'm trying to give myself some space, and go as fast as possible
				//I *want* to be a specific distance from the car in front
				//player controls this so make it simple

				// let displacementToDesiredPosition = carInFrontOfMe.position.x - standardDesiredTailgatingDistance - car.position.x
				// // console.log(displacementToDesiredPosition)
				// let roboticVelocity = displacementToDesiredPosition
				// car.velocity = roboticVelocity

				car.velocity = carInFrontOfMe.velocity
			}
			else
			{
				car.velocity = velocityLimit
			}

			if( bird.position.y < roadWidth &&
				car.position.x < bird.position.x && bird.position.x - car.position.x < standardCarLength  )
			{
				//well, acceleration
				car.velocity *= 0.5
			}

			car.position.x += car.velocity
			// if(carInFrontOfMe ===null) console.log(car.position.x)
			if( car.position.x > roadLength / 2 )
			{
				car.sittingInFatory = true
			}
		})

		return car
	}

	//50 may not be enough. Could check if there's room on the road that could be used but isn't
	for(let i = 0; i < 30; i++)
	{
		let newCar = Car()
	}
}
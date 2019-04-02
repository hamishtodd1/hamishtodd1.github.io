/*
	Spec:
		Demonstrate the *formation* and *propagation* of traffic waves.
		Users should be able to explore *different models of driver behavior*
			and *understand* their *effects on wave formation*.
		it is up to you to determine the salient features of traffic waves that you’d like to highlight
		After you’ve completed the assignment, please write a brief paragraph explaining the feature you’re highlighting

		visualization conveys the “core idea”
		Decide which elements are core to the UX, and which are simply nice to have
		think carefully about *which* controls to provide to the user.

	"Nice to have" things
		User draws curve in phase space of car.velocity - carInFront.velocity versus car.x - carInFront.x
			But their brush is wide, eg they get their curve + random noise
		Puzzle: can you get a wave with *this* wavelength and *this* amplitude (slowness)? show it next to the road
			Can you get that even if we set certain other values to some specific value?
			Can you use [geogebra-esque visual programming language] to discover the specific formula that solves for wavelength and amplitude?
		comparison to "ideal" / robot car:
			communicate arbitrarily fast and come to collective decisions about what should happen next
			Current solution is a large number of timesteps; would have to derive some kind of fixed point???
			Easy on a single road
		And a thing that gets you to think about morality and decision theory!
			maybe I want to tailgate closely so I get car in front to hurry up
			what is my expectation about your behaviour? Maybe some of us are robots and some not!
		Better modelling
			look at the acceleration of the car in front over time, not just their position / velocity?
			Overtaking / multiple lanes
			Checking for tailgaters behind you and speeding up
				but how much??? and how to compare with speed of car in front?
			Stop sign / speed hump
			Road that is not a single straight line
				Bends, Merging and diverging, roundabouts
				May make better use of space on the screen with a spiral or zigzag
				HOWEVER: anything deviating from a single straight lines may be expected to have an impact on driver behaviour.
				Interesting, but not necessarily what we are teaching about
			Do gears discretize the space of accelerations?
			make the bird reaction a bit smarter/more realistic - eg nobody hits it
			Cars of different max acceleration
			To what extent do folks obey the speed limit? How much are they willing to slow for the bird?

	Paragraph:
		The counter-intuitive result is how regularly it goes back
		And how, in (one-lane) driving, one tends only to think of one's own behaviour
		If the person in front of me slows down, I definitely have to slow down too, so it doesn't matter to me what caused it
		It doesn't have to be a bird. It could just be miniscule random noise
			like mis-perception on the part of someone about the speed of the car in front of them
			as demonstrated by the circular experiment
		Note how the bird is long since out of the way - but its effects are still felt!
		There's an "amplifying" effect as well - even if the first car only slows a bit, some cars may end up stopping!
*/

function initTrafficWaves()
{
	renderer.setClearColor(0xFFFDD0)

	let roadWidth = 0.06
	let roadLength = 2.3
	let roadHeight = 0.02
	let road = new THREE.Mesh(new THREE.BoxGeometry(roadLength,roadWidth,roadHeight), new THREE.MeshBasicMaterial({color:0xCCCCCC}))
	scene.add(road)

	let cars = []
	let standardCarWidth = roadWidth*0.8
	let standardCarLength = standardCarWidth*1.2

	//tailgating distance: "how close I ideally want to be to car in front". I heard this as an americanism, hope I haven't misunderstood
	let standardDesiredTailgatingDistance = standardCarLength * 2

	let standardIncompetence = 0

	let velocityLimitDividedByFrameDelta = 0.07

	let carFactoryWidth = roadWidth * 3
	let carFactory = new THREE.Mesh(new THREE.PlaneBufferGeometry(carFactoryWidth, roadWidth*3, 0.02))
	{
		carFactory.position.x = -1 + carFactoryWidth / 2
		carFactory.position.z = 0.03
		scene.add( carFactory )

		let minTailgatingDistance = standardCarLength * 1.4
		let maxTailgatingDistance = standardCarLength * 3.3
		let tailgatingSlider = SliderSystem( function( valueBetweenZeroAndOne )
		{
			standardDesiredTailgatingDistance = minTailgatingDistance + (1-valueBetweenZeroAndOne) * (maxTailgatingDistance-minTailgatingDistance )
		}, 0.5, false, null, true)
		tailgatingSlider.scale.multiplyScalar(0.3)
		tailgatingSlider.position.y -= roadWidth * 5
		tailgatingSlider.position.x = carFactory.position.x - carFactoryWidth / 2
		scene.add(tailgatingSlider)
		tailgatingSlider.title = makeTextSign("New car willingness to get close:",false,false,true)
		tailgatingSlider.title.scale.multiplyScalar(0.1)
		tailgatingSlider.title.position.copy(tailgatingSlider.position)
		tailgatingSlider.title.position.y = tailgatingSlider.position.y + 0.04
		tailgatingSlider.title.position.x = tailgatingSlider.position.x
		scene.add( tailgatingSlider.title )

		let minIncomptence = 0
		let maxIncomptence = 10
		let competenceSlider = SliderSystem( function( valueBetweenZeroAndOne )
		{
			standardIncompetence = minIncomptence + valueBetweenZeroAndOne * (maxIncomptence-minIncomptence )
		}, 0, false, null, true)
		competenceSlider.scale.multiplyScalar(0.3)
		competenceSlider.position.y = -0.53
		competenceSlider.position.x = carFactory.position.x - carFactoryWidth / 2
		scene.add(competenceSlider)
		competenceSlider.title = makeTextSign("New car incompetence with acceleration:",false,false,true)
		competenceSlider.title.scale.multiplyScalar(0.1)
		competenceSlider.title.position.copy(competenceSlider.position)
		competenceSlider.title.position.y = competenceSlider.position.y + 0.04
		competenceSlider.title.position.x = competenceSlider.position.x
		scene.add( competenceSlider.title )
	}

	let bird = new THREE.Mesh(new THREE.CircleBufferGeometry(roadWidth * 0.16), new THREE.MeshBasicMaterial({color:0xAAAAAA}) )
	bird.scale.x = 0.5
	bird.position.z = 0.05
	bird.position.y = 1
	scene.add(bird)

	road.rotation.x = -TAU / 4

	function Car()
	{
		let car = new THREE.Mesh(
			new THREE.BoxGeometry(standardCarLength,standardCarWidth,roadHeight*2)
			//new THREE.MeshBasicMaterial({color:0xFF0000})
		)
		car.position.x = carFactory.position.x
		car.position.z = roadHeight * 2
		car.velocity = 0
		cars.push(car)
		road.add(car)
		car.sittingInFatory = true

		let velocityPoint = new THREE.Mesh(new THREE.SphereGeometry(0.01), car.material)
		car.add(velocityPoint)

		car.update = function()
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
					car.velocity = velocityLimitDividedByFrameDelta * frameDelta

					//maybe want to control their max acceleration
				}
				else
				{
					if(leftmostCar.position.x > carFactory.position.x + standardDesiredTailgatingDistance)
					{
						car.accelerationIncompetence = standardIncompetence
						car.desiredTailgatingDistance = standardDesiredTailgatingDistance
						car.position.x = leftmostCar.position.x - car.desiredTailgatingDistance
						car.velocity = leftmostCar.velocity
						car.sittingInFatory = false
					}		
					else
					{
						return
					}
				}
			}

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

				if( car.position.x < cars[i].position.x &&
					(carInFrontOfMe === null || cars[i].position.x < carInFrontOfMe.position.x ) )
				{
					carInFrontOfMe = cars[i]
				}
			}

			if(carInFrontOfMe !== null)
			{
				/*
				Agent's fundamental goals
					obey speed limit (hah)
					be as fast as possible
					do not crash

					"stay at x distance from person in front"
						turns all these questions, which are about velocity
						into single question about position in intertial frame of car in front

				We MAY wish to say that they are not in such a hurry
					This would allow a wave to die out quicker because there is a buffer that can be eliminated permanently
					Arguably not quite so interesting because it is not traffic "in the limit"
					Could have a simulation earlier on that has lackadaisical cars and points this out though

				"Reaction time":
					you have their position history and their velocity history
					Take their position from a few updates ago and add their velocity at that point * how long ago it was
					Complicated to address/simulate faithfully though
						would have to translate real-word speed limits and car dimensions
						People probably do have the ability to control their car with very high fidelity
				*/

				let displacementToDesiredPosition = carInFrontOfMe.position.x - car.desiredTailgatingDistance - car.position.x

				let trialAndErrorAcceleration = 0.000008
				if( displacementToDesiredPosition < 0 ) //strictly less than, eg will accelerate if at "ideal" place
				{
					trialAndErrorAcceleration *= -1
				}
				
				let perfectAcceleration = displacementToDesiredPosition - car.velocity

				let imperfection = (Math.random()-0.5) * car.accelerationIncompetence
				let imperfectAcceleration = perfectAcceleration * ( 1 + imperfection )

				let topAcceleration = 0.00002 //could be made a tweakable parameter. 
				let limitedImperfectAcceleration = clamp(Math.abs(imperfectAcceleration), 0,topAcceleration)
				limitedImperfectAcceleration *= imperfectAcceleration > 0 ? 1:-1

				car.velocity += limitedImperfectAcceleration

				let velocityThatWouldCauseCrash = carInFrontOfMe.position.x - standardCarLength - car.position.x
				car.velocity = clamp(car.velocity,null, velocityThatWouldCauseCrash)

				car.velocity = clamp(car.velocity,0,velocityLimitDividedByFrameDelta * frameDelta)
			}
			else
			{
				car.velocity = velocityLimitDividedByFrameDelta * frameDelta
			}

			if( bird.position.y < roadWidth &&
				car.position.x < bird.position.x && bird.position.x - car.position.x < standardCarLength  )
			{
				car.velocity -= velocityLimitDividedByFrameDelta / 30 * frameDelta
			}

			velocityPoint.position.z = 0.21 + car.velocity * 120

			car.position.x += car.velocity
			// if(carInFrontOfMe ===null) console.log(car.position.x)
			if( car.position.x > roadLength / 2 || car.position.x < carFactory.position.x )
			{
				car.sittingInFatory = true
				car.position.x = carFactory.position.x

				velocityPoint.position.z = 0
			}
		}

		return car
	}

	for(let i = 0; i < 30; i++)
	{
		let newCar = Car()
	}

	function mainLoop()
	{
		bird.position.y += 0.01
		if(mouse.clicking && !mouse.oldClicking && mouse.lastClickedObject === null)
		{
			bird.position.y = road.position.y - roadWidth
			bird.position.x = mouse.zZeroPosition.x
		}

		for(let j = 0; j < 10; j++)
		{
			for(let i = 0; i < cars.length; i++)
			{
				cars[i].update()
			}
		}
	}
	updateFunctions.push(mainLoop)
}
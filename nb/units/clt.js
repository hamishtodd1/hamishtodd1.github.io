//To begin: teacher view same as student view

function initClt()
{
	// var fingerGame = initFinger()

	var clickableDistributions = initClickableDistributions(true,3)
	// makeCupGame(clickableDistributions, 7)

	// var coloredBalls = initColoredBalls(3)
	// makeCupGame(coloredBalls, 11) //11

	
}

/*
	TODO
		Packing
			Texture mapping
			Rotation
		Test on their computer (speedup? ;_;)
		Test in the school

	Teacher can control scramble amount

	Want to be able to hold down

	You wanna click some 3D model in mimicry of the mug

	peer instruction questions
	"patient 1", "patient 2"
	Danger zones, healthy zones
	little pictures of hearts, one beating
	Ok have one of that, but other things you keep to the

	Show the numbers to say that this is what “data” is
	Under the mug, you have data from people who've had lead in the walls
	Footballer pass length (parabola)
	medic - heartbeats heart.jpg
	vet
	electrical engineer - how much power a lightbulb needs? Number of megapixels of a camera?
	Number of views a youtube video gets
	lawyer - #cases won
	hairdresser - #five star ratings on google maps
	armed services - gun number of times fired before it broke (bullet)
	police - number of crimes committed on a street


	Schedule
		Control distribution and population
			Wobble goes up and down distribution; new ones pop in and out
			There will be a discrete step by which you can adjust them
			Animation
				sort by height (can mark median)
				Group by height

		Increase the number of samples hugely while keeping the distribution the same
			Clicking a distribution gets one sample from it (some challenge to make sure everyone knows you can get this)

		Introduce folks to the cup interface
			Red ball, blue ball, green ball
			Do some where you CAN keep track of the mugs. Increase scramblecount by 1 when they get it right
			Also introduce that you can click a distribution even when in a mug
		Click a cup loads and try to figure out which shape is being built up
			You have the ten (need lots because otherwise chance) distributions
			we duplicate one, it is under a cup, you have to work out which
		Then we add in the average. They should probably be familiar with that ;_;
			It's another, differently colored, ball inamongst the balls they're building up
			Useful because it's important to see that it hones in on something = "regression to the mean"

		// Central limit theorem
		// 	One of the distributions is one that they all got
		// 	Their averages are plotted on teacher screen
		// 		You can hover on teacher screen and you'll see on your own screen that teacher is hovering on yours
		// 	Bulk it up with a few more?
		// 	Woo it's a normal distribution
		// 	Give loads more examples, using every distribution they faced 

		Back to puzzles
			Now you can click and hold and you'll get them
			They see the normal distribution describing where the average should go
			They should get used to looking at the normal distribution next to it, using it to "get out early"
			Still should feel slow
		Now you get a big bunch at a time
			You can do it faster
		Now...
			We are NOT showing the actual graph, or actual samples, just the normal distribution
			And all you're doing is accepting/rejecting a single graph
		Now: automated. You see loads at a time.
			You see ~200 sample means marked on as many distributions next to a "accept/reject"
			You can control the p (width of acceptance on graph) - changes many accept/reject statuses
			You're given a specific n, at least at this point
			Then you click "go" and "correct/incorrect" pop up on all the graphs.
			You get shown another bunch
			Should be able to see that approximately 200 * p of them give false positives
		Then?
			You can control the n - but it means you do more/less experiments

		Possibly: understanding normal distribution in particular.
			Choose some z. Everyone bets on whether our random variable will be in [-z,z]
			Click to spit out
			See the standard deviation. Get an intuition for the 95% thing
			To do this you need a thing where they can "vote"
			z-test: "what is my probability of being as many std. devs. from the mean as I am?"

	Presentation
		How do you know your heartrate is normal?
		Some things in nature where many identical things are added?
			If you add a random quantity of stuff to a pile of stuff, over time the pile of stuff's size will be modelled as a normal dist
			Stacking chairs? adding extra lightbulbs to something?
			position of a free particle governed by the Schrodinger equation apparently http://aidanlyon.com/media/publications/Lyon-normal_distributions.pdf
			Note that you only get much variation in height if you allow age to vary
		Vaccines cause autism as an example of an experiment gone wrong
		Problem is that the back-and-forth control is not exactly changing a probability distribution, it's just a histogram
			So we say: with the "probability distribution", you're just "not getting all of them"
		Switch to applications: heart rate (series of spikes) arm length and throw length. Or kids heights marked on a doorway
*/

function initFinger()
{
	var fingerMaterial = new THREE.MeshBasicMaterial({map:new THREE.TextureLoader().load( "data/textures/finger.jpg" )})
	var fingerGeometry = new THREE.OriginCorneredPlaneBufferGeometry(0.5,1)

	var fingerRuler = new THREE.Mesh( fingerGeometry, fingerMaterial )
	fingerRuler.scale.multiplyScalar(0.5)

	var markerThickness = 0.01
	var lengthMarker = new THREE.Mesh(
		new THREE.OriginCorneredPlaneBufferGeometry(markerThickness,1),
		new THREE.MeshBasicMaterial({color:0x0000FF}))
	lengthMarker.position.x = fingerRuler.position.x - 0.05
	var cmMarkers = Array(10)
	var markerLength = markerThickness*4
	var markerSpacing = 0.1
	for( var i = 0; i < cmMarkers.length; i++ )
	{
		cmMarkers[i] = new THREE.Mesh(
			new THREE.OriginCorneredPlaneBufferGeometry(markerLength,markerThickness),
			new THREE.MeshBasicMaterial({color:0x0000FF, side:THREE.DoubleSide}))
		cmMarkers[i].position.y = i * markerSpacing
		cmMarkers[i].position.x = lengthMarker.position.x - markerLength
		var numberSign = makeTextSign( i.toString() )
		numberSign.position.x = -markerLength/2
		cmMarkers[i].add( numberSign )
	}

	var signLines = [ makeTextSign( "YOUR FINGER" ), makeTextSign( "IS BEING SHOWN" ) ]
	for(var i = 0; i < 2; i++)
	{
		signLines[i].position.y = 0.025 - i * 0.05
		signLines[i].material.transparent = true
		signLines[i].material.opacity = 0
	}
	var yourFingerIsBeingShownSign = new THREE.Group().add( signLines[0], signLines[1] )

	fingerRuler.clickedPoint = null;
	fingerRuler.update = function()
	{
		if(mouse.clicking && mouse.lastClickedObject === this)
		{
			var newClickedPoint = mouse.rayIntersectionWithZPlane(0)
			this.scale.multiplyScalar( newClickedPoint.length() / this.clickedPoint.length() )
			this.clickedPoint = newClickedPoint
		}

		lengthMarker.scale.y = this.scale.y
		for( var i = 0; i < cmMarkers.length; i++ )
		{
			cmMarkers[i].visible = lengthMarker.scale.y > cmMarkers[i].position.y
		}
	}
	fingerRuler.onClick = function()
	{
		this.clickedPoint = mouse.rayIntersectionWithZPlane(0)
	}

	var fingerGame = {
		isSetUp: false,
		setUp: function()
		{
			clickables.push(fingerRuler)
			objectsToBeUpdated.push(fingerRuler)

			scene.add( fingerRuler )
			scene.add( lengthMarker )
			scene.add(yourFingerIsBeingShownSign)

			for( var i = 0; i < cmMarkers.length; i++ )
			{
				scene.add( cmMarkers[i] )
			}

			this.isSetUp = true;
		},
		setDown: function()
		{
			clickables.splice(fingerRuler,1)
			objectsToBeUpdated.splice(fingerRuler,1)

			scene.remove( fingerRuler )
			scene.remove( lengthMarker )
			scene.remove(yourFingerIsBeingShownSign)

			for( var i = 0; i < cmMarkers.length; i++ )
			{
				scene.remove( cmMarkers[i] )
			}

			this.isSetUp = false;
		}
	}

	return fingerGame
}

function initColoredBalls(numColoredBalls)
{
	var glowingObjects = [];
	glowingObjects.glowing = true
	objectsToBeUpdated.push(glowingObjects)
	glowingObjects.update = function()
	{
		// var glowColor = 0.3 * (Math.sin(frameCount * 0.1)+1)/2
		// if(!glowingObjects.glowing)
		// {
		// 	glowColor = 0;
		// }
		// for(var i = 0; i < glowingObjects.length; i++)
		// {
		// 	if( glowingObjects.glowing )
		// 	{
		// 		glowingObjects[i].material.emissive.setRGB(glowColor,glowColor,glowColor)
		// 	}
		// }
	}

	var coloredBalls = Array(numColoredBalls)
	for(var i = 0; i < coloredBalls.length; i++)
	{
		coloredBalls[i] = new THREE.Mesh(new THREE.SphereGeometry(0.1),new THREE.MeshPhongMaterial())
		coloredBalls[i].castShadow = true;
		glowingObjects.push(coloredBalls[i])
		clickables.push(coloredBalls[i])
		scene.add(coloredBalls[i])
		coloredBalls[i].material.color.setRGB(Math.random(),Math.random(),Math.random())

		coloredBalls[i].position.y = i/(coloredBalls.length-1) * 0.8 - 0.4
	}

	return coloredBalls
}

function initClickableDistributions(normalDistributionsPresent, numWeWant)
{
	function ClickableDistribution( samplingFunction,numControlPoints,numSamples )
	{
		if(numControlPoints === undefined)
		{
			numControlPoints = 11; //if you go too high the noise is bad ;_;
		}
		if(numSamples === undefined)
		{
			numSamples = 30 * numControlPoints;
		}

		var clickableDistribution = new THREE.Mesh(new THREE.PlaneGeometry(numControlPoints*0.2,0.8*numSamples), new THREE.MeshBasicMaterial({transparent:true,opacity:0.001, depthTest:false}))
		clickables.push( clickableDistribution )
		//going the samples route is kiiiinda cheating, but you want to give people an assurance that they'll eventually reproduce what they'll seeing
		clickableDistribution.samples = new Float32Array(numSamples)
		var numSamplesAvailable = numSamples;
		clickableDistribution.samplesDone = new Array(numSamples)
		var highestSample = -Infinity
		var lowestSample = Infinity
		clickableDistribution.mean = 0;
		for(var i = 0; i < numSamples; i++)
		{
			clickableDistribution.samples[i] = samplingFunction()
			clickableDistribution.mean += clickableDistribution.samples[i]

			clickableDistribution.samplesDone[i] = false
			if( highestSample < clickableDistribution.samples[i] )
			{
				highestSample = clickableDistribution.samples[i]
			}
			if( lowestSample > clickableDistribution.samples[i] )
			{
				lowestSample = clickableDistribution.samples[i]
			}
		}
		clickableDistribution.mean /= numSamples

		clickableDistribution.variance = 0;
		for(var i = 0; i < numSamples; i++)
		{
			clickableDistribution.variance += sq( clickableDistribution.samples[i] - clickableDistribution.mean )
		}
		clickableDistribution.variance /= numSamples

		var controlPoints = Array(numControlPoints)
		var areaBeneath = new THREE.Mesh(new THREE.Geometry(), new THREE.MeshPhongMaterial({}))

		var memberHolder = new THREE.Group()
		areaBeneath.add(memberHolder)
		var range = highestSample - lowestSample
		var spacing = 1 / (numControlPoints-1)
		for(var i = 0; i < numControlPoints; i++)
		{
			var position = i * spacing - 0.5
			controlPoints[i] = new THREE.Vector3(position,0,0)

			areaBeneath.geometry.vertices.push(new THREE.Vector3(controlPoints[i].x,0,0)) //i*2+0
			areaBeneath.geometry.vertices.push(controlPoints[i]) //i*2+1
			if( i !== 0 )
			{
				areaBeneath.geometry.faces.push(new THREE.Face3(i*2+0,i*2-1,i*2-2))
				areaBeneath.geometry.faces.push(new THREE.Face3(i*2+0,i*2+1,i*2-1))
			}
		}

		function controlPointIndexFromSample( sample )
		{
			var sampleNormalizedToRange = ( sample - lowestSample ) / range
			sampleNormalizedToRange = clamp( sampleNormalizedToRange, 0, 0.999999999999 )
			var floored = Math.floor( sampleNormalizedToRange * controlPoints.length )
			return floored
		}

		var highestPeak = 0;
		for(var i = 0; i < numSamples; i++)
		{
			var indexOfControlPointToBumpUp = controlPointIndexFromSample( clickableDistribution.samples[i] )
			controlPoints[indexOfControlPointToBumpUp].y++
			if( controlPoints[indexOfControlPointToBumpUp].y > highestPeak)
			{
				highestPeak = controlPoints[indexOfControlPointToBumpUp].y
			}
		}

		clickables.push(areaBeneath)
		clickableDistribution.excitedness = 0
		clickableDistribution.onClick = function()
		{
			if(numSamplesAvailable === 0)
			{
				return;
			}

			var undrawnSampleToDraw = Math.floor( Math.random() * numSamplesAvailable )
			var numUndrawnSamplesGoneThrough = 0
			var sample = null;
			for(var i = 0; i < numSamples; i++)
			{
				if( !clickableDistribution.samplesDone[i] )
				{
					if( numUndrawnSamplesGoneThrough === undrawnSampleToDraw )
					{
						sample = clickableDistribution.samples[ i ]
						clickableDistribution.samplesDone[ i ] = true
						numSamplesAvailable--;
						break;
					}
					numUndrawnSamplesGoneThrough++
				}
			}

			var placeToLand = new THREE.Vector3()
			var controlPointIndex = controlPointIndexFromSample( sample )
			placeToLand.x = controlPoints[ controlPointIndex ].x
			for(var i = 0; i < memberHolder.children.length; i++)
			{
				if( memberHolder.children[i].placeToLand !== undefined && memberHolder.children[i].placeToLand.x === placeToLand.x )
				{
					placeToLand.y++
				}
			}

			var member = Member(placeToLand)
			member.scale.x = spacing * 0.9
			memberHolder.add(member)

			//TODO you want it so the highest column is sort of always nearly there
			var scaleWithNoMembers = 3.5
			memberHolder.scale.y = scaleWithNoMembers - (scaleWithNoMembers-1) * memberHolder.children.length / clickableDistribution.samples.length

			clickableDistribution.excitedness = 1;

			if(normalDistributionsPresent)
			{
				correspondingNormalDistribution.sendInSample(placeToLand.x)
			}
		}

		clickableDistribution.add( areaBeneath )
		var curveOnTop = new THREE.Mesh( new THREE.TubeBufferGeometry( new THREE.CatmullRomCurve3( controlPoints, false, "centripetal" ), controlPoints.length * 8, 0.01 ) )
		// areaBeneath.add( curveOnTop )
		clickableDistribution.width = controlPoints[numControlPoints-1].x * 2
		clickableDistribution.height = highestPeak
		scene.add(clickableDistribution)

		objectsToBeUpdated.push(clickableDistribution)
		clickableDistribution.update = function()
		{
			clickableDistribution.excitedness -= frameDelta * 1.5
			if(clickableDistribution.excitedness < 0)
			{
				clickableDistribution.excitedness = 0
			}
			areaBeneath.material.color.r = clickableDistribution.excitedness
			areaBeneath.position.y = clickableDistribution.excitedness * 5 * sq(Math.sin(frameCount * 0.2))

			if( normalDistributionsPresent )
			{
				correspondingNormalDistribution.scale.y = 1 / clickableDistribution.scale.y
			}
		}

		if(normalDistributionsPresent)
		{
			var correspondingNormalDistribution = MarkedNormalDistribution( clickableDistribution.mean, clickableDistribution.variance )
			clickableDistribution.add(correspondingNormalDistribution)
		}

		return clickableDistribution;
	}

	function Member(placeToLand)
	{
		/*
			Little shockwave? Little bounce?

			Sigh, probably need to synchronize everyone's samples

			The next thing to do is that heart monitor etc thing!!!! For Kate!!!
		*/

		//might need to merge the geometries. That would be fine!
		var member = new THREE.Mesh(memberGeometry,memberMaterial)
		member.placeToLand = placeToLand
		var arcDuration = 0.5;
		member.lifetime = 0;
		member.update = function()
		{
			this.lifetime += frameDelta
			this.position.x = this.lifetime / arcDuration * this.placeToLand.x
			this.position.y = this.placeToLand.y + sq( arcDuration/2 ) * 20
			this.position.y -= sq(this.lifetime - arcDuration/2) * 20

			if( this.lifetime >= arcDuration)
			{
				this.position.copy( this.placeToLand )
			}
		}
		objectsToBeUpdated.push(member)
		
		member.position.x = 0
		member.position.y = member.placeToLand.y

		return member
	}

	var memberGeometry = new THREE.PlaneGeometry(1,2 * 0.9)
	var memberMaterial = new THREE.MeshLambertMaterial({color:0xF15946,depthTest:false})
	for( var i = 0; i < memberGeometry.vertices.length; i++ )
	{
		if(memberGeometry.vertices[i].y < 0)
		{
			memberGeometry.vertices[i].y = 0
		}
	}

	function HumpedClickableDistribution(arrayOfBlocks)
	{
		//the distribution is made of blocks
		var totalBlocks = 0;
		for(var i = 0; i < arrayOfBlocks.length; i++)
		{
			totalBlocks += arrayOfBlocks[i]
		}

		function humpedSamplingFunction()
		{
			var blockWeAreIn = Math.random() * totalBlocks
			var blocksCountedThrough = 0;
			for(var i = 0; i < arrayOfBlocks.length; i++)
			{
				if(blockWeAreIn < blocksCountedThrough + arrayOfBlocks[i] )
				{
					// console.log(i)
					return i
				}
				blocksCountedThrough += arrayOfBlocks[i]
			}
		}
		return ClickableDistribution( humpedSamplingFunction, arrayOfBlocks.length,240 )
	}

	var oneHumpedDistribution = HumpedClickableDistribution([1,1,1,1,4.5,1])
	oneHumpedDistribution.scale.set(1/oneHumpedDistribution.width,0.5/oneHumpedDistribution.height,1)
	oneHumpedDistribution.position.y = -0.5

	if( numWeWant !== 1 )
	{
		var twoHumpedDistribution = HumpedClickableDistribution([1,2.75,1,1,4.5,1])
		twoHumpedDistribution.scale.set(1/twoHumpedDistribution.width,0.5/twoHumpedDistribution.height,1)

		var threeHumpedDistribution = HumpedClickableDistribution([4,1,4,1,1,4])
		threeHumpedDistribution.scale.set(1/threeHumpedDistribution.width,0.5/threeHumpedDistribution.height,1)
		threeHumpedDistribution.position.y = 0.5

		oneHumpedDistribution.scale.multiplyScalar(0.2)
		twoHumpedDistribution.scale.multiplyScalar(0.2)
		threeHumpedDistribution.scale.multiplyScalar(0.2)

		return [oneHumpedDistribution,twoHumpedDistribution,threeHumpedDistribution]
	}
	else
		return [oneHumpedDistribution]
}

function makeCupGame( objectsToHide, defaultScrambleAmount )
{
	//need to bring signs back from the repo
	for(var i = 0; i < objectsToHide.length; i++)
	{
		objectsToHide[i].onClick = function()
		{
			if( this === duplicate.originalObject )
			{
				correctSign.material.opacity = 1
			}
			else
			{
				incorrectSign.material.opacity = 1
			}
			duplicate.remove(duplicate.children[0])
		}
	}

	var texture = new THREE.TextureLoader().load( "data/textures/wand.png" )
	var wand = new THREE.Mesh(new THREE.PlaneGeometry(1/8,1), new THREE.MeshPhongMaterial({map:texture, transparent:true, depthTest:false}))
	wand.geometry.vertices[2].y = 0
	wand.geometry.vertices[3].y = 0
	wand.scale.setScalar(0.5)
	var duplicatingPosition = null
	scene.add(wand)

	wand.duplicateObjectAndCoveringCup = function(object)
	{
		this.objectToDuplicate = object
		duplicatingPosition = this.objectToDuplicate.position.clone()
		duplicatingPosition.x += 0.2
		duplicatingPosition.y -= 0.2

		duplicationProgress = 0;
		progressSpeed = frameDelta * 2.9
	}

	wand.objectToDuplicate = null
	var duplicationProgress = 0;
	var progressSpeed = 0;
	wand.unusedPosition = new THREE.Vector3(1.1,0,0)
	wand.position.copy(wand.unusedPosition)
	wand.update = function()
	{
		var pulse = sq( Math.sin(frameCount * 0.15) )
		this.material.emissive.setRGB(pulse,pulse,0)

		if(this.objectToDuplicate !== null)
		{
			duplicationProgress += progressSpeed

			if(duplicationProgress < 1)
			{
				this.position.lerpVectors(wand.unusedPosition,duplicatingPosition,duplicationProgress)
			}
			else if(duplicationProgress < 2)
			{
				this.position.copy(duplicatingPosition)
				this.rotation.z = (duplicationProgress-1) * TAU/12
			}
			else if(duplicationProgress < 3)
			{
				var placeToSitAndBeInspected = new THREE.Vector3(-0.7,0,0)

				duplicate = this.objectToDuplicate.clone()
				duplicate.update = null
				duplicate.originalObject = this.objectToDuplicate
				scene.add(duplicate)
				duplicate.movementProgress = 0;

				duplicate.update = function()
				{
					this.movementProgress += frameDelta
					if( this.movementProgress > 1 )
					{
						this.movementProgress = 1;
					}
					this.position.lerpVectors(wand.objectToDuplicate.position, placeToSitAndBeInspected,this.movementProgress)
				}
				// duplicate.onClick = this.objectToDuplicate.onClick
				// clickables.push(duplicate)

				objectsToBeUpdated.push(duplicate)

				progressSpeed *= -1	
			}
		}
	}
	objectsToBeUpdated.push(wand)

	var cupRadius = 0.12
	var cupInnerRadius = cupRadius * 0.86
	var cupHeight = 2 * cupRadius
	var cupRoundedness = 4;
	var radialSegments = 16;
	var cupGeometry = new THREE.CylinderGeometry( cupRadius, cupRadius, cupHeight, radialSegments)

	var indexOfVertexAtBottom = cupGeometry.vertices.length-1; //2?
	for(var i = 0; i < cupGeometry.faces.length; i++)
	{
		for(var j = 0; j < 3; j++)
		{
			if( cupGeometry.faces[i].getCorner(j) === indexOfVertexAtBottom )
			{
				cupGeometry.faces[i].set(indexOfVertexAtBottom,indexOfVertexAtBottom,indexOfVertexAtBottom)
				break;
			}
		}
	}
	cupGeometry.merge( new THREE.CylinderGeometry( cupInnerRadius, cupInnerRadius, cupHeight, radialSegments,1,true) )
	cupGeometry.merge( new THREE.RingGeometry( cupInnerRadius, cupRadius, radialSegments).applyMatrix(new THREE.Matrix4().makeRotationX(TAU/4).setPosition(new THREE.Vector3(0,-cupHeight/2,0))) )
	var cupMaterial = new THREE.MeshLambertMaterial({color:0xC0C0FF, side:THREE.DoubleSide})

	var handleThickness = cupRadius / 6
	var handleGeometry = new THREE.TorusGeometry(cupRadius/1.5,handleThickness,16,16,TAU/2)
	handleGeometry.applyMatrix(new THREE.Matrix4().makeRotationZ(-TAU/4))
	handleGeometry.applyMatrix(new THREE.Matrix4().makeTranslation(cupRadius-handleThickness,0,0))
	cupGeometry.merge(handleGeometry)

	function Cup()
	{
		var cup = new THREE.Mesh(cupGeometry, cupMaterial);
		cup.castShadow = true;
		cup.progressSpeed = 0;
		cup.hidingProgress = 0;
		var hideTarget = null

		cup.hide = function( newHideTarget )
		{
			hideTarget = newHideTarget
			this.hidingProgress = 0
			this.progressSpeed = frameDelta * 1.5
		}

		cup.reveal = function()
		{
			THREE.SceneUtils.detach(this,hideTarget,scene)
			this.progressSpeed = -frameDelta * 1.5
		}

		cup.update = function()
		{
			if(hideTarget !== null)
			{
				var behindPosition = hideTarget.position.clone()
				behindPosition.z -= cupHeight

				var oldHidingProgress = this.hidingProgress
				this.hidingProgress += this.progressSpeed

				if(this.hidingProgress < 1) //go to it
				{
					this.position.lerpVectors(this.unusedPosition,behindPosition,this.hidingProgress)
					this.rotation.x = -TAU/4 * this.hidingProgress
				}
				else if(this.hidingProgress < 2) //go forward
				{
					this.position.lerpVectors(behindPosition,hideTarget.position,this.hidingProgress-1)
					this.rotation.x = -TAU/4
				}
				else if(this.hidingProgress < 3) //enclose it
				{
					var progressThroughThisPart = this.hidingProgress-2
					this.position.copy(hideTarget.position)
					this.rotation.x = -TAU/4 * (1-progressThroughThisPart)
				}
				else if(oldHidingProgress < 3)//make sure we've enclosed it
				{
					this.position.copy( hideTarget.position )
					this.rotation.x = 0;

					THREE.SceneUtils.attach(this,scene,hideTarget)

					this.hidingProgress = 3
					this.progressSpeed = 0;
				}
			}
		}
		objectsToBeUpdated.push( cup )

		scene.add( cup )
		return cup;
	}

	var cups = Array(objectsToHide.length);
	for(var i = 0; i < cups.length; i++)
	{
		cups[i] = Cup();
		cups[i].unusedPosition = new THREE.Vector3(1.2,-(i-1) * cupHeight * 1.2,0)
		cups[i].position.copy(cups[i].unusedPosition)
	}

	var duplicate = null

	//"story"
	{
		
		for(var i = 0; i < objectsToHide.length; i++)
		{
			cups[i].hide(objectsToHide[i])
		}
		
		var scrambleCount = 0
		var startingSwapsPerSecond = 1.2
		var swapsPerSecond = startingSwapsPerSecond
		var originA = new THREE.Vector3()
		var originB = new THREE.Vector3()
		var objectA = null
		var objectB = null
		var swapProgress = 0

		var manager = {};
		var puzzlingStep = 0;
		var scrambleStarted = false;
		var duplicationStarted = false;
		manager.update = function()
		{
			if(puzzlingStep === 0) //moving cups
			{
				if(cups[0].hidingProgress >= 3)
				{
					scrambleCount = defaultScrambleAmount
					puzzlingStep++;
				}
			}

			if( puzzlingStep === 1 ) //duplication
			{
				if( scrambleCount === 0 )
				{
					wand.duplicateObjectAndCoveringCup( objectsToHide[0] )
					puzzlingStep++;
				}
			}

			if( puzzlingStep === 2 )
			{
				if( duplicate !== null && duplicate.movementProgress >= 1)
				{
					scrambleCount = defaultScrambleAmount
					puzzlingStep++;
				}
			}

			if( puzzlingStep === 3 )
			{
				if( duplicate !== null && duplicate.movementProgress >= 1)
				{
					scrambleCount = defaultScrambleAmount
					puzzlingStep++;
				}
			}

			if( puzzlingStep === 4 )
			{
				if( scrambleCount === 0 )
				{
					for(var i = 0; i < cups.length; i++)
					{
						cups[i].reveal();
					}
					puzzlingStep++;
				}
			}

			//-----actually doing stuff
			if( scrambleCount !== 0 )
			{
				if( objectA === null )
				{
					var swap = Math.floor(Math.random() * objectsToHide.length)
					objectA = objectsToHide[swap];
					objectB = objectsToHide[(swap+1)%objectsToHide.length]

					originA.copy(objectA.position)
					originB.copy(objectB.position)
				}

				swapProgress += frameDelta * swapsPerSecond

				var pointToRotateAround = originA.clone().lerp(originB,0.5)

				objectA.position.copy(originA)
				objectA.position.sub(pointToRotateAround)
				objectA.position.applyAxisAngle(zUnit,TAU / 2 * swapProgress)
				objectA.position.add(pointToRotateAround)

				objectB.position.copy(originB)
				objectB.position.sub(pointToRotateAround)
				objectB.position.applyAxisAngle(zUnit,TAU / 2 * swapProgress)
				objectB.position.add(pointToRotateAround)

				if( swapProgress >= 1 )
				{
					objectA.position.copy(originB)
					objectB.position.copy(originA)

					objectA = null;
					objectB = null;

					swapProgress = 0;

					swapsPerSecond *= 1.5
					swapsPerSecond = clamp(swapsPerSecond,0,8)

					scrambleCount--;
					if(scrambleCount <= 0)
					{
						swapsPerSecond = startingSwapsPerSecond
					}
				}
			}
		}
	}
	objectsToBeUpdated.push(manager)
}

function initEditableDistributionWithPopulation()
{
	//------------Population stuff
	var population = Array(28);
	const verticalSpacing = 2/(16/9) / population.length
	const max = 10;
	const height = verticalSpacing / 1.1

	population.representation = new THREE.Group()
	population.representation.position.x = -0.9
	population.representation.scale.x = 1/max
	scene.add( population.representation )
	objectsToBeUpdated.push(population.representation)
	population.representation.update = function()
	{
		// if(mouse.lastClickedObject === null && mouse.clicking)
		// {
		// 	mouse.rotateObjectByGesture(this)
		// }
	}

	var barGeometry = new THREE.OriginCorneredPlaneBufferGeometry();
	var beepHeights = [0,0,0,0,0,0,0,0,0,-1,0,-7,10,-1,0,2]

	var fingerMaterial = new THREE.MeshBasicMaterial({map:new THREE.TextureLoader().load( "data/textures/heart.jpg" )})
	var fingerGeometry = new THREE.OriginCorneredPlaneBufferGeometry(0.5,1)

	var fingerRuler = new THREE.Mesh( fingerGeometry, fingerMaterial )
	for(var i = 0, il = population.length; i < il; i++)
	{
		population[i] = new THREE.Mesh(barGeometry,new THREE.MeshBasicMaterial({side:THREE.DoubleSide}))

		population[i].scale.x = Math.round( Math.random() * max ) + 1 //if the scale is 0 the determinant is an error

		population[i].material.color.setRGB((max-population[i].scale.x)/max,1,(max-population[i].scale.x)/max)
		// population[i].castShadow = true;
		population[i].scale.y = height
		population[i].position.y = i * verticalSpacing - il / 2 * verticalSpacing
		population[i].correctPosition = population[i].position.clone()
		population.representation.add(population[i])

		population[i].clickedPoint = null;
		population[i].update = function()
		{
			this.position.lerp( this.correctPosition, 0.1)

			if(mouse.clicking && mouse.lastClickedObject === this)
			{
				/*
					Move bar up and down (only useful for visualization)?
					"stack" them?
					Arguably no. The point of the interaction is to achieve something. The mutual control does that
				*/
				var newClickedPoint = mouse.rayIntersectionWithZPlane(population.representation.position.z)

				this.scale.x += (newClickedPoint.x - this.clickedPoint.x) / population.representation.scale.x
				this.material.color.setRGB((max-this.scale.x)/max,1,(max-this.scale.x)/max)

				this.clickedPoint = newClickedPoint

				refreshFromPopulation()
			}
			// if(mouse.lastClickedObject === this && !mouse.clicking && mouse.oldClicking)
			// {
			// 	this.scale.x = Math.round( this.scale.x ) + 0.00000000001

			// 	refreshFromPopulation()
			// }
		}
		population[i].onClick = function()
		{
			//TODO to get the closest one to your click in case it's between
			this.clickedPoint = mouse.rayIntersectionWithZPlane(population.representation.position.z)
		}
		clickables.push(population[i])
		objectsToBeUpdated.push(population[i])

		{
			var numRounds = 1+Math.round(population[i].scale.x)
			var beepControlPoints = Array( numRounds * beepHeights.length )
			for(var round = 0; round < numRounds; round++)
			{
				for(var j = 0; j < beepHeights.length; j++)
				{
					var index = round*beepHeights.length + j
					beepControlPoints[index] = new THREE.Vector3(index * 5.6,beepHeights[j]*0.13,0)
				}
			}
			// console.log(beepControlPoints)
			population[i].beeps = new THREE.Mesh( new THREE.TubeBufferGeometry( new THREE.CatmullRomCurve3( beepControlPoints, false, "centripetal" ), beepControlPoints.length * 3, 0.3 ), new THREE.MeshBasicMaterial({color:0xFF0000}) )
			population.representation.add(population[i].beeps)
			population[i].beeps.position.copy(population[i].position)
			population[i].beeps.position.y+=height/2
			population[i].beeps.scale.multiplyScalar(0.01)
		}
	}

	// population.sort(function(a,b){ return a.scale.x - b.scale.x })

	// for(var i = 0, il = population.length; i < il; i++)
	// {
	// 	population[i].correctPosition.y = i * verticalSpacing - il / 2 * verticalSpacing
	// }

	// for(var i = 0, il = data.length; i < il; i++)
	// {
	// 	data[i].correctPosition.y = data[i].scale.x - il / 2 * dataSpacing
	// 	for(var j = 0; j < data.length; j++)
	// 	{
	// 		if(data[j].correctPosition.y === data[i].correctPosition.y)
	// 		{
	// 			data[i].correctPosition.z -= dataSpacing
	// 		}
	// 	}
	// }

	// ----------
	// for(var i = 0; i < data.length; i++)
	// {
	// 	distribution.controlPoints[Math.round(data[i].scale.x)]++;
	// }

	var controlPoints = Array(max+1)
	var width = 0.9;
	for(var i = 0; i < controlPoints.length; i++)
	{
		controlPoints[i] = new THREE.Vector3( i, 0, 0 )
	}
	var populationDistributionCurve = new THREE.Mesh( new THREE.TubeBufferGeometry( new THREE.CatmullRomCurve3( controlPoints, false, "centripetal" ), controlPoints.length * 13, 0.09 ) )

	function refreshFromPopulation()
	{
		for(var i = 0; i < controlPoints.length; i++)
		{
			controlPoints[i].y = 0
			for(var j = 0; j < population.length; j++)
			{
				if( Math.round(population[j].scale.x) === i )
				{
					controlPoints[i].y++;
				}
			}
		}

		populationDistributionCurve.geometry.refreshSegmentsFromCurve()
	}
	refreshFromPopulation()

	var highest = 0;
	for(var i = 0; i < controlPoints.length; i++)
	{
		highest = Math.max(highest,controlPoints[i].y)
	}

	populationDistributionCurve.scale.x = 1/max
	populationDistributionCurve.scale.z = populationDistributionCurve.scale.x
	populationDistributionCurve.scale.y = 1/(16/9)/highest
	//you may be asking it to take a bad number of points
	scene.add(populationDistributionCurve)
	populationDistributionCurve.position.y = -0.4
	populationDistributionCurve.scale.x *= 0.9

	clickables.push(populationDistributionCurve)
	var grabbedPoint = null;
	populationDistributionCurve.onClick = function(intersection)
	{
		var localIntersection = intersection.point.clone()
		this.worldToLocal(localIntersection)
		grabbedPoint = controlPoints[0]
		for(var i = 1; i < controlPoints.length; i++ )
		{
			if( Math.abs( controlPoints[i].x - localIntersection.x ) < Math.abs( grabbedPoint.x - localIntersection.x ) )
			{
				grabbedPoint = controlPoints[i]
			}
		}
		//and those whose height is equal to this number flash
	}

	objectsToBeUpdated.push(populationDistributionCurve)
	populationDistributionCurve.update = function()
	{
		if(grabbedPoint !== null)
		{
			var placeDraggedTo = mouse.rayIntersectionWithZPlane(0)
			this.worldToLocal(placeDraggedTo)
			grabbedPoint.y = placeDraggedTo.y
			populationDistributionCurve.geometry.refreshSegmentsFromCurve()

			if( mouse.lastClickedObject !== this || !mouse.clicking )
			{
				grabbedPoint = null
			}
		}
	}
}

//as you "pick up more" for your sample
function MarkedNormalDistribution( mean, variance )
{
	//this gets plotted and you use it geometrically
	var numControlPoints = 30;
	var controlPoints = Array(numControlPoints)
	var graphWidth = 10;
	for(var i = 0; i < numControlPoints; i++)
	{
		var normalizedToMinusOneHalfToPlusOneHalf = (i-numControlPoints/2) / numControlPoints
		var position = mean + graphWidth * normalizedToMinusOneHalfToPlusOneHalf;
		controlPoints[i] = new THREE.Vector3( position, 0, 0 )
		controlPoints[i].y = normal(position, mean, variance)
	}

	var graph = new THREE.Mesh( new THREE.TubeBufferGeometry( new THREE.CatmullRomCurve3( controlPoints, false, "centripetal" ), controlPoints.length * 8, 0.01 ) )
	graph.scale.x = 0.9/graphWidth

	var areaBeneath = new THREE.Mesh(new THREE.Geometry(), new THREE.MeshPhongMaterial({vertexColors:THREE.FaceColors}))
	graph.add(areaBeneath)
	var sd = Math.sqrt(variance)
	for(var i = 0; i < numControlPoints; i++)
	{
		areaBeneath.geometry.vertices.push(new THREE.Vector3(controlPoints[i].x,0,0)) //i*2+0
		areaBeneath.geometry.vertices.push(controlPoints[i]) //i*2+1
		var r = Math.abs( controlPoints[i].x - mean ) < 1.96 * sd ? 0 : 1
		if( i !== 0 )
		{
			areaBeneath.geometry.faces.push(new THREE.Face3(i*2+0,i*2-1,i*2-2))
			areaBeneath.geometry.faces[areaBeneath.geometry.faces.length-1].color.setRGB(r,0,0)
			areaBeneath.geometry.faces.push(new THREE.Face3(i*2+0,i*2+1,i*2-1))
			areaBeneath.geometry.faces[areaBeneath.geometry.faces.length-1].color.setRGB(r,0,0)
		}
	}

	var meanMarker = new THREE.Mesh(new THREE.CircleGeometry(0.04,32 ), new THREE.MeshBasicMaterial({depthTest:false}))
	graph.add(meanMarker) //you're going to send it samples
	meanMarker.scale.x = 1 / graph.scale.x
	meanMarker.position.x = Infinity

	var numSamplesSoFar = 0;
	var sumSoFar = 0;
	graph.sendInSample = function(sample)
	{
		sumSoFar += sample
		numSamplesSoFar++;
		meanMarker.position.x = sumSoFar / numSamplesSoFar
		
		//seriously need to sort this. It has to be the absolute value.
	}

	return graph
}

function normal(position, mean, variance)
{
	var multiple = 1 / Math.sqrt( TAU * variance )
	var exponent = -sq( position - mean ) / ( 2 * variance )
	return multiple * Math.exp(exponent)
}

function studentsT(t,sampleSize)
{
	if( !(sampleSize>0) )
	{
		console.error("nope")
	}
	else if( sampleSize > 19 )
	{
		return Math.exp(-t*t)
	}
	else
	{
		//it might be so close that you're better off always using normal dist
		//everyone knows you want a big sample
		var v = sampleSize - 1;
		var numerator = gamma(sampleSize/2)
		var denominator = Math.sqrt(Math.PI*v)*gamma(v/2)
		var extra = Math.pow(1+t*t/v,-(sampleSize/2))
		return numerator/denominator*extra;
	}
}

function generateGaussianNoise()
{
	// var u = 0, v = 0;
	// while(u === 0) u = Math.random();
	// while(v === 0) v = Math.random();
	// return Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( TAU * v );

	var rand = 0;

	for (var i = 0; i < 6; i += 1) {
		rand += Math.random();
	}

	return rand / 6;
}

function gamma(z)
{
	var g = 7;
	var C = [0.99999999999980993, 676.5203681218851, -1259.1392167224028,771.32342877765313, -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];

	if(z < 0.5)
	{
		return Math.PI / (Math.sin(Math.PI * z) * gamma(1 - z));
	}
	else
	{
	    z -= 1;

	    var x = C[0];
	    for (var i = 1; i < g + 2; i++)
	    {
	    	x += C[i] / (z + i);
	    }

	    var t = z + g + 0.5;
	    return Math.sqrt(2 * Math.PI) * Math.pow(t, (z + 0.5)) * Math.exp(-t) * x;
	}
}

/*
	Other ideas
		Transparency thing?
		Identify normal distributions?
			median and mean don't coincide = not normal dist
			Interquartile range
		The most interesting part of this long term is that the user controls a discrete distribution (the normal distribution is not that interesting)
		Obvious, so say it: the larger the sample size, the more confident you are about how close you are to population mean
		"free sample" to introduce the term sample
		Every time you hear some bloody statistic, this is what they've done
		Cloud of points with the same PDF governing their x,y,z
			Take their manhattan distance
			i.e. take the lines connecting them to the origin paralell to the axes then straighten them
			Might work better/well with more than three axes!
*/
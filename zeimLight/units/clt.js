/*
	Part 1: "How to perform a one-sample z-test"
		A few pictures of applications
		Probability distributions
			Sorting then grouping
			Bobble going up and down as you change some values
		Scaling and moving normal dist
		Seeing the average on a normal distribution
		The thing where you have multiple studies and must trade off sample sizes
			Slider for spreading samples amongst multiple tests
		Show the formula
		P value only works if it is in scene, and points to whatever else is in scene

	Part 2: Why the z-test works, and why not to use it
		Normal distribution animation.
			A long line of balls going back on z, all with copies of the graph
			They all jump forward by one sample of the distribution
			The graphs jump with them
			They jump forward a bunch more times
		We boil a known distribution down to its mean and variance
			Because there are many distributions out there and it's hard to make a scheme that works for all

	TODO
		Taking samples away

	They see the normal distribution describing where the average should go
	They should get used to looking at the normal distribution next to it, using it to "get out early"
	We are NOT showing the actual graph, or actual samples, just the normal distribution
	And all you're doing is accepting/rejecting a single graph
	Now: automated. You see loads at a time.
	You see ~200 sample means marked on as many distributions next to a "accept/reject"
	You're given a specific n, at least at this point
	Then you click "go" and "correct/incorrect" pop up on all the graphs.
	You get shown another bunch
	Should be able to see that approximately 200 * p of them give false positives
	You can control the n - but it means you do more/less experiments
*/

function initNormalDistributionAnimation()
{
	//want to be able to draw the distribution
	//and obviously sort and group

	let balls = Array(100)
	let ballGeometry = new THREE.SphereGeometry(0.08)
	let ballMaterial = new THREE.MeshPhongMaterial()
	for( let i = 0; i < balls.length; i++)
	{
		balls[i] = new THREE.Mesh(ballGeometry,ballMaterial)
		balls[i].position.set(-0.5,0,-i*0.1)
		scene.add(balls[i])
	}

	bindButton( "space", function()
	{
		for( let i = 0; i < balls.length; i++)
		{
			balls[i].position.x += 0.01
		}
	}, "advance clt animation" )
}

function initClt()
{
	initNormalDistributionAnimation()
	return

	// {
	// 	let counter = makeTextSign("Score: 0")
	// 	scene.add(counter)
	// 	let numRightSoFar = 0;
	// 	let numWrongSoFar = 0;
	// 	counter.update = function()
	// 	{
	// 		let totalSoFar = (numRightSoFar + numWrongSoFar)
	// 		let amountTheyGotThroughGuessing = Math.round(numRightSoFar / 3) //TODO
	// 		this.updateText("Score: " + numRightSoFar.toString())
	// 	}
	// }

	// initEditableDistributionWithPopulation()


	// let fingerChapter = initFinger()
	// var fingerNormalDist = []
	// for(var i = 0; i < 20; i++)
	// {
	// 	fingerNormalDist.push(1+Math.exp(-i*i))
	// }
	// let fingerDist = ClickableDistribution(false,fingerNormalDist,false,fingerChapter,false)
	// fingerDist.position.y = -0.3 
	// fingerChapter.add(fingerDist,"sceneElements")

	initClickableDistributions()

	//clicking seems to get the things if you wait for animation to complete???? There were situations where it didn't happen!

	let singleCdChapter = Chapter()
	let singularDist = HumpedClickableDistribution(true,[0.7,0.7,1.2,0.7,1.1,2.6,3,3.6,2.5,1],false,singleCdChapter,false)
	singleCdChapter.add(singularDist,"sceneElements")
	singularDist.position.y -= 0.24

	return

	{
		let numColoredBalls = 2;
		let numSwaps = 2;
		
		function makeBallAndCupChapter(newChapterPosition)
		{
			let cupChapter = Chapter( newChapterPosition )

			let coloredBalls = Array(numColoredBalls)
			for(let i = 0; i < coloredBalls.length; i++)
			{
				coloredBalls[i] = ColoredBall()
				coloredBalls[i].position.y = i/(coloredBalls.length-1) * 0.8 - 0.4
				cupChapter.add(coloredBalls[i],"sceneElements")
			}
			makeCupGame(coloredBalls, Math.floor(numSwaps), cupChapter)

			if( numColoredBalls === 2 || (numColoredBalls<4 && numSwaps>6))
			{
				numColoredBalls++
			}
			else
			{
				numSwaps += 0.86
			}

			return cupChapter
		}
		
		makeResettableChapter(makeBallAndCupChapter)
	}

	{
		function makeCdAndCupChapter(newChapterPosition)
		{
			let numDistributions = 3
			let cdAndCupChapter = Chapter( newChapterPosition )

			let clickableDistributions = Array(numDistributions)
			for(let i = 0; i < numDistributions; i++)
			{
				let humpArray = Array(5)
				for(let j = 0; j < humpArray.length; j++)
				{
					humpArray[j] = 1 + Math.floor( Math.random() * 5)
				}

				let newDistribution = HumpedClickableDistribution(true, humpArray,false,cdAndCupChapter,true )
				newDistribution.scale.multiplyScalar(0.2)
				newDistribution.position.y = 0.3 * (i-(clickableDistributions.length-1)/2)

				clickableDistributions[i] = newDistribution
			}
			
			makeCupGame(clickableDistributions, 6, cdAndCupChapter)
			return cdAndCupChapter
		}

		makeResettableChapter(makeCdAndCupChapter)
	}

	{
		function makeTimedCdAndCupChapter(newChapterPosition)
		{
			let numDistributions = 3
			let timedCdAndCupChapter = Chapter( newChapterPosition )

			let clickableDistributions = Array(numDistributions)
			for(let i = 0; i < numDistributions; i++)
			{
				let humpArray = Array(5)
				for(let j = 0; j < humpArray.length; j++)
				{
					humpArray[j] = 1 + Math.floor( Math.random() * 5)
				}

				let newDistribution = HumpedClickableDistribution(true, humpArray,false,timedCdAndCupChapter,true )
				newDistribution.scale.multiplyScalar(0.2)
				newDistribution.position.y = 0.3 * (i-(clickableDistributions.length-1)/2)

				clickableDistributions[i] = newDistribution
			}

			let timeLeft = 10 + Math.random() * 6
			let timer = makeTextSign("Time left: " + (20).toString() )
			timer.position.x = 0.8
			timer.update = function()
			{
				timeLeft -= frameDelta
				if(timeLeft >= 0)
				{
					timer.material = makeTextSign("Time left: " + (Math.floor(timeLeft)).toString(),true)
				}
				else if(timeLeft > -2.3)
				{
					timer.material.color.setRGB(1,0,0)
				}
				else
				{

				}
			}
			// scene.add(timer)
			// updatables.push(timer)
			timedCdAndCupChapter.add(timer,"sceneElements")
			timedCdAndCupChapter.add(timer,"updatables")
			//then auto-reset?
			
			makeCupGame(clickableDistributions, 4, timedCdAndCupChapter, false,true)
			return timedCdAndCupChapter
		}

		makeResettableChapter(makeTimedCdAndCupChapter)
	}

	{
		function makeSimpleAcceptRejectChapter(newChapterPosition)
		{
			let simpleAcceptRejectChapter = Chapter(newChapterPosition)

			let clickableDistributions = Array(2)
			for(let i = 0; i < clickableDistributions.length; i++)
			{
				let humpArray = Array(5)
				for(let j = 0; j < humpArray.length; j++)
				{
					humpArray[j] = 1 + Math.floor( Math.random() * 5)
				}

				let newDistribution = HumpedClickableDistribution(false, humpArray,false,simpleAcceptRejectChapter,true )
				newDistribution.scale.multiplyScalar(0.2)
				newDistribution.position.y = 0.3 * (i-(clickableDistributions.length-1)/2)

				clickableDistributions[i] = newDistribution
			}
			
			let cupGame = makeCupGame( clickableDistributions, 4, simpleAcceptRejectChapter, true, true )

			return simpleAcceptRejectChapter
		}
		makeResettableChapter(makeSimpleAcceptRejectChapter)
	}

	{
		function makePValueChapter(newChapterPosition)
		{
			let pValueChapter = Chapter(newChapterPosition)

			let clickableDistributions = Array(2)
			for(let i = 0; i < clickableDistributions.length; i++)
			{
				let humpArray = Array(5)
				for(let j = 0; j < humpArray.length; j++)
				{
					humpArray[j] = 1 + Math.floor( Math.random() * 5)
				}

				let newDistribution = HumpedClickableDistribution(false,humpArray,false,pValueChapter,true )
				newDistribution.scale.multiplyScalar(0.2)
				newDistribution.position.y = 0.3 * (i-(clickableDistributions.length-1)/2)

				clickableDistributions[i] = newDistribution
			}
			
			let cupGame = makeCupGame( clickableDistributions, 4, pValueChapter, true, true )

			var pointer = new THREE.Mesh(new THREE.Geometry(),new THREE.MeshBasicMaterial({color:0x707070,side:THREE.DoubleSide}))
			pointer.geometry.vertices.push(new THREE.Vector3(0,cupGame.position.y,0),new THREE.Vector3(-0.1,0,0),new THREE.Vector3(0.1,0,0))
			pointer.geometry.faces.push(new THREE.Face3(0,1,2))
			pValueChapter.add(pointer,"sceneElements")
			pValueChapter.add(pointer,"updatables")
			let userP = 0.5 //nooo, line up with slider
			pointer.update = function()
			{
				pointer.geometry.vertices[0].x = cupGame.decideBasedOnPValue(userP)
				pointer.geometry.verticesNeedUpdate = true
			}

			function changePValue(valueBetweenZeroAndOne)
			{
				// let valueBetweenMinusOneAndOne = 2 * valueBetweenZeroAndOne - 1
				// let valueInCenter = 0.1 //be very skeptical, these fucking things have similar means
				// let normalizer = Math.log(1/valueInCenter)
				userP = valueBetweenZeroAndOne //valueInCenter * Math.exp(valueBetweenMinusOneAndOne * normalizer)
			}
			let slider = SliderSystem(changePValue, userP, true,pValueChapter)
			let sliderHeight = 0.05
			let sliderWidth = 0.7
			slider.setDimensions(sliderWidth,sliderHeight)
			slider.position.x -= sliderWidth / 2
			slider.position.y = -1/(16/9) + sliderHeight * 2

			pointer.geometry.vertices[1].y = slider.position.y
			pointer.geometry.vertices[2].y = slider.position.y

			var skeptical = makeTextSign("Skeptical")
			var accepting = makeTextSign("Accepting")
			pValueChapter.add(skeptical,"sceneElements")
			pValueChapter.add(accepting,"sceneElements")
			pValueChapter.functionsToCallOnSetUp.push(function()
			{
				skeptical.material = makeTextSign("Skeptical",true)	
				accepting.material = makeTextSign("Accepting",true)	
			})
			skeptical.position.y = slider.position.y
			skeptical.position.x = 0.55
			accepting.position.y = slider.position.y
			accepting.position.x = -0.55

			return pValueChapter
		}

		makeResettableChapter(makePValueChapter)
	}
}



function initFinger()
{
	let fingerMaterial = new THREE.MeshBasicMaterial()
	fingerMaterial.map = new THREE.TextureLoader().load( "data/textures/finger.jpg" )
	let fingerGeometry = new THREE.OriginCorneredPlaneBufferGeometry(0.5,1)
	
	let fingerRuler = new THREE.Mesh( fingerGeometry, fingerMaterial )
	fingerRuler.scale.multiplyScalar(0.5)
	fingerRuler.position.x -= 0.5
	
	let markerThickness = 0.01
	let lengthMarker = new THREE.Mesh(
		new THREE.OriginCorneredPlaneBufferGeometry(markerThickness,1),
		new THREE.MeshBasicMaterial({color:0x0000FF}))
	lengthMarker.position.x = fingerRuler.position.x - 0.05
	let cmMarkers = Array(10)
	let markerLength = markerThickness*4
	let markerSpacing = 0.1
	for( let i = 0; i < cmMarkers.length; i++ )
	{
		cmMarkers[i] = new THREE.Mesh(
			new THREE.OriginCorneredPlaneBufferGeometry(markerLength,markerThickness),
			new THREE.MeshBasicMaterial({color:0x0000FF}))
		cmMarkers[i].position.y = i * markerSpacing
		cmMarkers[i].position.x = lengthMarker.position.x - markerLength

		let numberSign = makeTextSign( i.toString() )
		numberSign.position.x = -markerLength/2
		cmMarkers[i].add( numberSign )

		// console.log(cmMarkers)
	}

	fingerRuler.clickedPoint = null;
	fingerRuler.update = function()
	{
		if(mouse.clicking && mouse.lastClickedObject === this)
		{
			let newClickedPoint = mouse.rayIntersectionWithZPlane(0)
			this.scale.multiplyScalar( newClickedPoint.distanceTo(this.position) / this.clickedPoint.distanceTo(this.position) )
			this.clickedPoint = newClickedPoint
		}

		lengthMarker.scale.y = this.scale.y
		for( let i = 0; i < cmMarkers.length; i++ )
		{
			cmMarkers[i].visible = lengthMarker.scale.y > cmMarkers[i].position.y
		}
	}
	fingerRuler.onClick = function()
	{
		this.clickedPoint = mouse.rayIntersectionWithZPlane(0)
	}

	let fingerChapter = Chapter()
	fingerChapter.add(fingerRuler,"sceneElements")
	fingerChapter.add(lengthMarker,"sceneElements")
	fingerChapter.add(fingerRuler,"clickables")
	fingerChapter.add(fingerRuler,"updatables")
	for( let i = 0; i < cmMarkers.length; i++ )
	{
		fingerChapter.add(cmMarkers[i],"sceneElements")
	}

	return fingerChapter
}

function HumpedClickableDistribution(haveProfilePicture,arrayOfBlocks, normalDistributionsPresent,chapter, spray)
{
	//the distribution is made of blocks
	let totalBlocks = 0;
	for(let i = 0; i < arrayOfBlocks.length; i++)
	{
		totalBlocks += arrayOfBlocks[i]
	}

	function humpedSamplingFunction()
	{
		let blockWeAreIn = Math.random() * totalBlocks
		let blocksCountedThrough = 0;
		for(let i = 0; i < arrayOfBlocks.length; i++)
		{
			if(blockWeAreIn < blocksCountedThrough + arrayOfBlocks[i] )
			{
				// console.log(i)
				return i
			}
			blocksCountedThrough += arrayOfBlocks[i]
		}
	}
	return ClickableDistribution( haveProfilePicture, humpedSamplingFunction, arrayOfBlocks.length,240, normalDistributionsPresent,chapter,spray )
}

let ClickableDistribution = null;
function initClickableDistributions()
{
	let textureLoader = new THREE.TextureLoader()
	let profilePictures = Array(19)
	let profilePictureGeometry = new THREE.OriginCorneredPlaneBufferGeometry(1,1)
	for(let i = 0; i < profilePictures.length; i++)
	{
		let fileName = i.toString()
		if(i < 10)
		{
			fileName = "0" + fileName
		}

		if(i < 8)
		{
			fileName += ".png"
		}
		else
		{
			fileName += ".jpg"
		}

		profilePictures[i] = new THREE.Mesh(profilePictureGeometry,new THREE.MeshBasicMaterial())
		// profilePictures[i].material.color.setRGB(Math.random(),Math.random(),Math.random())
		profilePictures[i].material.map = textureLoader.load( 'data/textures/rugbyPlayers/' + fileName )
	}

	let lowestUnusedProfilePicture = 0;

	ClickableDistribution = function(haveProfilePicture, samplingFunction,numControlPoints = 11,numSamples = 30 * numControlPoints, normalDistributionsPresent, chapter, spray, samples, cup )
	{
		//if you go too high on numControlPoints the noise is bad ;_;

		let clickableDistribution = new THREE.Mesh(
			new THREE.PlaneGeometry(numControlPoints*0.2),
			new THREE.MeshBasicMaterial({transparent:true,opacity:0.001}))
		clickableDistribution.geometry.vertices[2].y = 0
		clickableDistribution.geometry.vertices[3].y = 0

		//very hacky
		chapter.add(clickableDistribution,"clickables")
		chapter.add(clickableDistribution,"updatables")

		//going the samples route is kiiiinda cheating, but you want to give people an assurance that they'll eventually reproduce what they'll seeing
		let numSamplesAvailable = numSamples;
		clickableDistribution.samplesDone = new Array(numSamples)
		let highestSample = -Infinity
		let lowestSample = Infinity
		clickableDistribution.mean = 0;

		if( samples === undefined )
		{
			clickableDistribution.samples = new Float32Array(numSamples)
			for(let i = 0; i < numSamples; i++)
			{
				clickableDistribution.samples[i] = samplingFunction()
			}
		}
		else
		{
			clickableDistribution.samples = samples
		}

		for(let i = 0; i < numSamples; i++)
		{
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
		for(let i = 0; i < numSamples; i++)
		{
			clickableDistribution.variance += sq( clickableDistribution.samples[i] - clickableDistribution.mean )
		}
		clickableDistribution.variance /= numSamples

		let controlPoints = Array(numControlPoints)
		let areaBeneath = new THREE.Mesh(new THREE.Geometry(), new THREE.MeshPhongMaterial({}))

		let memberHolder = new THREE.Group()
		areaBeneath.add(memberHolder)
		let range = highestSample - lowestSample
		let spacing = 1 / (numControlPoints-1)
		for(let i = 0; i < numControlPoints; i++)
		{
			let position = i * spacing - 0.5
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
			let sampleNormalizedToRange = ( sample - lowestSample ) / range
			sampleNormalizedToRange = clamp( sampleNormalizedToRange, 0, 0.999999999999 )
			let floored = Math.floor( sampleNormalizedToRange * controlPoints.length )
			return floored
		}

		let highestPeak = 0;
		for(let i = 0; i < numSamples; i++)
		{
			let indexOfControlPointToBumpUp = controlPointIndexFromSample( clickableDistribution.samples[i] )
			controlPoints[indexOfControlPointToBumpUp].y++
			if( controlPoints[indexOfControlPointToBumpUp].y > highestPeak)
			{
				highestPeak = controlPoints[indexOfControlPointToBumpUp].y
			}
		}

		clickableDistribution.meanOfSamplesTaken = null

		clickableDistribution.vomitMember = function()
		{
			if(numSamplesAvailable === 0)
			{
				return;
			}

			let undrawnSampleToDraw = Math.floor( Math.random() * numSamplesAvailable )
			let numUndrawnSamplesGoneThrough = 0
			let sample = null;
			for(let i = 0; i < numSamples; i++)
			{
				if( !this.samplesDone[i] )
				{
					if( numUndrawnSamplesGoneThrough === undrawnSampleToDraw )
					{
						sample = this.samples[ i ]
						this.samplesDone[ i ] = true
						numSamplesAvailable--;
						break;
					}
					numUndrawnSamplesGoneThrough++
				}
			}

			let placeToLand = new THREE.Vector3()
			let controlPointIndex = controlPointIndexFromSample( sample )
			placeToLand.x = controlPoints[ controlPointIndex ].x
			for(let i = 0; i < memberHolder.children.length; i++)
			{
				if( memberHolder.children[i].placeToLand !== undefined && memberHolder.children[i].placeToLand.x === placeToLand.x )
				{
					placeToLand.y++
				}
			}

			let member = Member(controlPoints[ 0 ].x, placeToLand,chapter)
			member.scale.x = spacing * 0.9
			memberHolder.add(member)

			//TODO you want it so the highest column is sort of always nearly there
			let scaleWithNoMembers = 3.5
			memberHolder.scale.y = scaleWithNoMembers - (scaleWithNoMembers-1) * Math.sqrt(memberHolder.children.length / this.samples.length)

			this.excitedness = 1;

			if(normalDistributionsPresent)
			{
				correspondingNormalDistribution.sendInSample(placeToLand.x)
			}
		}

		clickableDistribution.excitedness = 0

		clickableDistribution.getSamplesAverage = function()
		{
			if(memberHolder.children.length === 0)
			{
				clickableDistribution.vomitMember()
			}

			var sumOfSamplesTaken = 0
			var numSamplesTaken = 0

			for(let i = 0; i < numSamples; i++)
			{
				if( this.samplesDone[i] )
				{
					sumOfSamplesTaken += this.samples[i]
					numSamplesTaken++
				}
			}
			return sumOfSamplesTaken / numSamplesTaken
		}
		clickableDistribution.getNumSamples = function()
		{
			var numSamplesTaken = 0
			for(var i = 0; i < memberHolder.children.length; i++)
			{
				if( memberHolder.children[i].placeToLand !== undefined )
				{
					numSamplesTaken++
				}
			}
			return numSamplesTaken
		}

		let curveOnTop = new THREE.Mesh( new THREE.TubeBufferGeometry( new THREE.CatmullRomCurve3( controlPoints, false, "centripetal" ), controlPoints.length * 8, 0.01 ) )
		// areaBeneath.add( curveOnTop )
		clickableDistribution.width = controlPoints[numControlPoints-1].x * 2
		clickableDistribution.height = highestPeak
		clickableDistribution.geometry.vertices[0].y = highestPeak
		clickableDistribution.geometry.vertices[1].y = highestPeak

		clickableDistribution.update = function()
		{
			if(mouse.clicking && mouse.lastClickedObject === this )
			{
				if(spray)
				{
					if( !mouse.oldClicking || frameCount % 11 === 0 ) //always get the first
					{
						this.vomitMember()
					}
				}
				else
				{
					if( !mouse.oldClicking )
					{
						this.vomitMember()
					}
				}
			}

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
			let correspondingNormalDistribution = MarkedNormalDistribution( clickableDistribution.mean, clickableDistribution.variance )
			clickableDistribution.add(correspondingNormalDistribution)
		}

		clickableDistribution.wandClone = function()
		{
			let cup = new THREE.Mesh(cupGeometry, cupMaterial)
			let clone = ClickableDistribution(false, samplingFunction, numControlPoints,numSamples, false, chapter,true,this.samples,cup)
			clone.scale.copy(this.scale)
			// for(let i = clone.children.length; i < this.children.length; i++)
			// {
			// 	clone.add(this.children[i].clone())
			// }
			return clone
		}

		clickableDistribution.scale.set(1/clickableDistribution.width,0.5/clickableDistribution.height,1)
		if(cup !== undefined)
		{
			clickableDistribution.add(cup)
			clickableDistribution.cup = cup
		}
		clickableDistribution.add( areaBeneath )
		
		if(haveProfilePicture)
		{
			clickableDistribution.profilePicture = profilePictures[lowestUnusedProfilePicture]
			lowestUnusedProfilePicture++
			if( lowestUnusedProfilePicture >= profilePictures.length )
			{
				lowestUnusedProfilePicture = 1
			}

			clickableDistribution.add(clickableDistribution.profilePicture)
			// profilePictures[lowestUnusedProfilePicture].scale.set( ,clickableDistribution.height/clickableDistribution.scale.y,1)
			clickableDistribution.profilePicture.scale.y = clickableDistribution.height
			clickableDistribution.profilePicture.scale.x = clickableDistribution.height / clickableDistribution.scale.x * clickableDistribution.scale.y
			clickableDistribution.profilePicture.position.z = -0.001
			clickableDistribution.profilePicture.position.x = -clickableDistribution.width/2 - clickableDistribution.profilePicture.scale.x
		}

		return clickableDistribution;
	}

	function Member(initialX, placeToLand, chapter)
	{
		/*
			Little shockwave? Little bounce?

			Sigh, probably need to synchronize everyone's samples

			The next thing to do is that heart monitor etc thing!!!! For Kate!!!
		*/

		//might need to merge the geometries. That would be fine!
		let member = new THREE.Mesh(memberGeometry,memberMaterial)
		member.placeToLand = placeToLand
		let arcDuration = 0.5;
		member.lifetime = 0;
		member.update = function()
		{
			this.lifetime += frameDelta
			this.position.x = initialX + this.lifetime / arcDuration * ( this.placeToLand.x - initialX )
			this.position.y = this.placeToLand.y + sq( arcDuration/2 ) * 20
			this.position.y -= sq(this.lifetime - arcDuration/2) * 20

			if( this.lifetime >= arcDuration)
			{
				this.position.copy( this.placeToLand )
			}
		}
		chapter.add(member, "updatables")
		
		member.position.x = 0
		member.position.y = member.placeToLand.y

		return member
	}

	let memberGeometry = new THREE.PlaneGeometry(1,2 * 0.9)
	let memberMaterial = new THREE.MeshLambertMaterial({color:0xF15946,depthTest:false})
	for( let i = 0; i < memberGeometry.vertices.length; i++ )
	{
		if(memberGeometry.vertices[i].y < 0)
		{
			memberGeometry.vertices[i].y = 0
		}
	}
}

function initEditableDistributionWithPopulation()
{
	//------------Population stuff
	let population = Array(28);
	const verticalSpacing = 2/(16/9) / population.length
	const max = 10;
	const height = verticalSpacing / 1.1

	population.representation = new THREE.Group()
	population.representation.position.x = -0.9
	population.representation.scale.x = 1/max
	//yeah needs to be fixed
	// scene.add( population.representation )
	updatables.push(population.representation)
	population.representation.update = function()
	{
		// if(mouse.lastClickedObject === null && mouse.clicking)
		// {
		// 	mouse.rotateObjectByGesture(this)
		// }
	}

	let barGeometry = new THREE.OriginCorneredPlaneBufferGeometry();
	let beepHeights = [0,0,0,0,0,0,0,0,0,-1,0,-7,10,-1,0,2]

	let fingerMaterial = new THREE.MeshBasicMaterial({map:new THREE.TextureLoader().load( "data/textures/heart.jpg" )})
	let fingerGeometry = new THREE.OriginCorneredPlaneBufferGeometry(0.5,1)

	let fingerRuler = new THREE.Mesh( fingerGeometry, fingerMaterial )
	for(let i = 0, il = population.length; i < il; i++)
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
				let newClickedPoint = mouse.rayIntersectionWithZPlane(population.representation.position.z)

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
		// population[i].onClick = function()
		// {
		// 	//TODO to get the closest one to your click in case it's between
		// 	this.clickedPoint = mouse.rayIntersectionWithZPlane(population.representation.position.z)
		// }
		// clickables.push(population[i])
		// updatables.push(population[i])

		{
			let numRounds = 1+Math.round(population[i].scale.x)
			let beepControlPoints = Array( numRounds * beepHeights.length )
			for(let round = 0; round < numRounds; round++)
			{
				for(let j = 0; j < beepHeights.length; j++)
				{
					let index = round*beepHeights.length + j
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

	// for(let i = 0, il = population.length; i < il; i++)
	// {
	// 	population[i].correctPosition.y = i * verticalSpacing - il / 2 * verticalSpacing
	// }

	// for(let i = 0, il = data.length; i < il; i++)
	// {
	// 	data[i].correctPosition.y = data[i].scale.x - il / 2 * dataSpacing
	// 	for(let j = 0; j < data.length; j++)
	// 	{
	// 		if(data[j].correctPosition.y === data[i].correctPosition.y)
	// 		{
	// 			data[i].correctPosition.z -= dataSpacing
	// 		}
	// 	}
	// }

	// ----------
	// for(let i = 0; i < data.length; i++)
	// {
	// 	distribution.controlPoints[Math.round(data[i].scale.x)]++;
	// }

	let controlPoints = Array(max+1)
	let width = 0.9;
	for(let i = 0; i < controlPoints.length; i++)
	{
		controlPoints[i] = new THREE.Vector3( i, 0, 0 )
	}
	let populationDistributionCurve = new THREE.Mesh( new THREE.TubeBufferGeometry( new THREE.CatmullRomCurve3( controlPoints, false, "centripetal" ), controlPoints.length * 13, 0.09 ) )

	function refreshFromPopulation()
	{
		for(let i = 0; i < controlPoints.length; i++)
		{
			controlPoints[i].y = 0
			for(let j = 0; j < population.length; j++)
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

	let highest = 0;
	for(let i = 0; i < controlPoints.length; i++)
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

	// clickables.push(populationDistributionCurve)
	// let grabbedPoint = null;
	// populationDistributionCurve.onClick = function(intersection)
	// {
	// 	let localIntersection = intersection.point.clone()
	// 	this.worldToLocal(localIntersection)
	// 	grabbedPoint = controlPoints[0]
	// 	for(let i = 1; i < controlPoints.length; i++ )
	// 	{
	// 		if( Math.abs( controlPoints[i].x - localIntersection.x ) < Math.abs( grabbedPoint.x - localIntersection.x ) )
	// 		{
	// 			grabbedPoint = controlPoints[i]
	// 		}
	// 	}
	// 	//and those whose height is equal to this number flash
	// }

	// updatables.push(populationDistributionCurve)
	// populationDistributionCurve.update = function()
	// {
	// 	if(grabbedPoint !== null)
	// 	{
	// 		let placeDraggedTo = mouse.rayIntersectionWithZPlane(0)
	// 		this.worldToLocal(placeDraggedTo)
	// 		grabbedPoint.y = placeDraggedTo.y
	// 		populationDistributionCurve.geometry.refreshSegmentsFromCurve()

	// 		// if( mouse.lastClickedObject !== this || !mouse.clicking )
	// 		// {
	// 		// 	grabbedPoint = null
	// 		// }
	// 	}
	// }

	return populationDistributionCurve
}

//as you "pick up more" for your sample
function MarkedNormalDistribution( mean, variance )
{
	//this gets plotted and you use it geometrically
	let numControlPoints = 30;
	let controlPoints = Array(numControlPoints)
	let graphWidth = 10;
	for(let i = 0; i < numControlPoints; i++)
	{
		let normalizedToMinusOneHalfToPlusOneHalf = (i-numControlPoints/2) / numControlPoints
		let position = mean + graphWidth * normalizedToMinusOneHalfToPlusOneHalf;
		controlPoints[i] = new THREE.Vector3( position, 0, 0 )
		controlPoints[i].y = normal(position, mean, variance)
	}

	let graph = new THREE.Mesh( new THREE.TubeBufferGeometry( new THREE.CatmullRomCurve3( controlPoints, false, "centripetal" ), controlPoints.length * 8, 0.01 ) )
	graph.scale.x = 0.9/graphWidth

	let areaBeneath = new THREE.Mesh(new THREE.Geometry(), new THREE.MeshPhongMaterial({vertexColors:THREE.FaceColors}))
	graph.add(areaBeneath)
	let sd = Math.sqrt(variance)
	for(let i = 0; i < numControlPoints; i++)
	{
		areaBeneath.geometry.vertices.push(new THREE.Vector3(controlPoints[i].x,0,0)) //i*2+0
		areaBeneath.geometry.vertices.push(controlPoints[i]) //i*2+1
		let r = Math.abs( controlPoints[i].x - mean ) < 1.96 * sd ? 0 : 1
		if( i !== 0 )
		{
			areaBeneath.geometry.faces.push(new THREE.Face3(i*2+0,i*2-1,i*2-2))
			areaBeneath.geometry.faces[areaBeneath.geometry.faces.length-1].color.setRGB(r,0,0)
			areaBeneath.geometry.faces.push(new THREE.Face3(i*2+0,i*2+1,i*2-1))
			areaBeneath.geometry.faces[areaBeneath.geometry.faces.length-1].color.setRGB(r,0,0)
		}
	}

	let meanMarker = new THREE.Mesh(new THREE.CircleGeometry(0.04,32 ), new THREE.MeshBasicMaterial({depthTest:false}))
	graph.add(meanMarker) //you're going to send it samples
	meanMarker.scale.x = 1 / graph.scale.x
	meanMarker.position.x = Infinity

	let numSamplesSoFar = 0;
	let sumSoFar = 0;
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
	let multiple = 1 / Math.sqrt( TAU * variance )
	let exponent = -sq( position - mean ) / ( 2 * variance )
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
		let v = sampleSize - 1;
		let numerator = gamma(sampleSize/2)
		let denominator = Math.sqrt(Math.PI*v)*gamma(v/2)
		let extra = Math.pow(1+t*t/v,-(sampleSize/2))
		return numerator/denominator*extra;
	}
}

function generateGaussianNoise()
{
	// let u = 0, v = 0;
	// while(u === 0) u = Math.random();
	// while(v === 0) v = Math.random();
	// return Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( TAU * v );

	let rand = 0;

	for (let i = 0; i < 6; i += 1) {
		rand += Math.random();
	}

	return rand / 6;
}

function gamma(z)
{
	let g = 7;
	let C = [0.99999999999980993, 676.5203681218851, -1259.1392167224028,771.32342877765313, -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];

	if(z < 0.5)
	{
		return Math.PI / (Math.sin(Math.PI * z) * gamma(1 - z));
	}
	else
	{
	    z -= 1;

	    let x = C[0];
	    for (let i = 1; i < g + 2; i++)
	    {
	    	x += C[i] / (z + i);
	    }

	    let t = z + g + 0.5;
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
		Numbers next to the lines, probably
*/

function standardNormalCdf(x)
{
	let mean = 0
	let variance = 1
	return 0.5 * (1 + erf((x - mean) / (Math.sqrt(2 * variance))));
}

function erf(x)
{
	// save the sign of x
	var sign = (x >= 0) ? 1 : -1;
	x = Math.abs(x);

	// constants
	var a1 =  0.254829592;
	var a2 = -0.284496736;
	var a3 =  1.421413741;
	var a4 = -1.453152027;
	var a5 =  1.061405429;
	var p  =  0.3275911;

	// A&S formula 7.1.26
	var t = 1.0/(1.0 + p*x);
	var y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
	return sign * y; // erf(-x) = -erf(x);
}
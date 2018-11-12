/*
	TODO Alabama
		Something fun looking, the things moving around, springs, maybe faces on them
		working on a phone, vertical, taking account of resolution

	TODO
		You click a node...
			You control its probability magnitude
			Can click further nodes to "control for them", ask "what about if they're..."
		"zooming in" on regions + selecting regions

	What does picking givens mean in the context of the net?
		Making a new net... the sub-tree coming from that node? No, you need other things affecting it

	Possible goals
		Get a bunch of balls, build/reproduce their bayes net / venn
		"Find an optimal strategy". Like something is going to run an arbitrarily large number of times with your strategy applied. It's statistical buuuut
		How about: you are allowed to change what you're seeing
				You're changing say P(A)
				But we enforce that P(B|A) is constant; no truth tables are changing
				That is selecting your experimental group?
			But there's an extra segment you can't see. You wanna draw it or some shape congruent to it
			Its truth table stays constant, but you see the proportion of it that there is in your current view

	Messages to send, either with this or the videos. Level names, if there's no words
		Rationality is following statistical methods.
		Sometimes you're wrong but that's ok, think about Nate Silver's 30%
		Correlation does not equal causation, but it does imply causation
		P(a1=a3) is done with P(a1&&a2) + P(!a1&&!a2)
		Confounding factors; the main thing going on with discourse? "You have neglected X"
		Monty Hall
		Everything from the applia or whatever it was
		"Sampling bias"
		Aumann's agreement theorem
		"Control group"
		"Controlling for"
		Scientists should share likelihood ratios, not posteriors
		Conditional independence
		If you know P(A|B),P(B|C),P(C|A),P(A),P(B),P(C), you DON'T necessarily know P(A,B|C)

	Wordy aspect
		Word scale Julia Galef had it somewhere? "Impossible" "Highly improbable" [...] "almost certain" "certain"

	interesting is when you want to remove an edge; make it conditionally independent
	like... one could see the intended output as a venn, and see one's own output as a venn
	and then you're just trying to copy a venn

	You have a square of them. Hover over a node and they split into two rectangles. Click and it sticks
		
	Hmm... do video games always truck on some information not being presented tto you perfectly? Software dev / Bret stuff might have drawn you away from that

	Pleasant feeling maybe: you're drawing the venn and the balls are attracted to where you draw their area

	The point is not entirely to improve one's reasoning
	It is to show one that the reasoning can be made explicit
	Internal/system 1 reasoning might be ok until you want to persuade someone

	A source of universe balls is above the rain segment
	Rain turns them into 20% R(ainy) and 80% C(lear) balls
	sprinklerFactors is also fundamental

	Each pair of segments is a single line in a CPT

	Recall we want people to be checking "|B,!C,!D...".
		So, you can highlight the "givens", and you'll see the proportion of mysteryArea that is in there
		You can do this multiple times

	What you might want in some situations is to ensure independence, don't want that to be tricky drawing
		Could make it so you can turn off visibility of areas you don't wanna see.
		Then once you've drawn it we make it so that what you draw is transformed to be independent of what you didn't see

	Need to be fair to people about the medical test thing, when you say "you get a test" people think "well I probably am already a bit worried then".

	The only situation where you're allowed to say p = 1 is where a is in S by definition.

	A thing that asks you for inputs in plain language? Console.logs. Maybe the way to start!
		For a historian with sources (this is an interface thing, a general pattern, not the way it shall always be, in some sense it shall always be simpler):
			"What or who is the thing you are concerned with?" s
			"What kind of thing is e?" S
			"What property are you attributing to them?" A
			"You are claiming that s, which is an S, has the property A."

			"Please give me a source that agrees that s has the property A?" X
			"Assume your claim is true. What is the probability that you would be able to find that X agreed that s had property A?
			  Please take account of the chance that they didn't know that s has the property A and made the claim anyway" p
			"What is the probability of a random S having the property A? This might be a hard one, but you do need it."
			"Ok, your posterior probability is: "

			"Probably s is not just any old random S. They might well have some other properties"

			"There are two things we can do now. Click your claim to add another source, or click s to clarify what kind of an S he/she/it is"
			Second one lets you add more properties.
*/

function initBayesNets()
{
	let nodeRadius = 0.02;
	let edgeRadius = nodeRadius * 0.25;
	let nodeGeometry = new THREE.EfficientSphereGeometry(nodeRadius);
	let smallSpringIdealLength = 0.2;
	let largeSpringIdealLength = smallSpringIdealLength * 1.2;
	let highlightedColor = new THREE.Color().setHex(0xFF0000)
	let unhighlightedColor = new THREE.Color().setHex(0xFFFFFF)

	let edgeGeometry = CylinderBufferGeometryUncentered(edgeRadius,1,15)

	let arrowHeadGeometry = null
	{
		let arrowHeadHeight = nodeRadius * 2
		arrowHeadGeometry = new THREE.CylinderBufferGeometry(0,edgeRadius*2,arrowHeadHeight,12)
		arrowHeadGeometry.applyMatrix(new THREE.Matrix4().makeTranslation(0,-arrowHeadHeight/2,0))
	}

	Bn = function()
	{
		let bn = new THREE.Mesh(new THREE.PlaneBufferGeometry(2/7,2/7), new THREE.MeshBasicMaterial({transparent:true,opacity:0.1}));
		let nodes = [];
		let edges = [];
		bn.nodes = nodes
		bn.edges = edges
		bn.cycles = [];

		let decomposedness = 0;

		bn.highlightedNode = null;
		bn.highlightedEdge = null;

		clickables.push(bn)
		bn.onClick = function()
		{
			if(this.highlightedEdge === null)
			{
				this.addNode(true)
			}
		}

		updatables.push(bn)
		bn.update = function()
		{
			let clientPosition = mouse.zZeroPosition.clone()
			this.worldToLocal(clientPosition)
			
			bn.highlightedNode = null;
			bn.highlightedEdge = null;
			for(let i = 0,il = nodes.length; i < il; i++)
			{
				nodes[i].update();
				nodes[i].material.color.copy(unhighlightedColor)
			}
			let intersections = mouse.rayCaster.intersectObjects( nodes );
			if(intersections.length !==0)
			{
				bn.highlightedNode = intersections[0].object
				bn.highlightedNode.material.color.copy(highlightedColor)
			}
			
			for(let i = 0, il = edges.length; i < il; i++)
			{
				edges[i].place();
				
				if( edges[i].startNode === bn.highlightedNode || 
					edges[i].endNode === bn.highlightedNode )
				{
					edges[i].material.color.r = 0
				}
				else
				{
					edges[i].material.color.r = 0;
				}
			}

			if(intersections.length === 0)
			{
				intersections = mouse.rayCaster.intersectObjects( edges );
				if(intersections.length !==0)
				{
					bn.highlightedEdge = intersections[0].object;
					bn.highlightedEdge.material.color.r = 1;

					if(mouse.clicking && !mouse.oldClicking)
					{
						console.log("would remove edge here")
					}
				}
			}

			if(this.cycles.length !== 0)
			{
				if(shouldBeDecomposed)
				{
					decomposedness = decomposedness + (1-decomposedness)*0.1;
				}
				else
				{
					decomposedness = decomposedness + (0-decomposedness)*0.1;
				}

				//ought to be in node.update?
				let edgeInQuestion = 0;
				let dist = ( AUDIENCE_CENTER_TO_TOP_OF_FRAME_AT_Z_EQUALS_0 - largeSpringIdealLength * 0.6 ) * decomposedness
				let decomposition = this.cycles
				for(let i = 0; i < decomposition.length; i++)
				{
					let cycle = decomposition[i]
					let displacement = new THREE.Vector3(dist,0,0).applyAxisAngle(zUnit, i / decomposition.length * TAU );
					for(let j = 0; j < cycle.length; j++)
					{
						for(let k = 0, kl = edges.length; k < kl; k++)
						{
							if( (edges[k].startNode === nodes[cycle[j]] && edges[k].endNode === nodes[cycle[(j+1)%5]]) ||
								(edges[k].endNode === nodes[cycle[j]] && edges[k].startNode === nodes[cycle[(j+1)%5]]) )
							{
								edges[k].position.add( displacement );
								break;
							}
						}
					}
				}
			}
		}

		bn.addDirectedEdge = function(startNode,endNode)
		{
			if( endNode.parentNodes.indexOf( startNode) !== -1 || endNode === startNode )
			{
				return;
			}

			endNode.parentNodes.push(startNode);
			//previously we were independent of startNode, and we keep it that way
			let newProbabilities = Array( endNode.probabilities.length * 2 )
			for(let i = 0; i < endNode.probabilities.length; i++)
			{
				newProbabilities[i] = endNode.probabilities[i]
				newProbabilities[i+endNode.probabilities.length] = endNode.probabilities[i]
			}
			endNode.probabilities = newProbabilities

			let edge = new THREE.Mesh( edgeGeometry, new THREE.MeshPhongMaterial({color:0x000000, side:THREE.DoubleSide}));
			edge.castShadow = true;
			bn.add(edge)
			edge.startNode = startNode;
			edge.endNode = endNode;

			let arrowHead = new THREE.Mesh(arrowHeadGeometry,edge.material)
			bn.add(arrowHead)

			edge.place = function()
			{
				this.position.copy(startNode.position)
				pointCylinder(this, endNode.position)

				arrowHead.rotation.copy(this.rotation)
				arrowHead.position.copy(endNode.position)
			}
			edge.place();
			
			edges.push(edge)
		}

		let pretendEdge = new THREE.Mesh( edgeGeometry, new THREE.MeshPhongMaterial({color:0x000000, side:THREE.DoubleSide}));
		{
			let arrowHead = new THREE.Mesh(arrowHeadGeometry,pretendEdge.material)
			pretendEdge.arrowHead = arrowHead

			pretendEdge.castShadow = true;
			pretendEdge.startNode = null;
			updatables.push(pretendEdge)
			pretendEdge.update = function()
			{
				if(this.parent === null)
				{
					return
				}

				this.position.copy(this.startNode.position)
				let localClientPosition = mouse.rayIntersectionWithZPlane(0)
				this.parent.worldToLocal(localClientPosition)
				pointCylinder(this, localClientPosition)

				arrowHead.quaternion.copy(pretendEdge.quaternion)
				arrowHead.position.copy(localClientPosition)

				if( !mouse.clicking )
				{
					if( this.parent.highlightedNode !== null )
					{
						this.parent.addDirectedEdge(this.startNode,this.parent.highlightedNode)
					}
					this.parent.remove(pretendEdge.arrowHead)
					this.parent.remove(this)
				}
			}
		}

		bn.addNode = function( putAtMousePosition )
		{
			let node = new THREE.Mesh(nodeGeometry, new THREE.MeshPhongMaterial({color:unhighlightedColor.clone()}));
			node.castShadow = true
			node.velocity = new THREE.Vector3();
			node.parentNodes = [];

			node.probabilities = []
			node.query = function()
			{
				return probabilityMesh.scale.x
			}

			let closeUp = new THREE.Mesh(new THREE.PlaneBufferGeometry(2,2),new THREE.MeshBasicMaterial({color:0xFFFFFF}))
			closeUp.scale.setScalar(0.1)
			let probabilityMesh = new THREE.Mesh(new THREE.PlaneBufferGeometry(2,2),new THREE.MeshBasicMaterial({color:0x000000}))
			//currently, probability is NOT proportional to area!
			closeUp.add(probabilityMesh)
			probabilityMesh.scale.setScalar(uniformRandomInRange(0.25,0.75))
			node.probabilityMesh = probabilityMesh

			nodes.push(node);
			bn.add(node);

			clickables.push(node)
			node.onClick = function()
			{
				bn.add(pretendEdge)
				bn.add(pretendEdge.arrowHead)
				pretendEdge.startNode = this
			}

			//do something with position and color, possibly involving the disjoint set's color, possibly taking account of putAtMousePosition
			if(putAtMousePosition)
			{
				let localClientPosition = mouse.rayIntersectionWithZPlane(0)
				bn.updateMatrixWorld()
				bn.worldToLocal(localClientPosition)
				node.position.copy( localClientPosition )
			}
			else
			{
				node.position.set(Math.random()-0.5,Math.random()-0.5,0)
			}

			node.update = function()
			{
				let acceleration = new THREE.Vector3()
				
				for(let i = 0; i < nodes.length; i++)
				{
					if(this === nodes[i])
					{
						continue;
					}
					
					let accelerationComponent = new THREE.Vector3().subVectors(nodes[i].position, this.position);
					
					let magnitude = (largeSpringIdealLength - accelerationComponent.length()) * -0.06;
					
					accelerationComponent.setLength( magnitude );
					
					acceleration.add(accelerationComponent);
				}

				if(this.material.color.equals(highlightedColor) )
				{
					if(closeUp.parent !== this)
					{
						this.add(closeUp)
						let ourAssociatedBit = nodes.indexOf(this)
						updateDispenseeSegregation(ourAssociatedBit)
					}
				}
				else
				{
					if(closeUp.parent === this)
					{
						this.remove(closeUp)
					}
				}
				
				//attraction to center
				acceleration.add(this.position.clone().setComponent(2,0).multiplyScalar(-0.08))
				
				this.velocity.set(0,0,0); //severe damping - can remove for bounciness
				this.velocity.add(acceleration);
				this.position.add(this.velocity);
				this.position.z = 0;
			}
			
			return node;
		}

		let dispensees = Array(7*7*7)
		bn.dispensees = dispensees

		bn.dispense = function()
		{
			//non-trivial but: would be nice if the sample could be a perfect representation of all proportions
			//eg you want an exact calculation of the probabilities, not some Math.random() < blah.
			let dispenseesHolder = new THREE.Mesh(new THREE.OriginCorneredPlaneBufferGeometry(1,1), new THREE.MeshBasicMaterial({transparent:true,opacity:0.4}))
			dispenseesHolder.scale.set(0.8,0.8,1)
			dispenseesHolder.position.x = -0.5 - dispenseesHolder.scale.x / 2
			dispenseesHolder.position.y = -dispenseesHolder.scale.y / 2
			scene.add(dispenseesHolder)

			let dispenseeGeometries = [
				new THREE.CircleBufferGeometry(0.04,4),
				new THREE.CircleBufferGeometry(0.04,3)
			]

			for(let i = 0; i < dispensees.length; i++)
			{
				let bits = 0; //I mean, DAG works for discrete events over time, which is a "reasonable assumption" for many things people care about
				for(let i = 0; i < nodes.length; i++)
				{
					//just need to work out that DAG thing and do them in the right order
					let proportion = nodes[i].query()
					if( Math.random() < proportion)
					{
						bits = bits | (1<<i)
					}
				}

				//properties: shiny, multicolored, dark colored, triangular, vibrating, emitting something
				dispensees[i] = new THREE.Mesh( dispenseeGeometries[bits&1], new THREE.MeshBasicMaterial({
					color:bits&2?(bits&4?0x800000:0x000080):(bits&4?0xFF0000:0x0000FF)
				}))
				dispensees[i].bits = bits
				dispensees[i].position.set(Math.random(),Math.random(),0.001)
				dispenseesHolder.add(dispensees[i])
			}
		}

		//does feel like what you want is to click two nodes and see their relationship, i.e. their x and y
		//first they go into two colums, then both columns turn into two rectangles each with division lines at different levels
		//better, and more marketable, might be a puzzle game using those deep learning visualization methdos

		//ones with same bit are attracted, non-same-bit are repelled
		//buuuut they repel one another iff they're close
		//some might not be displayed at all
		function updateDispenseeSegregation(horizontalBitIndex,verticalBitIndex)
		{
			//would be a bit nicer if it was an emergent thing; they go till they're beyond
			let numberOfDispenseesOnLeft = 0
			let numberOfDispenseesInTL = 0
			let numberOfDispenseesOnTopRight = 0
			for(let i = 0; i < dispensees.length; i++)
			{
				if( dispensees[i].bits & (1<<horizontalBitIndex) )
				{
					numberOfDispenseesOnLeft++
					if( dispensees[i].bits & (1<<verticalBitIndex) )
					{
						numberOfDispenseesInTL++
					}
				}
				else
				{
					if( dispensees[i].bits & (1<<verticalBitIndex) )
					{
						numberOfDispenseesOnTopRight++
					}
				}
			}

			let leftVerticalThreshold = numberOfDispenseesInTL / numberOfDispenseesOnLeft
			let rightVerticalThreshold = numberOfDispenseesInTL / (dispensees.length-numberOfDispenseesOnLeft)
			let horizontalThreshold = numberOfDispenseesOnLeft / dispensees.length

			for(let i = 0; i < dispensees.length; i++)
			{
				let shouldBeOnLeft = dispensees[i].bits & (1<<horizontalBitIndex)
				let isOnLeft = dispensees[i].position.x < horizontalThreshold

				let shouldBeOnBottom = dispensees[i].bits & (1<<verticalBitIndex)
				let isOnBottom = dispensees[i].position.y < (shouldBeOnLeft ? leftVerticalThreshold : rightVerticalThreshold)

				let acceleration = new THREE.Vector2()

				if( shouldBeOnLeft !== isOnLeft )
				{
					acceleration.x = shouldBeOnLeft ? 1:-1
				}

				if(shouldBeOnBottom && !isOnBottom)
				{
					acceleration.y = shouldBeOnBottom ? 1:-1
				}

				if(acceleration.x === 0 && acceleration.y === 0)
				{
					//repelled by all surroundings
				}
			}
		}

		return bn
	}

	let bn = Bn()
	bn.scale.multiplyScalar(3)
	bn.position.x = 0.5
	scene.add(bn)
	bn.addNode()
	bn.addNode()
	bn.addNode()

	bn.dispense()
}

function pointCylinder(cylinderMesh, end)
{
	let startToEnd = end.clone().sub(cylinderMesh.position);
	cylinderMesh.scale.set(1,startToEnd.length(),1);
	cylinderMesh.quaternion.setFromUnitVectors(yUnit,startToEnd.normalize());
	cylinderMesh.quaternion.normalize();
}

const colorChannels = ["r","g","b"]
function setColorComponent(color, component,newValue)
{
	color[colorChannels[component]] = newValue
}
function getColorComponent(color, component)
{
	return color[colorChannels[component]]
}
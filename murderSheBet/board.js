//big advantage: the "display" of confidence on the normal board is linear
//John's idea: move the slots down
//maybe even wrap them. Makes it so you don't have to move the selector up

//one might get things like the radiolab "Buy and then immediately sell when you see the price"
//different name: "the hansonian betting board". Forget the video embed.
//fuck it, they probably don't want the whole video anyway, just have them drag out a rectangle
//advantage this might have over board game: you don't have to look down and check whether you've got bets on a character you've lost faith in being guilty, you can just immediately go over and decrease your bet

//really this is trying to prove dynamicland wrong
//article: "Virtual reality is inefficient" - dynamicland too. Inefficient in the sense that keyboard shortcuts ARE efficient

function getPrice(index)
{
	//John says: don't start at 1 because 2 is twice as much
	//scale is based around the fact that a card is worth 100
	//one could argue that the final step, 60 -> 80, is discontinuously large due to being "prestigious"
	//on the other hand, Hanson prices are rounded to the nearest 5, not necessary here

	//has the advantage of being discrete quantities
	// let lookupTable = [5,10,15,20,25,30,40,50,60,80]
	// if(index >= lookupTable.length)
	// {
	// 	console.error("not got that in lookupTable mode")
	// 	return 20 * Math.exp(index * 0.1733) - 15 //0.1733 is such that 4*(x^1-x^0) = x^9-x^8
	// }
	// return lookupTable[index] 

	// return 5 + 1.2*Math.pow(index+1,1.8) //1.8 is such that 4 * (2^x-1^x) = (10^x - 9^x)

	return 20 * Math.exp(index * 0.1733) - 15 //0.1733 is such that 4*(x^1-x^0) = x^9-x^8

	// return Math.pow(1.1,index) //0.1733 is such that 4*(x^1-x^0) = x^9-x^8
}
let dollarHeight = 0.003

let moneyMaterial = new THREE.MeshBasicMaterial({color:0x00FF00})
console.log(moneyMaterial.color)
function initSelectors()
{
	let columns = []
	let selectors = []

	let maxColumns = 12
	let numRows = 8 //should there be a limit? Advantage

	let columnWidth = 1
	let betHeight = getPrice(0) * dollarHeight / 2
	let handHeight = betHeight * numRows
	let selectorWidth = handHeight
	let selectorSpacing = selectorWidth * 0.3

	let betGeometry = new THREE.OriginCorneredPlaneGeometry(1,1)
	betGeometry.applyMatrix(new THREE.Matrix4().makeTranslation(0,0,-0.001))
	{
		let slotMaterial = new THREE.MeshBasicMaterial({color:0x000000})
		let slotGeometry = new THREE.Geometry()
		slotGeometry.vertices.push(
			new THREE.Vector3(0,0,0),
			new THREE.Vector3(1,0,0),
			new THREE.Vector3(1,1,0),
			new THREE.Vector3(0,1,0)
		)
		slotGeometry.applyMatrix(new THREE.Matrix4().makeTranslation(0,0,-1))
		let Slot = function(column,material)
		{
			let slot = new THREE.LineLoop(slotGeometry, slotMaterial)
			scene.add(slot)

			let index = column.slots.length
			column.slots.push(slot)

			let bet = new THREE.Mesh(betGeometry,material)
			column.bets.push(bet)
			bet.scale.set(selectorWidth,betHeight,1)
			bet.column = column
			scene.add(bet)
			slot.contents = bet

			slot.scale.y = getPrice(index) * dollarHeight
			
			updatables.push(slot)
			slot.update = function()
			{
				let correctPositionX = column.position.x + selectors.length * (selectorWidth+selectorSpacing)
				let correctScaleX = columnWidth - (selectorWidth + selectorSpacing ) * selectors.length - selectorSpacing
				slot.position.x += (correctPositionX-slot.position.x) * 0.1
				slot.scale.x += (correctScaleX-slot.scale.x) * 0.1

				this.visible = this.contents.material !== moneyMaterial
				
				let correctY = 0
				for(let i = 0; i < column.slots.length; i++)
				{
					//very hacky way to detect
					let weAreMoney = this.contents.column === undefined
					let theyAreMoney = column.slots[i].contents.column === undefined
					if( (this.contents.material === moneyMaterial && column.slots[i].contents.material !== moneyMaterial) ||
						(this.contents.material === column.slots[i].contents.material && i<index) )
					{
						//TODO weid thing when guilty is clicked
						correctY += getPrice(i) * dollarHeight
					}
				}

				slot.position.y += (correctY - slot.position.y) * 0.2

				let contentsDestination = slot.position.clone()
				contentsDestination.x += slot.scale.x / 2 - slot.contents.scale.x / 2
				contentsDestination.y += slot.scale.y / 2 - slot.contents.scale.y / 2

				slot.contents.position.x += (contentsDestination.x-slot.contents.position.x) * 0.1
				slot.contents.position.y += (contentsDestination.y-slot.contents.position.y) * 0.1
			}
			bet.position.copy(slot.position)
			bet.position.z = camera.position.z - camera.near*1.1

			return slot
		}

		Column = function()
		{
			let column = new THREE.Group()
			let material = new THREE.MeshBasicMaterial({color:new THREE.Color(0,Math.random(),Math.random())})
			column.ordinaryMaterial = material
			let index = columns.length
			column.position.x = index * columnWidth

			column.slots = []
			column.bets = []
			for( let j = 0; j < numRows; j++)
			{
				Slot(column,material)
			}

			scene.add(column)
			columns.push(column)

			camera.right = columnWidth * columns.length
			camera.updateProjectionMatrix()

			if(index === 0)
			{
				function prepareSingleButton(i,j)
				{
					bindButton(controlsArray[i*4+j],function()
					{
						unbindButton(controlsArray[i*4+0])
						unbindButton(controlsArray[i*4+1])
						unbindButton(controlsArray[i*4+2])
						unbindButton(controlsArray[i*4+3])

						Selector(
							controlsArray[i*4+0],
							controlsArray[i*4+1],
							controlsArray[i*4+2],
							controlsArray[i*4+3]
							)
					})
				}

				for(let i = 0; i < controlsArray.length/4; i++)
				{
					for(let j = 0; j < 4; j++)
					{
						prepareSingleButton(i,j)
					}
				}
			}

			return column
		}
	}
	//bug: the top seemed to change when you took the last tokend

	let controlsArray = [
		"right","left","up","down",
		"d","a","w","s",
		"l","j","i","k",
		"h","f","t","g",
		"#",";","[","'",
		"6","4","8","5",
	]

	sortHands = function()
	{
		let countUp = function(hand)
		{
			let netWorth = hand.savings.scale.y / dollarHeight
			for(let i = 0; i < hand.bets.length; i++)
			{
				if( hand.bets[i].column.isGuilty)
				{
					netWorth += 100
				}
			}

			return netWorth
		}

		hands.sort(function(handA,handB)
		{
			return countUp(handB) - countUp(handA)
		})
	}

	let selectorGeometry = new THREE.OriginCorneredPlaneGeometry(selectorWidth,1)

	let savingsGeometry = new THREE.OriginCorneredPlaneGeometry(1, 1)

	let handWidth = 20
	let handGeometry = new THREE.PlaneGeometry( handWidth, handHeight )
	handGeometry.applyMatrix(new THREE.Matrix4().makeTranslation(handWidth/2,-handHeight/2,0))
	let handSpacing = handHeight * 0.3

	let highestHandPosition = -handSpacing

	//once you've selected winners, some money is exchanged with their slips and the hands are rearranged

	let hands = []

	let Selector = function(right,left,up,down)
	{
		let selector = new THREE.Mesh( selectorGeometry, new THREE.MeshBasicMaterial({
			color:getRandomColor(),
			transparent:true,
			opacity:0.5
		}) )
		let index = selectors.length
		
		selector.currentColumn = columns[0]
		selector.position.x = selector.currentColumn.position.x
		selector.position.y = highestHandPosition - (handHeight+handSpacing) * index

		let hand = new THREE.Mesh( handGeometry, selector.material.clone() )
		hands.push(hand)
		{
			hand.position.y = selector.position.y
			hand.position.z = -0.01 - index * 0.01
			hand.bets = [];

			updatables.push(hand)
			hand.update = function()
			{
				let correctY = highestHandPosition - (handHeight+handSpacing) * hands.indexOf(this)
				hand.position.y += (correctY - hand.position.y) * 0.1

				selector.position.y = hand.position.y
				selector.scale.y = 0 - selector.position.y

				let handWorldPosition = this.getWorldPosition(new THREE.Vector3())
				for(let i = 0; i < this.bets.length; i++)
				{
					let yInHand = handWorldPosition.y - handHeight
					for(let j = 0; j < i; j++)
					{
						if(this.bets[j].material ===this.bets[i].material)
						{
							yInHand += betHeight
						}
					}
					this.bets[i].position.y += (yInHand-this.bets[i].position.y)*0.1

					let correctX = this.bets[i].column.guiltyBox.position.x - this.bets[i].scale.x / 2
					this.bets[i].position.x += (correctX-this.bets[i].position.x)*0.1

					//ideally they go into its columns and maybe rows
				}

				betlessnessFlasher.material.opacity -= frameDelta * 1.5
				betlessnessFlasher.position.y = hand.position.y - handHeight/2
				savings.material.color.lerp(moneyMaterial.color,0.1)
				selector.material.color.lerp(hand.material.color,0.1)
			}
			scene.add(hand)
			selector.hand = hand

			let betlessnessFlasher = new THREE.Mesh(new THREE.CircleGeometry(handHeight/2*0.9,32), new THREE.MeshBasicMaterial({
				color:0x000000,
				transparent:true,
				opacity:0
			}))
			hand.betlessnessFlasher = betlessnessFlasher
			scene.add(betlessnessFlasher)
		}

		selector.position.z = hand.position.z

		let savings = new THREE.Mesh(savingsGeometry,moneyMaterial.clone())
		{
			savings.priceMeshThatIsComingOver = null
			savings.scale.y = 200 * dollarHeight
			savings.scale.x = selectorWidth
			scene.add(savings)
			hand.savings = savings

			updatables.push(savings)
			savings.update = function()
			{
				savings.position.x = selector.position.x
				savings.position.y = selector.position.y + selector.scale.y

				if(savings.priceMeshThatIsComingOver !== null)
				{
					let positionToLerpTo = savings.position.clone()
					positionToLerpTo.y += savings.scale.y
					savings.priceMeshThatIsComingOver.position.lerp(positionToLerpTo,0.1)

					if( savings.priceMeshThatIsComingOver.position.distanceTo( positionToLerpTo ) < 0.01 )
					{
						resolvePriceMeshComingOverIfOneExists()
					}
				}
			}
		}

		function resolvePriceMeshComingOverIfOneExists()
		{
			if(savings.priceMeshThatIsComingOver)
			{
				savings.scale.y += savings.priceMeshThatIsComingOver.scale.y
				scene.remove( savings.priceMeshThatIsComingOver )
				savings.priceMeshThatIsComingOver = null
			}
		}

		function changeCurrentColumn(addition)
		{
			let currentIndex = columns.indexOf( selector.currentColumn )
			let newIndex = currentIndex + addition
			if(newIndex>columns.length-1)
			{
				newIndex = 0
			}
			if(newIndex<0)
			{
				newIndex = columns.length-1
			}
			selector.visible = true
			selector.currentColumn = columns[newIndex]
		}

		bindButton(right,function()
		{
			if(!tradingAllowed) return;

			changeCurrentColumn(1)
		})
		bindButton(left,function()
		{
			if(!tradingAllowed) return;

			changeCurrentColumn(-1)
		})

		bindButton(up,function()
		{
			if(!tradingAllowed) return;

			resolvePriceMeshComingOverIfOneExists()

			let column = selector.currentColumn

			for(let i = 0; i < column.slots.length; i++)
			{
				if( column.slots[i].contents.material !== moneyMaterial )
				{
					let price = getPrice(i)
					if( price * dollarHeight < savings.scale.y )
					{
						let bet = column.slots[i].contents
						hand.bets.push( bet )

						savings.scale.y -= price * dollarHeight

						let priceMesh = new THREE.Mesh(new THREE.OriginCorneredPlaneGeometry(1,1),moneyMaterial)
						scene.add(priceMesh)
						priceMesh.scale.x = savings.scale.x
						priceMesh.scale.y = price * dollarHeight
						priceMesh.position.y = savings.position.y + savings.scale.y
						priceMesh.position.z = savings.position.z
						priceMesh.position.x = savings.position.x

						column.slots[i].contents = priceMesh

						return;
					}
				}
			}

			savings.material.color.setRGB(1,0,0)
			selector.material.color.setRGB(1,0,0)
		})

		bindButton(down,function()
		{
			if(!tradingAllowed) return;

			resolvePriceMeshComingOverIfOneExists()
			
			let column = selector.currentColumn

			for(let i = 0; i < hand.bets.length; i++)
			{
				let bet = hand.bets[i]
				if(hand.bets[i].column === column)
				{
					for(let j = column.slots.length-1; j >= 0; j--)
					{
						let slot = column.slots[j]
						if( slot.contents.material === moneyMaterial )
						{
							savings.priceMeshThatIsComingOver = slot.contents

							slot.contents = bet
							hand.bets.splice( i, 1 )

							return
						}
					}
				}
			}
			hand.betlessnessFlasher.position.x = column.slots[0].position.x + column.slots[0].scale.x/2
			hand.betlessnessFlasher.material.opacity = 1
		})

		updatables.push(selector)
		selector.update = function()
		{
			if(!tradingAllowed) return

			let correctX = this.currentColumn.position.x
			correctX += (selectorWidth+selectorSpacing) * index

			selector.position.x += (correctX - selector.position.x) * 0.1
		}

		scene.add(selector)
		selectors.push(selector)

		camera.bottom = -selectors.length * (handHeight + handSpacing) - handSpacing
		camera.updateProjectionMatrix()
	}
}
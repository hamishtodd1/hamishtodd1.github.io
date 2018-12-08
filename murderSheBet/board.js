function initSelectors()
{
	let columns = []
	let selectors = []

	let maxColumns = 12
	let numRows = 8 //should there be a limit? Advantage
	let fullBoardAspectRatio = maxColumns / numRows

	let columnWidth = 1
	let rowHeight = 0.12
	let dollarHeight = 0.003
	let betHeight = getPrice(0) * dollarHeight
	let selectorWidth = 0.02
	let selectorSpacing = selectorWidth * 0.3

	function getPrice(index)
	{
		//scale is based around the fact that a card is worth 100
		//one could argue that the final step, 60 -> 80, is discontinuously large due to being "prestigious"
		//on the other hand, Hanson prices are rounded to the nearest 5, not necessary here

		let lookupTable = [5,10,15,20,25,30,40,50,60,80]
		return lookupTable[index] 

		// return 5 + 1.2*Math.pow(index+1,1.8) //1.8 is such that 4 * (2^x-1^x) = (10^x - 9^x)

		// return 20 * Math.exp(index * 0.1733) - 15 //0.1733 is such that 4*(x^1-x^0) = x^9-x^8
	}

	{
		let slotMaterial = new THREE.MeshBasicMaterial({color:0xE0E0E0})
		let slotGeometry = new THREE.OriginCorneredPlaneGeometry(1,1)
		slotGeometry.applyMatrix(new THREE.Matrix4().makeTranslation(0,0,-1))
		let betGeometry = new THREE.OriginCorneredPlaneGeometry(1,1)
		betGeometry.applyMatrix(new THREE.Matrix4().makeTranslation(0,0,-0.001))
		let Slot = function(column,row,material)
		{
			let slot = new THREE.Mesh(slotGeometry, slotMaterial)
			scene.add(slot)

			let index = column.slots.length
			column.slots.push(slot)

			let bet = new THREE.Mesh(betGeometry,material)
			bet.scale.set(selectorWidth,betHeight,1)
			bet.column = column
			scene.add(bet)
			slot.contents = bet

			slot.scale.y = getPrice(index) * dollarHeight - 0.002
			for(let i = 0; i < index; i++)
			{
				slot.position.y += getPrice(i) * dollarHeight
			}

			updatables.push(slot)
			slot.update = function()
			{
				slot.scale.x = columnWidth - (selectorWidth + selectorSpacing ) * selectors.length - 0.05

				slot.position.x = column.position.x + selectors.length * (selectorWidth+selectorSpacing)
				let positionToLerpTo = slot.position.clone()
				positionToLerpTo.x += slot.scale.x / 2 - slot.contents.scale.x / 2
				positionToLerpTo.y += slot.scale.y / 2 - slot.contents.scale.y / 2

				slot.contents.position.x += (positionToLerpTo.x-slot.contents.position.x) * 0.1
				slot.contents.position.y += (positionToLerpTo.y-slot.contents.position.y) * 0.1
			}
			slot.update()
			bet.position.copy(slot.position)
			bet.position.z = camera.position.z - camera.near*1.1

			return slot
		}

		let Column = function()
		{
			let column = new THREE.Group()
			let material = new THREE.MeshBasicMaterial({color:new THREE.Color(Math.random(),0,Math.random())})
			let index = columns.length
			column.position.x = index * columnWidth

			column.slots = []
			for( let j = 0; j < numRows; j++)
			{
				Slot(column,j,material)
			}

			scene.add(column)
			columns.push(column)

			camera.right = columnWidth * columns.length
			camera.updateProjectionMatrix()
		}

		Column()
		Column()
		Column()
	}

	{
		let controlsArray = [
			"right","left","up","down",
			"d","a","w","s",
			// "l","j","i","k",
		]

		let selectorGeometry = new THREE.OriginCorneredPlaneGeometry(selectorWidth,1)

		let moneyMaterial = new THREE.MeshBasicMaterial({color:0x00FF00})
		let savingsGeometry = new THREE.OriginCorneredPlaneGeometry(selectorWidth, 1)

		let handWidth = 20
		let handHeight = betHeight * columns[0].slots.length
		let handGeometry = new THREE.PlaneGeometry( handWidth, handHeight )
		handGeometry.applyMatrix(new THREE.Matrix4().makeTranslation(handWidth/2,-handHeight/2,0))
		let handSpacing = getPrice(0)*dollarHeight

		let highestHandPosition = -handSpacing

		//once you've selected winners, some money is exchanged with their slips and the hands are rearranged

		let Selector = function()
		{
			let selector = new THREE.Mesh( selectorGeometry, new THREE.MeshBasicMaterial({
				color:getRandomColor(),
				transparent:true,
				opacity:0.5
			}) )
			let index = selectors.length
			if(index > 1)
			{
				selector.visible = false
			}
			
			selector.currentColumn = columns[0]
			selector.position.x = selector.currentColumn.position.x
			selector.position.y = highestHandPosition - (handHeight+handSpacing) * index

			let hand = new THREE.Mesh( handGeometry, selector.material )
			{
				hand.position.y = selector.position.y
				hand.position.z = -0.01 - index * 0.01
				hand.bets = [];

				updatables.push(hand)
				hand.update = function()
				{
					selector.scale.y += ( (savings.position.y - selector.position.y) - selector.scale.y ) * 0.1

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

						//ideally they go into its columns and maybe rows
					}
				}
				scene.add(hand)
				selector.hand = hand
			}

			selector.position.z = hand.position.z

			let savings = new THREE.Mesh(savingsGeometry,moneyMaterial)
			{
				savings.scale.y = 200 * dollarHeight
				scene.add(savings)
				selector.savings = savings

				updatables.push(savings)
				savings.update = function()
				{
					savings.position.x = selector.position.x
					let topSlot = selector.currentColumn.slots[selector.currentColumn.slots.length-1]
					savings.position.y = topSlot.position.y + topSlot.scale.y
					for(let i = 0; i < selector.currentColumn.slots.length; i++)
					{
						if( selector.currentColumn.slots[i].contents.material !== moneyMaterial )
						{
							savings.position.y = selector.currentColumn.slots[i].position.y
							break;
						}
					}
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

			bindButton(controlsArray[index*4+0],function()
			{
				if(makingSuspectPortrait) return;

				changeCurrentColumn(1)
			})
			bindButton(controlsArray[index*4+1],function()
			{
				if(makingSuspectPortrait) return;

				changeCurrentColumn(-1)
			})

			bindButton(controlsArray[index*4+2],function()
			{
				if(makingSuspectPortrait) return;

				let column = selector.currentColumn

				for(let i = 0; i < column.slots.length; i++)
				{
					if( column.slots[i].contents.material !== moneyMaterial )
					{
						let price = getPrice(i)
						if(price * dollarHeight < savings.scale.y)
						{
							let bet = column.slots[i].contents
							hand.bets.push( bet )

							let priceMesh = new THREE.Mesh(new THREE.OriginCorneredPlaneGeometry(1,1),moneyMaterial)
							scene.add(priceMesh)
							priceMesh.scale.x = selectorWidth
							priceMesh.scale.y = price * dollarHeight
							priceMesh.position.y = selector.position.y + selector.scale.y
							priceMesh.position.z = selector.position.z
							priceMesh.position.x = selector.position.x

							savings.scale.y -= priceMesh.scale.y

							column.slots[i].contents = priceMesh
						}

						break;
					}
				}
			})

			bindButton(controlsArray[index*4+3],function()
			{
				if(makingSuspectPortrait) return;
				
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
								savings.scale.y += slot.contents.scale.y 
								scene.remove(slot.contents) //not very satisfying

								slot.contents = bet
								hand.bets.splice( i, 1 )

								return
							}
						}
					}
				}
			})

			//one might get things like the radiolab "Buy and then immediately sell when you see the price"
			//different name: "the hansonian betting board". Forget the video embed.
			//fuck it, they probably don't want the whole video anyway, just have them drag out a rectangle
			//advantage this might have over board game: you don't have to look down and check whether you've got bets on a character you've lost faith in being guilty, you can just immediately go over and decrease your bet

			//really this is trying to prove dynamicland wrong
			//article: "Virtual reality is inefficient" - dynamicland too. Inefficient in the sense that keyboard shortcuts ARE efficient


			updatables.push(selector)
			selector.update = function()
			{
				if(makingSuspectPortrait) return

				let correctX = this.currentColumn.position.x
				correctX += (selectorWidth+selectorSpacing) * index

				selector.position.x += (correctX - selector.position.x) * 0.1
			}

			scene.add(selector)
			selectors.push(selector)

			camera.bottom = -selectors.length * (handHeight + handSpacing) - handSpacing
			//bizarre bug when we tried to change the handSpacing multiple
			camera.updateProjectionMatrix()
		}

		for(let i = 0; i < controlsArray.length / 4; i++ )
		{
			Selector()
		}
	}
}
function initSelectors()
{
	let columns = []
	let selectors = []

	let maxColumns = 12
	let numRows = 8 //should there be a limit? Advantage
	let fullBoardAspectRatio = maxColumns / numRows

	let columnWidth = 1
	let rowHeight = 0.12
	let dollarHeight = rowHeight / 80

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
		let slotMaterial = new THREE.MeshBasicMaterial({color:0x000000})
		let Slot = function(column,row)
		{
			let slot = new THREE.Mesh(new THREE.PlaneGeometry(columnWidth*0.8,rowHeight * 0.8), slotMaterial)
			slot.geometry.applyMatrix(new THREE.Matrix4().makeTranslation(0,0,-0.001))
			scene.add(slot)

			let bet = new THREE.Mesh(new THREE.PlaneGeometry(rowHeight * 0.5,rowHeight * 0.5))
			bet.column = column
			scene.add(bet)
			slot.contents = bet

			updatables.push(slot)
			slot.update = function()
			{
				this.position.x = column.position.x
				this.position.y = row * rowHeight

				this.contents.position.lerp(this.position,0.1)
			}
			slot.update()
			bet.position.copy(slot.position)

			return slot
		}

		let Column = function()
		{
			let column = new THREE.Group()
			let index = columns.length
			column.position.x = -1 + columnWidth / 2 + index * columnWidth

			column.slots = []
			for( let j = 0; j < numRows; j++)
			{
				column.slots[j] = Slot(column,j)
			}

			scene.add(column)
			columns.push(column)
		}

		Column()
		Column()
	}

	{
		let controlsArray = [
			"right","left","up","down",
			"d","a","w","s",
			// "l","j","i","k",
		]

		let selectorGeometry = new THREE.OriginCorneredPlaneGeometry(0.1,1)

		let moneyMaterial = new THREE.MeshBasicMaterial({color:0x00FF00})
		let savingsGeometry = new THREE.PlaneGeometry(0.01, 1)
		savingsGeometry.applyMatrix(new THREE.Matrix4().makeTranslation(0,-0.5,0))

		let handWidth = 2 * 0.9
		let handHeight = 0.1 //1 divided by number of hands
		let handGeometry = new THREE.PlaneGeometry( handWidth, handHeight )
		handGeometry.applyMatrix(new THREE.Matrix4().makeTranslation(0,-handHeight/2,0))
		let handSpacing = handHeight * 0.1

		let highestHandPosition = -0.3

		let Selector = function()
		{
			let selector = new THREE.Mesh( selectorGeometry )
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
				hand.position.z = -index * 0.01
				hand.bets = [];

				updatables.push(hand)
				hand.update = function()
				{
					let handWorldPosition = this.getWorldPosition(new THREE.Vector3())
					for(let i = 0; i < this.bets.length; i++)
					{
						this.bets[i].position.z = handWorldPosition.z

						let actualHandWidth = handWidth * 0.9
						let positionToLerpTo = handWorldPosition.clone()
						positionToLerpTo.x += i * (actualHandWidth / this.bets.length) - actualHandWidth/2
						this.bets[i].position.lerp(positionToLerpTo,0.1)

						//ideally they go into its columns and maybe rows
					}
				}
				scene.add(hand)
				selector.hand = hand
			}

			let savings = new THREE.Mesh(savingsGeometry,moneyMaterial)
			{
				savings.scale.y = 200 * dollarHeight
				selector.add(savings)
				selector.savings = savings
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

							let priceMesh = new THREE.Mesh(new THREE.PlaneGeometry(columnWidth* 0.6,1),moneyMaterial)
							scene.add(priceMesh)
							priceMesh.scale.y = price * dollarHeight
							priceMesh.position.y = savings.position.y - savings.scale.y + priceMesh.scale.y
							selector.localToWorld(priceMesh.position)
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

				let correctPosition = this.position.clone()
				correctPosition.x = this.currentColumn.position.x

				selector.position.lerp(correctPosition,0.1)
			}

			scene.add(selector)
			selectors.push(selector)
		}

		for(let i = 0; i < controlsArray.length / 4; i++ )
		{
			Selector()
		}
	}
}
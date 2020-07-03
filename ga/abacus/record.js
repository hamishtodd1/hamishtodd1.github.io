/*
	controversh: We should get used to having lots of code deleted, fuck rereading and editing, redo everything. Maybe don't sweat the record too much
	Visualizing the abstract syntax tree is surely good for concurrency?

	Could be a lot like a spreadsheet. Already is really, you have the data there

	your actions you can understand. All the complexities of the circuit should just be a visual representation of them
	So we call this the record because for the time being that's all it is...

	Navigation / debugging
		If you hover the record, it instantly takes you back to that place, but unless you click, when you let go, you return to your current progress
		You can zoom in and out
		Zoomed in, the stuff that is cut off the top must be evaluated
		Do you want to delete all code below?
			Probably yes. In puzzlescript games, it's certainly not so bad that when you rewind, you still have some determined future
			In fact that sounds fairly confusing

	Cartoonish representation (must be secondary to input efficiency)
		"Bunch of little monsters arranged in a certain way" beats "little dude runs around"
		Or is it "a copy of this thing will be made and flow along this line", like a frog that shoots out its tongue to get one of a thing from where it is

	Connection = "these things are the same", quite powerful and you probably need it anyway

	Can anything from any point in the past be cloned, or can things be destroyed for ever? "destroyed forever" sounds more like eating
		To put it another way, does it pay to be selective about what variables you remember? Can scope get crowded?
		Not in any geometry programming you've ever done!

	Maybe all you have to do is double click, or whatever, something in your scope, to get to the part where it is made

	when you bring a multivec over to a place WHERE ANOTHER MULTIVECTOR MAY BE FOUND IN FUTURE, we could "run debug build" and break at the point where it would be there

	"Language"
		Should have good gamefeel, "the public" is the primary audience, yourself/GA users is secondary
			Functions as creatures that swallow and poop out
		Need copyable functions - LATER. MUCH CAN BE DONE MAKING JUST ONE FUNCTION. MORE LIKE EQUATIONS!
			Add and multiply are functions so should probably have same syntax
			The nice thing in comparison with other programming is that things get animated
			So you're making rectangles that wires go into
			You know those starting things? For a function, you must supply those and only those
		Inspiration
			programarbles
			dynamic diagrams
			blueprints
			Claude's livecoding thing (abstract syntax tree I guess)
			Human Resource Machin
		How to represent variables
			Proooobably best for them to be immutable
			So if you want to "see what it looks like for a different input", you have to sit through the evaluation up til that point? Hmm
			Wires or projectiles or falling programarbles, there's probably nothing else
			Serious mode is wires, fun mode is programarbles?
			Programarbles falling is nice. Arrows can go in any direction so harder to read. Natural "control flow"
				Programarbles has this "duplicate" thing. Fine. But with code you can refer to a variable in multiple places
		Could be more like Drawing Dynamic Visualizations, where you do stuff
			it's the difference between interactive scripting (which immediately gives you output) and writing into a text file
			Then you get a record of what you did
		You are NOT trying to make an arbitrary programming language as an end unto itself.
			You are trying to show what can be done with this data structure
			There are few things in scope
			There's only one kind of data
			Loops? urgh 
		Try to bear in mind it might change =/ Work on level design!

	Is the cognitive model "every frame, time freezes and this happens"
		or is it "every frame, inputs change and stuff comes out automatically"? Probably latter
		Lol dynamicland

	You can click a place in the record and, debug-style, it'll take you to that point in the whole process
*/

function FunctionPlane()
{
	let functionPlane = new THREE.Group()
	functionPlane.position.copy(multivec.position)
	functionPlane.position.x -= .5
	functionPlane.position.y += .5
	scene.add(functionPlane)

	let background = new THREE.Mesh(unchangingUnitSquareGeometry, new THREE.MeshBasicMaterial({color:0x000000}))
	functionPlane.add(background)

	let spacing = 1.
	let numWide = 2.
	let numTall = 3.

	background.scale.set(numWide*spacing,numTall*spacing,0.)
	background.position.copy(background.scale).multiplyScalar(.5)
	background.position.y*= -1

	let grid = new THREE.LineSegments( new THREE.Geometry(), new THREE.MeshBasicMaterial({
		color:0x00FF00,
	}) )

	let verticalExtent = numTall/2*spacing
	let horizontalExtent = numWide/2*spacing
	for(let i = 0; i < numWide+1; i++)
	{
		let x = i*spacing
		grid.geometry.vertices.push(new THREE.Vector3(x,0.,0),new THREE.Vector3(x,-numTall*spacing,0))
	}
	for( let i = 0; i < numTall+1; i++)
	{
		let y =-i*spacing
		grid.geometry.vertices.push(new THREE.Vector3(0.,y,0),new THREE.Vector3(numWide*spacing,y,0))
	}

	functionPlane.add(grid)

	return functionPlane
}
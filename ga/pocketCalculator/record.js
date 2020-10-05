/* 
	When speaking to a person, which we evolved to do, there's no "going back and editing and rearranging"
	That's for text editors. And Dynamic Visualizer and Apparatus are probably not so good for that.
	If there was a good way of doing that for language, editors would already use it
	So if you want gestures, you need a way to turn a gesture into a linguistic record of that gesture

	Currently these notes are frozen while you work on text editor to get the desire for full power/expressiveness out of your system
		The game version is still probably pocket calculator. 
		You will probably think more like puzzlescript games, it is too abstract to have coding and multivectors are already interesting enough

	Unlike normal code, here it's maybe ok to "have lots of code deleted". You'll redo a series of steps in a puzzle game, why not this?
		If not, is the cognitive model "every frame, time freezes and this happens"
			or is it "every frame, inputs change and stuff comes out automatically"? Probably latter

	If you DO want to prepare people / "abstract over inputs"
		one way to do it without having to go through the same code multiple times might be to have a single scalar as the variable input,
		And, block-universe-like, you do things that map those scalars to values in 2D
		Can all happen at the same time, can all be thought of as changing the shape of something rather than changing a time-abstracted thing
		
	Thinking of it as something you do and record
		This probably should just be thought of as a way to animate things and make the interface understandable for a new programmer
		your actions, a series of them, you can understand. All the complexities of the record should just be a visual representation of them
		So we call this the record because that's all it is
		Interesting how Braid and chronotron do kinda do this. They even have the inputs continue playing for a shadow copy who's ended up in different circumstances
	
		If you hover the record, it instantly takes you back to that place, but unless you click, when you let go, you return to your current progress
		The stuff that is cut off the top must be evaluated
		When you go back to a certain time, do you want to delete all code below? aka clear undo/redo buffer?
			Probably yes. In puzzlescript games, it's certainly not so bad that when you rewind, you still have some determined future
			In fact that sounds fairly confusing

	Building a tree
		Can anything from any point in the past be cloned, or can things be destroyed for ever? "destroyed forever" sounds more like eating
		To put it another way, does it pay to be selective about what variables you remember? Can scope get crowded?
		Not in any geometry programming you've ever done!

	Maybe all you have to do is double click, or whatever, something in your scope, to get to the part where it is made
	when you bring a multivec over to a place WHERE ANOTHER MULTIVECTOR MAY BE FOUND IN FUTURE, we could "run debug build" and break at the point where it would be there

	Cartoonish representation
		Creatures swallow and poop results
		"Bunch of little monsters arranged in a certain way" beats "little dude runs around"
		if you do have little dudes running around, maybe the add monster likes apples, you put apples where you want him to go, and multiply likes bananas
*/

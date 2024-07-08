/*
    For kids making puppet shows, possibly lack of arrays is good, encourages unique behaviour in everything

    Post Space Hippo/puppet show notes
        The controls for the puppet show were just moving the things around, you essentially see their hands' work very directly
        It was up to them to introduce constraints
        They had two flashlights, two switches. They would rarely be taking their eyes off what the audience sees, just controlling it with their hands
	Lol, it isn't going to be your editor that you use
	In pong: you can maybe keep track of score yourself. No biggie, you have a separate score-keeping object

    Controls need to be SO INTUITIVE, SO SIMPLE
        Making shaders that just dispense transforms
    So no:
        Data structures with state, other than the dual quats
        Un-normalized stuff
        "Debug view" - WYSIWYG, audience view is same as creator view
        If statements
        Making new meshes
        Worrying about minus signs. The minus sign i
        Customize it to where you go like those french plays, do a lidar scan of some nearby object
        Using numbers
            Indexes for arrays

    Your own puppet show
        Use some classic stories. Arthurian legend or greek myth
        Ultimate showdown
            Tokyo background
            Godzilla #1: hop, furrow brow
            Batman #1: throw bat grenade
            Shaq #1: punch
            Aaron carter: punch
            Batman #2: exit batmobile
            Lincoln #1: movable hand, gun
            Optimus Prime #1: move somehow
            Chorus, just show lyrics
            Optimus Prime #2: get bitten
            Godzilla #2: bite
            Shaq #2: stagger
            Jackie Chan #1: grab
            Batman #3: stagger
            Lincoln #2: swing machete, fall over
            Indiana Jones #1: Crack whip
            Godzilla #3: sneak
            Indiana Jones #2: Find gun
            Batman #4: fire gun
            Jackie Chan #2: do a flip off Shaq's back
            Lincoln #3: pole vault
            Optimus Prime #2: static
            Care bear: laser

    Tech
    All the multivectors coming from the pictures should stay inside the animation, no need to have a clone of them in the scope
    often you're modelling the differential
    A better representation of a thing over time might be its worldline with timestamps labelled
    is there an elegant way to feed back into the scene?
        the "real" ones are frozen in place, when you click them they're cloned
    The thinking is: you are trying to go from t = a to t = a + epsilon
        This tries to avoid numerical analysis. That might be impossible / foolish
    Maybe you're always modelling the time evolution of something in which case it's a simple number as input.
    But "reaction to different parameters and events" is interesting which is why getting the differential between two frames may be more versatile

    Properties of ideas
        Should be "satisfying" stuff. Look at "most satisfying video"
        Juicey
        Look to Rhythm Paradise for inspiration
        you want to put random things in the littlescene. That's how you make cool demoscene stuff
        It should mostly be about mechanics to be a fun easy thing for people to do in their lives with AR
            Look through mechanics textbooks for examples	

	Random ones
		those toys where you have paper rolled around a stick, swing the stick and the paper extends
		Ribbon olympic gymnasts https://www.youtube.com/watch?v=j0MpdyFDr5Q
		guy pouring while spinning https://www.reddit.com/r/blackmagicfuckery/comments/dxm12f/fluid_dynamics_god_mode/
		Cool rainbow thing https://twitter.com/MachinePix/status/1323759584390033408
		Nice footage of bubbles https://www.youtube.com/watch?v=WTxDyYHaYAI
		This animation except in 3D, the points are rotating on circles https://www.reddit.com/r/math/comments/jdns19/circles_moving_in_a_straight_line_with_sin/		
		hoberman esque https://twitter.com/MartinSchwab9/status/1289323221049843712
		hockey practice https://twitter.com/SportsCenter/status/1340131112119627776
		windmills (guess you need fluid mechanics)
		flipping a bunch of things in a nice pattern https://youtu.be/Hy6vddbQa8Q?t=10
		Ball shot from cannon
		veritaseum https://www.youtube.com/watch?v=4tgOyU34D44
		https://www.geogebra.org/m/kvy5zksn
		https://www.novelty-automation.com/
		fireworks
		corkscrew
		Clock with plastic wheels with numbers on them to represent time. Fourier series!
		sphere
		Games
			flappy bird
			jetpack joyride
			grappling hook
			lunar lander
			pong
		damped harmonic oscillator visualization
		schrodinger's smoke
		tornado particle effect
		That sea wave thing where each point on the surface is a point on a circle
		Visualize wind direction for sailboats
		Toilet flush mechanism
		Pastabydesign, parametric equations for pasta
		Daniel piker stuff
		Use the appearance of your unshaven neck to talk about hyperbolas/vector fields?
		Felix colgrave flag animation
		Go travelling in order to make the videos
		Go to lots of conferences for fun and to give you deadlines (well blow would argue don't do that) Toy fair, gathering for Gardner, quantum computing
		Tim's transformers dog car
		Marble taken up stairs by those staircases where the stairs go up and down
		Euler disc
		Blowing into whistles with rotating bits = constant force "Tim whistles" grand illusion
		led trails on lights
		Yoyos, Kendama, diabolo.
		Footage of cycle stunt people going through the air. Sell to RT software

	General ideas / mario-esque "areas"/islands
		Lasers may be a better central focus. EM AND QM AND a link to rocketry
		Could have a major thing about programming robots. It will be pretty important!
		How fast does glass crack https://www.youtube.com/watch?v=GIMVge5TYz4
		Mechanical engineering
			Bottle rocket
			A pair of curling stones attached with elastic on an ice rink
			Two minute paper Sims like the hair water one might be nice to try to replicate
			Mech engineering wise, you try to simulate Lego.. for eg designing the 4 speed transmission box
			Different sized cylinders rolling down straight slope
			Make a clock! Haha it's literally euler. Grandfather clock would be nice
			Dead link sadly https://twitter.com/raedioisotope/status/1257135705030922240
			programming the spaceX booster landing
			Cogs
				funky mechanical leg https://youtu.be/wFqnH2iemIc?t=46
				Another nice cog https://youtu.be/SwVWfrZ3Q50?t=306
			Wave stairs that make marbles go up https://youtu.be/SwVWfrZ3Q50?t=353
			moire patterns?
			conservation of angular momentum https://youtu.be/SwVWfrZ3Q50?t=242
			Some nice gears like one that gets pushed forward and does a figure of 8 or whatever
			Dice with constant angular momentum spinning in zero gravity
			The machinery you have on the wheels of trains
			What's an example of adding torques?
			ink coming out of spinning pens https://www.youtube.com/watch?v=FOJ7JAUK6EU
			Coat hanger maker https://youtu.be/uuj6NLCG0vM?t=441
			Constraint solving https://zalo.github.io/blog/constraints/
			Basketball bounce
			taco folding https://youtu.be/xWG5Jx66VzQ?t=400
			cog thing https://youtu.be/IjeKw0B8PG8
			pizza https://twitter.com/Rainmaker1973/status/1084064448690774016
		Toys
			Stick and slip bird toy
			physics fun instagram
			Balancing https://youtu.be/mwzExNYs12Y?t=144
			beesandbombs
			Sprinkler https://youtu.be/Em6krJvumkI?t=471
			A coiled up fern unrolling
			keenan crane "cross fields" https://twitter.com/keenanisalive/status/1155851119987290113
			harmonic water droplet https://twitter.com/bencbartlett/status/1172932701722009600
		Animals / humans, literally film them
			Swings
			Looks like fun https://youtu.be/mwzExNYs12Y?t=541
			Skiing?
			People pushing against one another https://twitter.com/robertghrist/status/1113952877733658624 a different person withdraws their hand
			Bicycle flip https://youtu.be/IjeKw0B8PG8?t=278
			Snooker
			Snooker on a tilted table
			Look in AR thing, arranged by ease of computer-visioning
			Ping pong
			sport eg spinning tennis ball hitting ground
			Classic: person walking on a train
			A puppy that is enjoying licking a lolly. The lolly moves away ordinarily, but if you can get its jetpack to follow the lolly it can continue licking
			Bee going from flower to flower
			Curling stones
			Diver
			Dancer, breakdancing and voguing especially
			Juggler. Lots of circus skills
				https://www.youtube.com/watch?v=9GOEz7FEh88 ribbon tutorial, great
			someone going down a helter skelter
			Someone is about to set of a spinning top
				you can change the amount of angular momentum they put into it by changing the size of their bicep

	Weird science
		Sewing machine mechanism
		Thrusters in different directions
		guidance computer using gimbals
		https://twitter.com/MachinePix/status/1249390426672361472
		https://twitter.com/MachinePix/status/1395150947719032835
		https://twitter.com/Pamchenkova/status/1396535440237334528
		Probably interestingly shaped magnetic field https://www.youtube.com/watch?v=c2h60hCJh2U
		ball and disc integrator
		nicely visual QM course https://www.youtube.com/watch?v=K4BF7MD69_U
		guitar string in slow motion
		total internal reflection https://www.youtube.com/watch?v=Lic3gCS_bKo Boyd Edwards is apparently the guy
		Number theory
			prime numbers are ones not on the hyperbolic paraboloid
			What about the stuff in the minutephysics shor's
			Enough for cryptography, then elliptic curve cryptography
		pbr https://www.youtube.com/watch?v=RZiTJCxb9Ts
		auroroa borealis
			https://www.nasa.gov/feature/goddard/2019/nasa-launches-two-rockets-studying-auroras/
			https://www.esa.int/Applications/Observing_the_Earth/Swarm/Energy_from_solar_wind_favours_the_north
		Planetary motion
			A bomb going off and lots of pieces of shrapnel. You have to do lots of them
		Electromagnetism:
			Lots of fun magnet stuff / toys out there.
				Prove that perpetual motion machines based on magnetism are dumb, the "pushing" comes from you
			Electrically powered rockets https://en.wikipedia.org/wiki/Electrically_powered_spacecraft_propulsion
			telescope optics,
			telecommunicatio/satellites. No magnets but this may not matter
			Magneto dynamics! Of the sun or earth!
				Surface of the sun: https://www.youtube.com/watch?v=znBesUwVOok&ab_channel=SciNews
			Lightning, it's badass
		quantum
            /Electromagnetism/Optics
				Reflections
			/Electrical engineering
			a vector of complex numbers can separate into a vector and bivector (i*vector) parts?
			3 states are used in this thing on bell https://freelanceastro.github.io/bell/
			Chromodynamics
				Got three nice variables(?)
				Applicable to nuclear power which is rather mysterious
			ultraviolet catastrophe
				If you want to know how things glow or how long it takes for heat to radiate off them, need qm
			Could base a lot of it around color changing chemicals? Nice for reac diffusion too?
			https://sustainable-nano.com/2019/11/12/gold-nanoparticles-color/
			Main dude for QC tim@energycompression.com
				You know, you're just barrelling into QC assuming CA is a good fit for it, maybe it isn't. Well. If it isn't, maybe don't work on this.
			Aharonov-Bohm Effect
			quantum hall effect
			If you have a vector and bivector together being a wave function with mod squared equal to 1, and vector is determined, what does that mean for bivector?
			nuclear powered rockets
			Not putting stuff in the van allen belt
			ion thrusters?
			nuclear fusion
		Magnetised needle, droplet going around it
		Re electromagnetism: look at "magnetic core memory", that's something you can do a shader simulation of

Kids don't care about the precise exact colour of some shit, when it's just meant to look realistic anyway, they want to play.
    No more electromagnetism, QM, structural color. Fields, i.e. fluid/aerodynamics is much more useful
    Probably colors are accounted for by NNs eventually anyway.
    Probably the game designer works with a blocky, analytically simple representation, then NNs turn that into nice graphics

From "infiniteGeometry":

Scalars:
	When creating a scalar, various bars can come and sit alongside one another to show you the comparison
	For measuring a translation, given a euclidean point you can make a line segment between them whose extension passes through that point
	The position of the point along the line segment is irrelevant. It's determined by the position of those planes along it, which is a gauge too
	you can imagine the point as being in the plane joining the origin with the line of translation


-----------------IF STATEMENTS / CONDITIONALS
First implement orientations and points, which you know you need

-1 should correspond to "false" or "not equal" because it's saying "these two planes are oriented in different directions", i.e. their geometric product is -1, i.e. "!="

How would you have: "if this scalar > 0 point over here, else point over there"?
	This is "symbolic" but: an arrow flowing from the scalar to two vizes

So we have an extra variable, a "switch", which is either +1 or -1
It could be like "compare these two planes, check orientation is same"
That can be turned into "

The kinds of question to answer (ONLY EXPERIENCE OF TRYING TO IMPLEMENT THE BELOW STUFF TELL):
	Is scalar x > 0?
	Is scalar x > scalar y
	Is this point ideal or non-ideal?
	Which side of plane is point on?
	Each of these metrics that get "orientations" I guess


One way you can have 0 is the meet of two lines that don't meet. Ummm that is e0123


Could have a transformation that is either the identity or 0
"Multiply this by 0 if..." is equivalent to "only have this thing appear if", which is good

Problem with {-1,1} is that -1 is different to 0
	But maybe it isn't so different. e0 in one dimension is a pair of points. You're really either going toward one or t'other
	-e0

Convo with prathyush
	Ok, you do it in one situation, and you tell it what you want
	Construct the other, tell it the other thing you want
	There doesn't HAVE to be a boolean visualization / multivector
		Just a boolean DEFINITION
		PROBABLY there's always a given mv such that if A then it's x and if !A it's y
		So you construct x and y
	Watch that lambda calc birds thing again
	simulation in GA, multiplying by zero
	Modal vs equational
	Just need to be moment-to-moment when performing simulation, the visualization of the if statement is only a problem for this UI question

	We're going to define a boolean, it is BY DEFINITION DEPENDENT ON TWO THINGS AND SOME OPERATION

	booleans are... "oriented this way or that way". You can probably turn anything into a question like that.
	Maybe it's a little clockwise/anticlockwise thing... has to be "affected" by those things

--------------------ARRAYS
Could be more like classes? So you choose some object and duplicate it (put both hands on it, grab and pull apart)

Suppose we're 2D, you're grabbing a line. Line is currently snapped to be meet of points A and B
Move hand freely and of course this "end" of the array is being mapped to that place
	and the others in between are interpolated
Snap the line you've got to some other points C and D, stuff is also interpolated

When you move its duplicate, well...
	the whole set of your objects are defined by a directed graph where each arrow is an equation
	Obviously if this member of the class has a different value in it, it must have "derive from" different things
	So if you're going to move its position,
		there must be a duplicate made of the thing its position came from
		and that thing must be moved
	Some arrows can only go in one direction, the grade-selectors
		Hey maybe you wanna control arrow direction
		Does everything come from two arguments? If so it's a simple switch. Or cycle through them
		The way it works is: if you hold THIS ONE in place and move THIS ONE that derives from it
			It'll try to redo it such that the one you're holding in place stays there and THIS ONE moves



-----------------SHOULD BE ABLE TO MAKE
Infrastructure is boring, eg "keeping score: score += 1 if ball in net". Kids can do it themselves
Pong
Bullet hell shmup
Shoot all the balls with all the guns
Shadow puppets game

Apparently dancing tutorials. Teacher does a certain thing
rope-like things
A super hexagon like puzzle exercise game
Ok so it is a about knotting. Maybe even knitting. You have a column rising out of the floor and there are, flower like, rigid wires that have hook like parts of them that you can wrap the string onto.
Most interesting vr weapon would be a whip
Jam: juggling with low gravity and trails. Maybe loops back to make a nice looped braid
You have a pile that gives you more whenever you need them
You can crank gravity down so low that you need to pull stuff down
You can change your hand radius
You can make it so that they stay in your hand plane
Different size balls with different bounce heights
Poi
blooming flower
a bouncing ball
A little "pet dog" following your hand
Flappy bird / canbalt
Weights
Skinning (dual quat fields)
	"Animation" is too broad, everything is animation. You want a kind of animation s.t. dual quat field is natural
Minimization
	Well that's just a ball getting to the bottom of a valley
Rigid body dynamics
Texture/normal mapping
	Motor manifolds, probably mappings from I^2 -> motors in 3D
Fields 
	of force
	of velocity
	the slicing of them
	their action on objects
Curves
	1D
	2D
Back to classical mechanics
A little cartoon character that
	knows what direction to look in
Import
	1D textures
	2D textures
	3D models

Platformer control scheme:
    you've got your finger, on the dome, from above.
    The avatar is in the center, always going around the (w=1 version of the) point indicated by your finger,
    osculating-circle-style
    What for?
        Nice how it generalizes to more dimensions?



-----------------MAKING ANIMATIONS

Frenet Serret
	So if you imagine time is just passing, and you're changing the orientation of your hand
    That can build up a curve in 3D space because at any given time,
        forward is the tangent
        Up is the normal
        Right is the binormal
    It's like you're firing a gun squirting a twirling tube of liquid
    Or that colored string loop shooting toy



So one very puppet like way to bring in some flexibility would be:
        motor field that varies along one direction
        Very similar to chinese dragons: you hold both ends in each hand, wave it to get nice effect
        You have the two interpolants, pretty intuitive what'll happen, maybe base a bunch on that?
        Also like an accordion

If a name is derived from (something derived from) itself, you can be sure it's "to be animated"
If it's not based on itself, you know what to do

Might be best off as a children's puppet show
	you want to be able to control from a hand model

If statements: there are loads of ways of making something crash to 0, i.e. "make it so nothing happens". Try to use that?

Things are done in the order the user did them

The game should be about crafting trajectories for objects using whatever
	Maybe it should be completely about making loops, no beginning or end, no worry about controls / seeing the whole thing when it's embedded in an article

Puppets, lots of puppets

HOW WOULD YOU MAKE AN ANIMATED THING IN EXCEL?

Colors are your "names" / your pointers to buffers
By default, everything creates a new thing, so a "series of frames" will make a dotted curve.
But you can make it so that we assign a new value to a thing. That's a choice though
And so long as you have one of these reassignments, you have a thing that can be thought of as an animation
	If there's a series, you go through them all in order




--------------------MUSIC/DANCE INSPIRED

There are multiple little areas you work on concurrently

And deleting things easily
Ability to "record" a motion of the hand, especially to create phrases in music
Maybe the ruler is visualized using the same stuff? Just an infinite line with planes along it as notches and a point in the center as its origin. Yes, still special case, getting transformed together

Rigid body puppets to make
	Flapping birds and beetles
	Waving flowers
	Rotating planets
	Moving eyes
	Snake
	Penguin
	Quadruped is too much, maybe hedghog



--------------------REVERSIBILITY / REVERSIBLE
Z derived from X and Y. Can "Hold X in place and move Z, changing Y"

The idea is you may both the angle and the line

--------------------FUNCTIONS
Need to be able to have something like a function: "what I just did for this, except with this input"

Way of defining a function:
	"Gather" all the things you want as inputs
	select what the output is
	Now that's in the library of things that'll be run through when you have that bunch of types
	Is it a problem that f(point2,point1) can't be distinguished from f(pointB,pointA)? Not really because both would have to be generated from you unordered pile anyway

This is where programming by example comes in. Or is it needed?

Excel doesn't really do function syntax in a way you can rip off
Excel function syntax works as: "you have these three cells, you're going to act on them"
With your thing, you can designate function inputs: you can "isolate" the variables you want as input
Then that just gets added to your joypad directions
But the point of the game version is you won't be making new functions willy-nilly
Each one will be introduced with a level



--------------------CONTROLS
probably you should be able to do one with one hand and one with t'other
the ones being used to make the candidate should highlight when being used

The way to make a curve is just a series of points

"Hide" button

----------SHOWING / HIDING
Let's assume everything is visible to start with

Re hiding, the shit that defines each mv in the final viz is a "scope"
There's a button which, when pressed on an mv, shows you what derives from it
And a button that does that recursively perhaps
Hide something that's not used in any visible mv = delete

Visibility modes:
all visible
Only your starting points
only those in scope visible
only those in final game visible

When you open the vizes of a different object, it should any invisible vizes you currently have open
unless it's causally downstream of the vizes for the one you currently have open. In which case, if there's intermediate ones, you show those too. This is good because you can hit "viz that is currently buggy" then "viz that you know is fine" and see where things went wrong

So showing and hiding is a big deal
	You could, by default, hide everything that lead up to the final thing you've made
	Then people have to make those things again. Er, why is this a good idea?

There's the game view, and then there's the "currently doing something" view in which you spend most of your time
The game view is extremely faded and in the background. Like, render it to a texture and fade it.


-----------------ANIMATIONS ILLUSTRATING THE ALGEBRA
How you show the "formulae within": when you make object X based on objects A, B, C, it briefly flashes up all the intermediate objects

It "should" be the case that frameDelta = 0 gives 0 change to something. It should be differentiable
The ruler, which has all your scalars on it, is powerful. You can put it in a certain place, at a certain angle, and measure a distance

You're working with two superimposed frames so you can get differential
	This is also how you conceptualized "based on frame n we are affecting n+1". Things in frame n are un-alterable



--------------------TWO QUBITS
Try to prove 4 vectors over C are isomorphic?

Potential fun way to lay out quantum circuits:
	you can organize them on a 2D grid
	They're all plane-pairs through their respective origins
	Some of them will have their lines parallel, those are, er, closer to being in phase
	Some will have their planes the same, those are actually the same
	Have them all in a row. Let the quantum circuits stream through them
	Could have a nice conformal transformation that makes it so you don't have to look THAT far up to see where the planes converge (because the planes are spherical


--------------------MISC / PHILOSOPHICAL / PUT THIS INTO THE PRESENTATION
The idea of manipulating all the points in a curve, seeing how your solution performs in general, is surely good. It's an even better idea than GA
	
What for?
	Simplifying code is something we all know is good. Make tools to help automate that!
	Make it so people learn these simplifying/geometrical things
	Ordinary physics and maths is about doing these / teaching theorems
	Runtime differentiation
	The maths you write in your notebook then use to derive a single crazy formula that you put in a line of code - that should be in your codebase
	What it says about this system
		Algebra can be useful to a computer scientist if you stay consistent

This is very much the "literal terms" approach. In sport, people do talk about spaces. They DON'T construct elaborate non-literal things then talk about THOSE.

-------------------NAMES
implement IF OR WHEN YOU NEED IT

This allows you to do arrays, by having all the things be the same color
It also allows you to have self reference in some sense? Give them individuality
Need something on these vizes that shows you their name
	stripes in the case of line
	horizontal strips in the case of points
	Plane, ehh
		Could be boundary, could be in the middle, wherever that is
		Maybe there's a thing on it, and it always moves to be quite close to where you'll next look on the plane
There's a "rename" button. Click it on an object and you get a radial menu of existing names
	To animate, you make a new point based on a previous point then make the new name the same as what it's based on
	You may want to rename for other reasons
		Suppose you've got lines a, b and c = a^b
		But you want c, which is involved in other things, to be a^d instead
		You construct a^d and it gets assigned the name x. Then you rename x to c and now all flows from that

-------------------RENDERING
You DON'T want to change the lighting on reflected objects, they should be lit as if they were real objects

Consider: the points and lines could be like stars in the sense that they look no different how close or far they are.
In that situation you need neither a mesh nor an sdf? You just need a way of computing where they'll appear to be?

So these mirrors. They reflect the "background". But NOT the objects, unless you use 'em that way. Probably they're also transparent mirrors, urgh.
Probably they're not pure mirrors, you really need some ripples on them or whatever. Scratches?
By the way maybe they can have fading at the edges

Maybe everything south of the equator LOOKS like it's at infinity
Single fragment shader / sdf:
	https://www.shadertoy.com/view/XsXXDB
	Best not to use sdf because when you do your funky transform with finitized infinity it's not closed form
	Ambient occlusion
	Soft shadows
	Not performant, limited bounces
	Doesn't work for meshes / you need another kind of reflection

Stencil:
	Maybe you do want to render objects differently sometimes
	Probably pretty good performance
	Have to work out light direction
	You have something like n^m draw calls. n is number of bounces, m number of mirrors

Render targets:
	Have to work out order
	No nice shadows
	Performance might be crap
	You need 3 layers because points
	If you were to do it
		Only have the three reflections when you're showing a motor
			We render the scene from the point of view of the deepest reflections
				Then the next
				Then the final

----------------------Algebraic deduction / omicron reduction
    In an ordinary editor, one problem you'd encounter with an automatic inliner is that if you had any variables with same name...
    Not such a problem for us because auto-renaming, you really don't give a shit about the name, it's just the shit you type
    law of sines proof, doable with reduction: https://slides.com/labs810/ga4science#/28/0/4
    Maybe worth calling them "conjectures", because mightn't they be false?
    Cauchy Riemann is a nice example of something you can put in reductions
    the fundamental axioms are e1^2 = e2^2= 1 and e1e2 = -e2e1
    Ivan sutherland had it. You have your algebraic properties (all statements of the form f(...) = 0), but they're applied to pictures and applied gesturally
    As joel says, sometimes you want to write a*b = b/a but it's some bunch of things that just cannot be rarranged into a = or b =
    Call it inlining and outlining
    Isn't it kind of arbitrary what we label as definitions and theorems?
        Can't you take the theorems and then backsolve to the definitions, meaning that the definitions were kinda theorems?
        Maybe put in euclidean geometry, intuitive "axioms" describing geometric product like angle(a->b) = -angle(b->a)
    Can you have counterfactual reasoning? Maybe there's some function f. You have not evaluated f but you assert that f() = 2.
    Suppose you don't know how to integrate f. but you can *write* / assert that integrate(f) - suspectedValue = 0.
    Might be very useful for transitioning between coarse grain things and non course grain. Compile-time approximation of a function by a series
    It's kinda like assertions
    You want to see if the things you have written are simple geometric operations
    Is this "constraint programming"?
    You're defining properties of a thing without knowing the thing. Then you juggle til you have a function describing the thing. Funny way to program?
    You can use this stuff, simplified equations, to build the animations that get used for operations, see operators.js
    In addition to jugglings, you can have constraints
        "always equal", eg check associativity
        Maxwell's equations, newton's laws of motion
        What would be the system/thing you'd put into a function that would check constraints? Function strings? Good thing they're equivalent to shapes...
    This is a good idea, animating it too. If you want to animate everything in GA for physicists you must do this
        All these formulas, fundamentally they are about plugging numbers in and getting results; wanna have the possibility of doing that!
    Most of argumentation for math/phys is showing equalities. Our plan is, instead of a = b, output a - b which is 0
    Rearranging computer code into a simpler form... sounds like delta reduction?
    It's not always "reduction" in the sense of reducting the length of the string. Good to do ab -> a.b + a^b
    The kinds of algebraic manipulation you do are kinda like constant folding?
    You coooooooould have it be that highlighting a phrase gives you a dropdown of stuff you can turn it into
    Removing multiples that are 1 and leaving the thing it multiplies by, or completely removing things that are multiplied by 0
    integration and differentiation rules are examples
    The purpose of this is pedagogy, and hey, maybe more
    Is there any way of turning the subsitution rules into things helpful for the animations or where to put stuff in the pictures???
        Maybe this is how you say that difference vectors should be put not at the origin?
    Proving stuff in the course
        To demonstrate equality you can just plot things. Or you could use omicron reduction to reduce to 0
        Proof by contradiction? Could put a dumb thing into the omicron reduction and, haha, look for bugs

reduction / partial evaluation / function syntax
    //you don't get to name functions, the thing does it for you. write a => b with a being free...
    how to detect opportunities? Regex?
    Don't necessarily need names. Fuck names, of course
    if you do give them names then you may be able to spot analogies. Write some weird equation with no geometrical analogue and it pops up "linePlaneIntersection"
    How to animate the things? if they've got the same symbols can move them around
    (a,b,c) -> a*(b*c) = (a*b)*c

    integrate and differentiate are both functions from the space of functions to the space of functions, fairly simple

    function differentiate(f,at)
    {
        let dt = 0.0000001
        return ( f(at) + f(at+dt) ) / dt
    }

    function integrate(f,at)
    {
        let dt = .0001 //the width of a pixel
        f()
        //for any approximation of integral of f with given dt, we can scale f such that you get that dt level precision
        //multiply final result by dt... but that is just a scalar multiple, only relevant if you put symbols on the y axis so to speak
    }

*/
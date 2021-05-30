/*
	Notes
		These animations- you must make them using the system, the player is to reverse-engineer them
		Nice how videoing them projects them onto a plane so they can be vizzed in a volume
		Tech
			Mocap markers are cheap! https://mocapsolutions.com/collections/mocap-solutions-markers
			You probably need a high speed camera
		All the multivectors coming from the pictures should stay inside the animation, no need to have a clone of them in the scope
		so you're modelling the differential apparently
		A better representation of a thing over time might be its worldline with timestamps labelled
		the basis vectors should be inside the scene
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

	Re electromagnetism: look at "magnetic core memory", that's something you can do a shader simulation of

	Kids don't care about the precise exact colour of some shit, when it's just meant to look realistic anyway, they want to play.
		Fuck electromagnetism, fuck QM, fuck waves. Fields, i.e. fluid/aerodynamics is much more useful
		BEHAVIOUR, not color. Maybe one day. They get hue, MAYBE alpha
		Probably colors are accounted for by NNs eventually anyway.
		Probably the game designer works with a blocky, analytically simple representation, then NNs turn that into nice graphics

	

	Random ones
		guy pouring while spinning https://www.reddit.com/r/blackmagicfuckery/comments/dxm12f/fluid_dynamics_god_mode/
		total internal reflection https://www.youtube.com/watch?v=Lic3gCS_bKo Boyd Edwards is apparently the guy
		Number theory
			prime numbers are ones not on the hyperbolic paraboloid
			What about the stuff in the minutephysics shor's
			Enough for cryptography, then elliptic curve cryptography
		pbr https://www.youtube.com/watch?v=RZiTJCxb9Ts
		auroroa borealis
			https://www.nasa.gov/feature/goddard/2019/nasa-launches-two-rockets-studying-auroras/
			https://www.esa.int/Applications/Observing_the_Earth/Swarm/Energy_from_solar_wind_favours_the_north
		Cool rainbow thing https://twitter.com/MachinePix/status/1323759584390033408
		nicely visual QM course https://www.youtube.com/watch?v=K4BF7MD69_U
		Nice footage of bubbles https://www.youtube.com/watch?v=WTxDyYHaYAI
		This animation except in 3D, the points are rotating on circles https://www.reddit.com/r/math/comments/jdns19/circles_moving_in_a_straight_line_with_sin/
		Probably interestingly shaped magnetic field https://www.youtube.com/watch?v=c2h60hCJh2U
		hoberman esque https://twitter.com/MartinSchwab9/status/1289323221049843712
		hockey practice https://twitter.com/SportsCenter/status/1340131112119627776
		windmills (guess you need fluid mechanics)
		flipping a bunch of things in a nice pattern https://youtu.be/Hy6vddbQa8Q?t=10
		ball and disc integrator
		guitar string in slow motion
		Ball shot from cannon
		veritaseum https://www.youtube.com/watch?v=4tgOyU34D44
		https://www.geogebra.org/m/kvy5zksn
		Anthony Howe kinetic masterpieces
		fire poi throwing sparks!
		corkscrew
		Nautilus shell - exponential spiral, e^ipi
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

	Structure based around rocket science
		Could talk to isaac arthur
		Classical mechanics / mechanical engineering
			https://www.novelty-automation.com/
			Sewing machine mechanism
			poi! fire poi with sparks!
			https://twitter.com/MachinePix/status/1249390426672361472
			it is very interesting that .5mv^2 works if v is squared using the Clifford product
			just moving the things around, rockets innit
			Thrusters in different directions
			guidance computer using gimbals
			fireworks
			Lunar Lander type game
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
		spec rel
			super fast rockets
		Relativistic QM?
		Quantum computing somehow?
			https://www.youtube.com/watch?v=F_Riqjdh2oM
		To make a thing about real rocket science you ought to have super awesome heart-swelling animations, hngh
			How to do it on the cheap: public domain NASA footage, plasma drive, ITER stuff with heart-swelling music
		Magnetised needly droplet going around it

	General ideas / mario-esque "areas"/islands
		Lasers may be a better central focus. EM AND QM AND a link to rocketry
		Could have a major thing about programming robots. It will be pretty important!
		How fast does glass crack https://www.youtube.com/watch?v=GIMVge5TYz4
		Quantum mechanics
			/Electromagnetism/Optics
				Reflections
			/Electrical engineering
			a vector of complex numbers can separate into a vector and bivector (i*vector) parts?
			3 states are used in this thing on bell https://freelanceastro.github.io/bell/
			Chromodynamics
				Got three nice variables(?)
				Applicable to nuclear power which is rather mysterious
		Planetary motion
			A bomb going off and lots of pieces of shrapnel. You have to do lots of them
		Mechanical engineering
			Bottle rocket
			A pair of curling stones attached with elastic on an ice rink
			Two minute paper Sims like the hair water one might be nice to try to replicate
			Mech engineering wise, you try to simulate Lego.. for eg designing the 4 speed transmission box
			Different sized cylinders rolling down straight slope
			Make a clock! Haha it's literally euler. Grandfather clock would be nice
			https://twitter.com/raedioisotope/status/1257135705030922240
			programming the spaceX booster landing
			Cogs
				funky mechanical leg https://youtu.be/wFqnH2iemIc?t=46
				Another nice cog https://youtu.be/SwVWfrZ3Q50?t=306
			Wave stairs that make marbles go up https://youtu.be/SwVWfrZ3Q50?t=353
			car engine like? https://youtu.be/SwVWfrZ3Q50?t=443
			moire patterns?
			trammel of archimedes https://youtu.be/SwVWfrZ3Q50?t=102
			conservation of angular momentum https://youtu.be/SwVWfrZ3Q50?t=242
			Some nice gears like one that gets pushed forward and does a figure of 8 or whatever
			Dice with constant angular momentum spinning in zero gravity
			Bicycle chain
			The machinery you have on the wheels of trains
			What's an example of adding torques?
			ink coming out of spinning pens https://www.youtube.com/watch?v=FOJ7JAUK6EU
			Coat hanger maker https://youtu.be/uuj6NLCG0vM?t=441
			Whip
			Constraint solving https://zalo.github.io/blog/constraints/
			Basketball bounce
			taco folding https://youtu.be/xWG5Jx66VzQ?t=400
			cog thing https://youtu.be/IjeKw0B8PG8
			pizza https://twitter.com/Rainmaker1973/status/1084064448690774016
		Condensed matter / "spatially extended" / the input is a big rectangle of values
			mandelbrot set
		Toys
			Stick and slip bird mechanism
			physics fun instagram
			Balancing https://youtu.be/mwzExNYs12Y?t=144
			beesandbombs
			Slinky https://youtu.be/Em6krJvumkI?t=422
			Sprinkler https://youtu.be/Em6krJvumkI?t=471
			A coiled up fern unrolling
			keenan crane "cross fields" https://twitter.com/keenanisalive/status/1155851119987290113
			Bubbles https://youtu.be/uuj6NLCG0vM?t=37
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
*/
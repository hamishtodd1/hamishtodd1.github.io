Aesthetics/graphics/non-design
	Particles matter a lot
	Seriously, making it look good is someone else's job. Your ideas are not great. Color choice probably matters more than realism
	Don't need no frustum culling
	Seriously you want to do bonkers graphics? Just do what everyone knows works, jeez, lots of particle effects and a professional animator
	Fuck photograph, get someone to do a great animated scene and then use voxel cone tracing
	Capturing a light field would be nice though
	Hearthstone may be an inspiration
	DO NOT THINK ABOUT THIS
	Liquid should glow. Spelunky's is great
	Maybe have the whole scene in perspective. The things come towards you to do the operation
	SDF/raytrace
		Can at least consider it because the geometry of these objects, which the player will spend a lot of time looking at, is simple
		good shadows, reflections, colored lighting, transparency. Lights could originate in a texture.
		But mostly can think of stuff as being in the background. Leave that to a game engine?
		So anything that is more complicated gets an an sdf https://www.iquilezles.org/www/articles/intersectors/intersectors.htm
		Lights come from environment/cubemap
			Ideally one with XHR and all that. Maybe even a light field? Could just be a cylindrical one?
		Ray tracings
			https://www.shadertoy.com/view/MtcXWr
		https://youtu.be/2xeYr_URt_o?t=893
	Cubemap "background"
		Each pixel of which gets its own ray trace/sdf call, just the one to see if it is immediately accessible to the light
	Maybe you want a conventional thing
		Less time consuming, makes it so you can focus on what is important
		The frogs are a certain animation
		Particle systems
		Look dumbass, of course when you bring in an artist they'll want to put in non-mathematical shit with textures etc.
	Examples
		hell https://www.shadertoy.com/view/MdfGRX
		clouds https://www.shadertoy.com/view/XslGRr
		Stateless fight
		nice surface https://www.shadertoy.com/view/Mdl3Ws
	Do not think hard about the backgrounds, with AR they disappear

Backgrounds - just need a surface
	Ancient greece - Euclid / Plato / Archimedes
	India / Iran - https://en.wikipedia.org/wiki/Mathematics_in_medieval_Islam
	17th century - Newton / Descartes
		Weirdly shaped flasks, eldritch stuff and weird candles abound. Real ancient looking alchemy shit
	19th - Grassman / Clifford / Hamilton / Maxwell / Faraday
		More modern, electrical stuff is around
		Royal Institution
	60s - Gell-Mann / Feynman / Dirac / NASA (Margaret Hamilton guidance computer) / JPL
		Mainframe in the background, 60s seat, 70s clothing
	Present day - CERN, ITER, a quantum computing lab (best)
	Future - space station / control panel of a rocket
	Far future / abstract platonic realm / inside an eternal cellular automaton - Quasar
		Ray traced quadric surfaces everywhere

Story
	Euclid - invention of geometry
	India - invention of negative numbers
		Without which there's only magnitudes, so this is the first step to thinking about directions
		Debts are not geometric though
	Kepler - those areas, they are bivectors
	Descartes - coordinates
	Newton - application
	Euler (and others?) - invention of i
		Euler's identity is surprising only if you don't know GA; only if you haven't fully internalised that maths is statements about shapes
	Grassman
		Rejected
	Clifford
		Tait was an astonishing asshole who should not be allowed to win
		The story of Clifford's wife is quite beautiful
		Very atheist
		He was in favor of divorce of something? Deffo read chapter in "Science Serialized: Representations of the Sciences in Nineteenth-Century"
		Pro sex work?
		It is a great story. Hestenes looking back on it as ancient wisdom
		Clifford on his deathbed thinking the hope will probably die and people will be doing hacky shit forever
		Tait was evil, full of wishful thinking and idiotic faith. Hating of divorce and secularity, everything  Clifford wasn't. Kicking a man while he was dying
	Separate office for Maxwell or faraday, more Victorian plus crackling electricity
		Faraday: I don't see why you had to bring maths into it
/*
	Messages that should be built in or emerge
		The meta-message is that knowledge of genetics gives you power
			Nature, i.e. chaos, has its own approach to genetics that is not that bad:
				They homogenize?
				They have less pain
			Genome sequencing and "virtual mating" should be embraced
				Studbooks are just a failed attempt to approximate it
			Some airlines don’t ship three certain breeds; some insurers do some mongrels more cheaply. They're using sequencing
			If you clone a hermaphrodite and mate it with itself, its offspring are genetically identical
		Dog welfare is important to try to interpret
			Though they want to breed, doing it within breed leads to pain
		Aesthetics -> stud books -> inbreeding -> phenotypic expression of recessive traits -> pain
			In principle, as with lab mice, we could breed until inbreeding isn't that bad
			And in fairness, WE WANT TO GET RID OF THOSE RECESSIVE SUFFERING TRAITS ANYWAY because they would sometimes come out randomly!
			Genotype-ignorant breeding -> phenotypic expression of recessive traits, so you ought to have some bad-but-not-inbreeding breeding at some point
			Inbreeding = lessened gene pool
		Aesthetics -> pain
			Some standards ARE pain. Maybe nothing to be done about these?
				Excessive skin
				Short legs arguably
				Short snouts arguably
				Bug eyes
				Weird tail
				Ridge? "a FORM of spina bifida"
				Brachycephaly?
				What is a companion dog if not a dog that has deformities that limit its movement?
			Some standards indirectly necessitate pain
				Tiny heads -> squeezed brain
				Small -> overheats
			Some are neutral
				All others will make pain more probable due to genetics-unaware breeders
				Some very specific combo of height and length. Only a few examples exist, so you inbreed
			But some can make pain less probable. That's good. Er, so long as you're ok with eugenics
				Eg Belinda *is* too scared
				Testicles
				Lack of teeth is bad, or unshed teeth
				"I'm trying to breed away from those weaknesses" - need to hold them to that. They certainly aren't breeding pugs
		This is not what the original creators of the breeds wanted
			They didn't understand genetics
			Unknown to them, their actions lead to exaggeration
				Shows how the definition of "breed" is daft because it exemplifies it
				In many decades, the drift will have gotten even worse
			With knowledge of genetics we can do better
		Possibly: interventions exists and is awful
		Possibly: culling happens and is awful

	Intervention system?
		Obviously affects phenotype but not genotype?
		The control method could just involve dragging them into the breed area, which causes them to change (and suffer)
		You get any dog resembling any phenotype with sufficient intervention
			But it increases their pain
		Some interventions can decrease pain
			If all interventions are dragging into breed, how do do this?
			But allowing them can make people care less about the genotype
			Some are necessary for survival?
			Technically "training" is intervention
			Caesarian section for bulldogs = intervention necessary for reproduction
		Intervention is interesting because you're thinking "how close can I get?" instead of "can I get this?"

	Death system? i.e. going into the "bin"
		Why do people kill IRL?
			The breed is everything to them eg ridgeback.
				They don't want unridged ridgebacks to exist; don't want to admit it's possible?
				They don't want people mistaking unridged ridgebacks for ridgebacks. Over time that might make the ridge be bred away
				They don't want it
			Because the dog is in pain
				The pain may or may not have been avoidable
				"I'd rather it not end up in the hands of dog fighters" was what that woman said, i.e. "I don't want this, and nor shall anyone else"
					i.e., mongrels usually die! Another reason to go for incest
			If it is in enough pain, nobody wants it
	How it affects utility
		Could have it be that everything outside the breed is killed, decreasing utility
		Mongrels create suffering as they must be killed at the end.
		This is a kind of suffering that breeders are fine creating, that is the point
		This is dubious because not all mongrels are killed. But they are a nuisance for breeders
		Have a few puzzles where you avoid making mongrels. 

	Genotype system
		Two individuals can have same genotype but different phenotype, but not other way around
			- except for the intervention system!
		Mendelian genetics
			Mating two individuals of a certain relatedness level increases genetic disease probability in a certain way. Try to replicate that graph
			Two arrays of booleans, one dominant and one recessive
			So the genes are either something you want or they're timebombs?
				Probably no, probably you do want "genes you don't care about" eg so long as coat is sleek colour is irrelevant
			Is "exaggeration" possible in this context?
			We could say all that the dominant version of this gene does is stop the recessive one from appearing
			Perhaps you can take a recessive trait you want, breed it such that it disappears but keep in your head that it is in this individual

	Phenotype system
		You have at least one number between 0 and 1, why not others?
			Can be interpreted geometrically
			Can have something like: 3 genes affect this number, that gives you 8 possible values
		Wolves should be somewhere in phenotype space. Anything to be made of this?
			Between them they had all genes that you seen now (?), it's just that they averaged out
		"Aesthetics" are another mapping from indviduality space
		Stripes of different widths and colors, angles?
		Overlapping sets of waves, some angle. Can get spots with this.
		Suffering (expressed facially)
			Number between 0 and 1
				0.1 = neutral. > 0.1 = unhappy. A system biased towards pain, because congenital deformations are really no good
			Divergence of eyes is a hallmark of inbreeding, haha
			Make a utility function taking in all the pain
				They could have done that with Parable of the polygons... didn't need to... it was intuitive. Also, not part of puzzles
			This "hack" to get rid of all the bad genes
				Those mice, are we positive they'll never go bad
				Is that ok then? =/

	Breed recognition system
		"Breeds" can be close together -> this business about floppy ears
		The dichotomy of the two things that are done IRL
			Stud book
				Closed vs open
				If some individuals in the original stud book had a recessive problem, there's your problem
				Basically the stud book had a bunch of individuals close to the exemplar
				You could breed in the stud book with the intention of getting something that looked nothing like the exemplar
			Phenotype recognition
				When the stud book was originally written surely they were looking at phenotype
				Euclidean distance from the exemplar phenotype (whether that is a corner on a binary cube or a point in I^n)
					There's probably a PhD in the "metric space of breeds"
					Breeds do not overlap therefore rank their distance
				Edges of phenotype space.
				Eventually, when we do our nice corrections, it takes welfare into account
		"Drift" happens, and this is a major part of it, eg original pug folks would be amazed at modern pug
			Makes a mockery of the idea of breed
			Exaggeration should be possible.
				Especially mocks "breed" - exemplifies phenotype, follows the most-closed stud book rules, but would revolt original breeders
			The books don't, and can't, and would be a bit daft to try, to say everything about the phenotype, eg correct number of kidneys
				Hence the possibility for drift, and for suffering
		In solution proposition, suffering is taken account of as a thing that affects classification

	Automated mating systems
		No need for a graph of the suffering and death, you can just see it
		State of nature / chaotic
			We see that it is BETTER than everything being used to make specific breeds
			But you get the most genetic diversity if you aim for it
			They would all homogenize as wolves?!
			The equivalent of manual killing happens automatically
			Obviously many dog breeds would die out
		Automated Kennel club
			Just breed within breed, maybe kill some
			Sounds pretty bad - but good to check with an open mind!
			Lots of killing
			Lots of intervention
			Some of them are only within the breed
			Some of them allow the possibility of mongrels
				Which they then kill
		Phenotype similarity + welfare awareness
			We still get many beautiful things
			Many breeds can continue to exist
			But some must go forever? By definition? Only if you can directly intervene in the genotype (and know what you're doing
		Genotype awareness
			Can get amazing new things? Maybe specify a phenotype yourself?
		Chaos + size awareness
			Take one of the phenotypic traits, divide it up, see what happens
			Hey, surely you allow guide dogs to be bred? Or is that unnecessary?
		Chaos with purebreds illegal, hehe, see if that's a good idea.

	Display system
		Have them on a grid? It's kind of a way of saying "the geometry of the situation doesn't matter"
		Family tree?
		Drag them over, make them overlap, there is some indication that if you let go a breed shall occur
		They jump back to previous location so stud set can encompass them
		Display their genotype somehow? Like, that's what we can do today!
		Individuals that are close to being in a stud book should be near to it? Introduces geometry...
		Breed could just be little crowns
		Drag individual around, their whole breed could come with them.
		Facial expression
			Easy to curve the smile a variable amount
			Have color too so it's super easy to see the pain concentration of a population in the simulations

	Gameplay
		Goals
			1. "Make this specific phenotype" (very few starting individuals)
				Phenotype is NOT necessarily the same thing as breed. But could make it so early on
			2. "Make something while keeping in this closed stud book"
			3. "Make this specific phenotype while being aware of pain somehow"
		An argument in your puzzles:
			Aiming for phenotype at least makes some sense
			Aiming for keeping-within-studbook leads to drift. Also pain.
		Determinism?
			Could give a litter of a mendelian 4 every time?
				Or mendelian 3
			Chance is involved IRL
			Can give "undo", which lets you thwart chance. This is ok, you at least know it is there and can see it with automated ones
			No need to "undo" when you can mate twice. Your area might get cluttered though
			Try it both ways - random vs all crosses
		Yeah, you should cause all possible mendelian crosses to be born, as that is what you "risk" when you mate
			You'd have to not do this when evolving, because that would create weird incentives
			Do not want people to get lucky and solve a puzzle. Do not want people to get unlucky and find they never can.
		Major strategy: breed a dog purely to find out if it has some nasty gene/
*/

/*
	Order in which things are introduced
		Dogs, breeding (level 1)
		Phenotypic features (genotype is later, initially phenotype tells you all)
		"Breeds" (but not as implemented in stud book)
			Intervention?
		Stud books
		Closed stud books
		Suffering (everything prior has had no recessive problems)
			Death?
		Genotype visualization?

	TODO
		Make display systems for it all,
			Face
			Phenotype
			Breeds
		Then "drafts" of the systems
		Then send to some specialist. Then revise possibly
		Implement goals
		Implement levels
*/

function initDogGame()
{
	function MakeDog()
	{
		var dog = new THREE.Mesh(
			new THREE.CircleGeometry(0.1,16),
			new THREE.MeshBasicMaterial({
			}));
		dog.position.z = -10;
		scene.add(dog);
		bestowDefaultMouseDragProperties(dog)

		return dog;
	}

	var dogs = [];
	var fieldDimension = 0.8;
	for(var i = 0; i < 5; i++)
	{
		dogs[i] = MakeDog();
		dogs[i].material.color.setRGB(Math.random(),Math.random(),Math.random());
		dogs[i].position.x = (Math.random()-0.5)*fieldDimension;
		dogs[i].position.y = (Math.random()-0.5)*fieldDimension;
	}
}
/*
	n = number of sets

	Philosophy
		All things are quantitative and based on thresholds of metrics
		"Oh but this particular metric requires blah and blah and blah"
		Ok, then make them be other aspects of the diagram

	The probability-smooshing is now interesting.
	If the things are all independent you just move the cutting hyperplanes (=arcs on the poincare disc)?

	If you think some regions should be bigger than other (you probably do) that's a judgement about probability

	That thing with the 16D cube, really it just needed to traverse a venn diagram
	State probabilities of crossing each edge. Allows you to make predictions about ways to traverse the whole thing

	Play a chess like game: in a cell, you can cross one edge at a time
	Would allow you to visualize any binary operation

	You should probably get instagram

	So 2^n n-gons, 4 to a vertex. A given set is half of them
	The dual is a graph of 2^n vertices with all vertices of degree 4
	Corresponds to the corners of an n-cube. Makes sense for tesseract, can look a bit like a torus. Seems a little surprising
	Might be able to visualize this "doubling" = "adding another set" = "connecting to another cube" easily
		3	Octahedron
		4	torus with 16 vertices
		5	32 pentagons
	Could use beltrami-klein to make it look like a sphere
	And it would have some realization as a genus-whatever surface. As before, would be nice to find mapping.
		Probably something about pants decompositions
		Would be great if this mapping preserved the sets as circles, kinda like poincare disc. Torus does this
	There's something going on with cycles.
		gain property 1, gain property 2, ... erty n, got all properties, lose property 1, lose property 2, ... lose
		for any arrangement, there exists a cycle that will gain or lose you them in that order?
		Yes, and those cycles stick around for higher dimensions, just as the 4cube contains 3cubes
		From now you're likely to end up interpreting geometric results in this funny way
	How sure are we that this generalizes to arbitrary n? Surely does because you're allowed to identify stuff however you like, even if it does make singularities
	Shouldn't be too hard to get the gluing

	No google scholar results for "32 pentagons" or "64 hexagons" so maybe this is novel?

	You can count on these things, interpret the bit as a number
*/

function initVenn()
{

}
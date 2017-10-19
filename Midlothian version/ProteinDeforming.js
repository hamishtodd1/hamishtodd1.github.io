/*
 * FUCK IT THEY CAN ONLY GRAB THEM IF THEY'RE CLOSE
 * 
 * The situation is: the player has grabbed AA1 and AA2, potentially very far apart
 * The AA's you're holding should
 * it is unintuitive to have it be the case that the order in which you put your hands on it affects too much
 * One hand movement should always have one effect, probably
 * You could do it depending on which hand stays in place
 * Nitrogen atoms are the beginnings and ends of your proteins. Arbitrary philosophical decision. At least there's symmetry to it
 * 
 * pull it hard and eventually alpha helices unravel
 * This is inverse kinematics stuff.
 * If the two AAs you're holding have their beginning and ending Ns in the same place, the stuff between is unchanged
 * If it's POSSIBLE to have a movement that only twists one, only twist one.
 * Could say: 
 * 	 We check the adjacents. 
 * 	 Whichever angle of the intermediate cluster will make those adjacents closest to their starting angle, we go with that angle
 * 
 * There is some interaction that is like this
 * 
 * Length change introduces a huge number of problems, you may want to put it off.
 * 		way of putting it off: just scale the intermediate. Though that might screw up the ribbon drawer
 * 		Or rigidly keep it the same size, keeping an imaginary line between the critical Ns
 * 			If the hand moves down or up the line, a blob representing the virtual location of the N is kept
 * 			And a ghost version of the controller is there too
 * 
 * This will all cause things to pass through each other unless you have rigid body dynamics.
 * But maybe it's nice to leave that to the user? Temporary self intersections would let them get to the state they want faster
 * 
 * So when you grip it, a "ghost hand" object is created
 * 	it keeps rotation of your hand
 * 
 * Alternatives to "update representation every frame":
 * 	-only update AAs that have changed
 * 	-butcher it while player is moving, update entirely when they let go
 * For every vertex in the thing, check which amino acid it comes from.
 * Alexander's thing is probably fast, but
 * You want to avoid digging into his code
 * Could use his for the surface and do your own ribbon URGH
 * Well, you can use what you have for thingy
 * Look don't worry, it's just a geometry, you understand that
 * 
 * Remember the "intuitive physics", does that conflict with what you're thinking now?
 * Yes. You want something inbetween "floating seaweed" and "rigid wire"
 * 
 * You could at least do the side-by-side AA thing
 * 
 * Note that you can already do docking
 * 
 * 
 * stage.loadFile("file.pdb").then(function(comp){
  comp.addRepresentation("cartoon");
  comp.structure.updatePositions([x1,y1,z1,x2,y2,z2,...,xN,yN,zN]);
  comp.updateRepresentations({"position": true});
});
 */
//until proven otherwise this is a bit dumb, you were inside the coot box where screen space is hard to come by

function initDisplayManager()
{
	addModelDisplayManager = function(model)
	{
		let newMenu = MenuOnPanel([
			{string:"	Model"},
			{string:"	Whole visible", 	switchObject:	model, 				switchProperty:"visible"},
			])
	}

	let unused = ["Display manager", //master switches needed for all
	"	Map",
	"		Delete",
	"		Active for refinement",
	"		Active for contour scrolls",
	"		Color",// color wheel
	"		Sample rate",
	"	Molecule",
	"		Show symmetry atoms",
	"		Active for undo",
	"		Active for new atoms and chains",
	"		Carbon color",// color wheel
	"		Display methods",
	"			Bond radius",
	"			atom radiuse",
	"			cAlpha only",
	"			Hydrogens visible",
	"			Waters visible",
	"			Color by",
	"				B factors / occupancy / other metric",
	"				Chain",
	"				Atom (default)",
	"				amino acid (i.e. rainbow)"]
}
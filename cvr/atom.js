var elementToNumber = {
		C: 0,
		S: 1,
		O: 2,
		N: 3,
		CL:4, //ask Paul about this
		Q:5,
		P: 6,
		H: 9,
}
var numberToElement = [
		"C",
		"S",
		"O",
		"N",
		"CL", //ask Paul about this
		"Q",
		"P",
		"Q",
		"Q",
		"H"
]

let chainIds = "CDEFGHIJKLMNOPQRSTUVWXYZ"
let lastChainId = "B"
let chainId = chainIds[chainIds.indexOf(lastChainId)+1]

function Atom(element,position,imol,chainId,resNo,insertionCode,name,altloc, occupancyAndTemperatureFactor)
{
	this.position = position;

	this.selected = false;

	this.bondPartners = [];
	this.bondFirstVertexIndices = [];

	this.extraBondPartners = [];
	this.extraBondFirstVertexIndices = [];

	if(occupancyAndTemperatureFactor === undefined)
	{
		occupancyAndTemperatureFactor = "  1.00 30.00           "
	}
	this.occupancyAndTemperatureFactor = occupancyAndTemperatureFactor

	this.imol = imol;
	this.chainId = chainId || "A";
	this.resNo = resNo;
	this.insertionCode = insertionCode;
	this.name = name;
	this.altloc = altloc; //TODO never had owt here, it's probably another vector so needs to be cloned below

	if(typeof element === "number") //there are a lot of these things, best to keep it as a number
	{
		this.element = element;
	}
	else
	{
		this.element = elementToNumber[ element ];
	}

	if(this.element === undefined)
	{
		console.error("unrecognized element: ", element)
	}
}

Atom.prototype.clone = function()
{
	return new Atom(this.element,this.position.clone(),this.imol,this.chainId,this.resNo,this.insertionCode,this.name,this.altloc,this.occupancyAndTemperatureFactor)
}

Atom.prototype.assignResidueSpecToMessage = function(msg)
{
	msg.imol = this.imol;
	msg.chainId = this.chainId;
	msg.resNo = this.resNo;
	msg.insertionCode = this.insertionCode;
}
Atom.prototype.assignAtomSpecToObject = function(msg)
{
	this.assignResidueSpecToMessage(msg)	
	msg.name = this.name;
	msg.altloc = this.altloc;
}

Atom.prototype.setLabelVisibility = function(labelVisibility)
{
	if( this.label === undefined && labelVisibility)
	{
		var labelString = "";
		labelString += this.imol + ",";
		labelString += this.chainId + ",";
		labelString += this.resNo + ",";
		labelString += this.insertionCode + ",";
		labelString += this.name + ",";
		labelString += this.altloc + ",";

		this.label = makeTextSign(labelString);
		this.label.position.copy(this.position);
		this.label.update = function()
		{
			this.scale.setScalar( 0.06 * Math.sqrt(this.position.distanceTo(camera.position)));
			
			this.parent.updateMatrixWorld()
			
			camera.updateMatrix();
			var cameraUp = yVector.clone().applyQuaternion(camera.quaternion);
			var parentWorldPosition = new THREE.Vector3();
			this.parent.getWorldPosition(parentWorldPosition);
			cameraUp.add(parentWorldPosition)
			this.parent.worldToLocal(cameraUp)
			this.up.copy(cameraUp);

			var localCameraPosition = camera.position.clone()
			this.parent.worldToLocal(localCameraPosition);
			this.lookAt(localCameraPosition);
		};

		var model = getModelWithImol(this.imol);
		model.add( this.label );
		objectsToBeUpdated.push(this.label.update);
	}
	
	if(this.label !== undefined)
	{
		this.label.visible = labelVisibility;
	}
}
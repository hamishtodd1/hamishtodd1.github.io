/*
	Reserved words
		Arrow creating
			"Therefore"
			Probably
			So

	More tech
		https://www.google.com/intl/en/chrome/demos/speech.html
*/

let generalPadding = .1

async function init()
{
	let recognition = initRecognition()

	recognition.start();

	recognition.onresult = function(event)
	{
		var lastResult = event.results[event.results.length - 1];
		var transcript = lastResult[0].transcript;

		if(transcriptionSign !== null)
		{
			transcriptionSign.setText(transcriptionSign.currentText + transcript)
		}
	}

	let ctrlObject = bindButton("ctrl")

	let cylGeometry = CylinderBufferGeometryUncentered(.1, 1., 16, true)
	let cylMat = new THREE.MeshBasicMaterial()

	let currentCylinder = null

	let newStatementButton = makeTextSign("New Statement")
	scene.add(newStatementButton)
	newStatementButton.position.y = camera.topAtZZero - newStatementButton.scale.y * .5 - .1
	clickables.push(newStatementButton)
	newStatementButton.onClick = function()
	{
		let newSign = makeTextSign("")
		newSign.scale.multiplyScalar(.7)
		newSign.material.side = THREE.DoubleSide
		newSign.castShadow = true
		scene.add(newSign)
		transcriptionSign = newSign

		clickables.push(newSign)
		newSign.onClick = function()
		{
			if(!ctrlObject.down)
				transcriptionSign = this
			else
			{
				let newCylinder = new THREE.Mesh(cylGeometry)
				newCylinder.position.copy(newSign.position)
				scene.add(newCylinder)

				currentCylinder = newCylinder
			}
		}
	}

	let transcriptionSign = null
	updateFunctions.push(function()
	{
		if( !mouse.clicking )
		{
			transcriptionSign = null
			currentCylinder = null
		}

		if(transcriptionSign !== null)
		{
			transcriptionSign.position.copy(mouse.zZeroPosition)
		}

		if(currentCylinder !== null)
		{
			let vec = mouse.zZeroPosition.clone().sub(currentCylinder.position)
			let len = vec.length()
			currentCylinder.scale.y = len === 0. ? .000001 : len
			currentCylinder.rotation.z = Math.atan2(vec.y,vec.x) - TAU / 4.
		}
	})
}

function initRecognition()
{
	var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition
	var SpeechGrammarList = SpeechGrammarList || webkitSpeechGrammarList
	var SpeechRecognitionEvent = SpeechRecognitionEvent || webkitSpeechRecognitionEvent

	var colors = [ 'aqua' , 'azure' , 'beige', 'bisque', 'black', 'blue', 'brown', 'chocolate', 'coral', 'crimson', 'cyan', 'fuchsia', 'ghostwhite', 'gold', 'goldenrod', 'gray', 'green', 'indigo', 'ivory', 'khaki', 'lavender', 'lime', 'linen', 'magenta', 'maroon', 'moccasin', 'navy', 'olive', 'orange', 'orchid', 'peru', 'pink', 'plum', 'purple', 'red', 'salmon', 'sienna', 'silver', 'snow', 'tan', 'teal', 'thistle', 'tomato', 'turquoise', 'violet', 'white', 'yellow'];
	var grammar = '#JSGF V1.0; grammar colors; public <color> = ' + colors.join(' | ') + ' ;'

	var recognition = new SpeechRecognition();
	var speechRecognitionList = new SpeechGrammarList();
	speechRecognitionList.addFromString(grammar, 1);
	recognition.grammars = speechRecognitionList;
	recognition.continuous = true;
	recognition.lang = 'en-UK';
	recognition.interimResults = false;
	recognition.maxAlternatives = 1;

	var diagnostic = document.querySelector('.output');

	recognition.onerror = function(event)
	{
		log('Error occurred in recognition: ' + event.error)
	}

	return recognition
}
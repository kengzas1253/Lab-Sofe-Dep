const classifier = knnClassifier.create();
const webcamElement = document.querySelector('#webcam');
const button = document.querySelector('#button');
const select = document.querySelector('#select');

let currentStream;

function stopMediaTracks(stream) {
  stream.getTracks().forEach(track => {
	track.stop();
  });
}

function gotDevices(mediaDevices) {
  select.innerHTML = '';
  select.appendChild(document.createElement('option'));
  let count = 1;
  mediaDevices.forEach(mediaDevice => {
	if (mediaDevice.kind === 'videoinput') {
  	const option = document.createElement('option');
  	option.value = mediaDevice.deviceId;
  	const label = mediaDevice.label || `Camera ${count++}`;
  	const textNode = document.createTextNode(label);
  	option.appendChild(textNode);
  	select.appendChild(option);
	}
  });
}

button.addEventListener('click', event => {
  if (typeof currentStream !== 'undefined') {
	stopMediaTracks(currentStream);
  }
  const videoConstraints = {};
  if (select.value === '') {
	videoConstraints.facingMode = 'environment';
 } else {
	videoConstraints.deviceId = { exact: select.value };
  }
  const constraints = {
	video: videoConstraints,
	audio: false
  };
  navigator.mediaDevices
	.getUserMedia(constraints)
	.then(stream => {
  	currentStream = stream;
  	webcamElement.srcObject = stream;
  	return navigator.mediaDevices.enumerateDevices();
	})
	.then(gotDevices)
	.catch(error => {
  	console.error(error);
	});
});

navigator.mediaDevices.enumerateDevices().then(gotDevices);
let net;
    
  

async function app() {
  console.log('Loading mobilenet..');
  console.log("classifier :" , classifier)
  // Load the model.
  net = await mobilenet.load();
  console.log('Sucessfully loaded model');
  if(localStorage.getItem("activation1")==undefined){
  }
  else{
    for(let i=0;i<3;i++){
      let activation = await localStorage.getItem("activation"+i);
      let classId = localStorage.getItem("classId"+i)
      let t = JSON.parse(activation)
      classifier.addExample({t}, +classId);
    }
    
  }
  
  // Reads an image from the webcam and associates it with
  // a specific class index.
  
  const addExample = classId => {
	// Get the intermediate activation of MobileNet 'conv_preds' and
	// pass that to the KNN classifier.
    const activation = net.infer(webcamElement, 'conv_preds');
    // Pass the intermediate activation to the classifier.
    localStorage.setItem("activation"+classId, JSON.stringify(activation));
    localStorage.setItem("classId"+classId, JSON.stringify(classId));
    
    classifier.addExample(activation, classId);
    
    console.log('SAVE DATA activation : ',activation);
    console.log('SAVE DATA classId :' ,classId);
    

  };
  

  // When clicking a button, add an example for that class.
  document.querySelector('#class-a').addEventListener('click', () => addExample(0));
  document.querySelector('#class-b').addEventListener('click', () => addExample(1));
  document.querySelector('#class-c').addEventListener('click', () => addExample(2));
  while (true) {
	if (classifier.getNumClasses() > 0) {
  	// Get the activation from mobilenet from the webcam.
  	const activation = net.infer(webcamElement, 'conv_preds');
// Get the most likely class and confidences from the classifier.
    
  	const result = await classifier.predictClass(activation);
    
  	const classes = ['A', 'B', 'C'];
  	document.getElementById('console').innerText = `
    	prediction: ${classes[result.classIndex]}\n
    	probability: ${result.confidences[result.classIndex]}
  	`;
    
    
	}
    

	// Give some breathing room by waiting for the next animation frame
	// to fire.
	await tf.nextFrame();
  }
}

app();
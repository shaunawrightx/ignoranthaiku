//identify variables for hand classifier/background stuff

let classifier;
let handPose;
let video;
let hands = [];
let classification = '';
let isModelLoaded = false;
let classificationDone = false;



// json words + haiku variables

let onesylword, twosylword, threesylword;
let selectedWord;

// haiku structure
let haiku =["", "", ""];
let currentLine = 0;
let syllableCount = [0,0,0];
const maxSyllables = [5, 7, 5];

let saveButton;


function preload() {

  // loading the handPose model

  handPose = ml5.handPose();

  // loading word lists 

  onesylword = loadJSON('syllable /onesyl.json');
  twosylword = loadJSON('syllable /twosyll.json');
  threesylword = loadJSON('syllable /threesyl.json');
}


function setup() {
  createCanvas(640, 480);

  // make webcam video and hide it
  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();

  // "webgl" or "cpu" set as the backend to work across browsers
  ml5.setBackend("webgl");

  // set up the neural network
  let classifierOptions = {
    task: "classification",
  };
  classifier = ml5.neuralNetwork(classifierOptions);

  // hand classifier weights : the FINGER COUNTER
  // 4th attempt at model
  const modelDetails = {
    model: "TRAINED/model.json",
    metadata: "TRAINED/model_meta.json",
    weights: "TRAINED/model.weights.bin",
  };

  classifier.load(modelDetails, modelLoaded);

  // start handPose detection
  handPose.detectStart(video, gotHands);

  textSize(32);
  textAlign(CENTER, CENTER);


   // making a button to save the canvas as PNG to downloads

   saveButton = createButton('save haiku');
   //same style as text
   saveButton.style('font-family', 'Courier');
   saveButton.position(650, 490);
   saveButton.mousePressed(saveImage);
}

function draw() {
  // mirror the webcam video
  // not necessary in final project, just easier when working on it before hdiing
  push();
  translate(width, 0);
  scale(-1, 1);
  image(video, 0, 0, width, height);
  pop();

  // when the model is loaded, make a classification and display the result
  if (isModelLoaded && hands.length > 0 && !classificationDone) {
    let inputData = flattenHandData();
    classifier.classify(inputData, gotClassification);
  }
  
displayHaiku();
displaySyllableCount();
}


// convert the handPose data to a 1D array
function flattenHandData() {
  let hand = hands[0];
  let handData = [];
  for (let i = 0; i < hand.keypoints.length; i++) {
    let keypoint = hand.keypoints[i];
    handData.push(keypoint.x);
    handData.push(keypoint.y);
  }
  return handData;
}

// callback function for when handPose outputs data
function gotHands(results) {
  hands = results;
}
// callback function for when the classifier makes a classification
function gotClassification(results) {
  classification = results[0].label;
  pickWord(classification);

  console.log(classification);

  // set the flag to true to stop further classifications
  classificationDone = true;

  // reset the flag after a second to allow new classifications
  setTimeout(() => {
    classificationDone = false;
  }, 1000);
}
// callback function for when the pre-trained model is loaded
function modelLoaded() {
  isModelLoaded = true;
}


// selecting random word depending on classification
function pickWord(classification) {
  let syllables = 0;

  if (classification === "1") {
    console.log(onesylword);
    selectedWord = getRandomWord(onesylword);
    syllables = 1;
  } else if (classification === "2") {
    console.log(twosylword);
    selectedWord = getRandomWord(twosylword);
    syllables = 2;
  } else if (classification === "3") {
    console.log(threesylword);
    selectedWord = getRandomWord(threesylword);
    syllables = 3;
  }


  if (selectedWord && currentLine < haiku.length) {
    //if the count is less than 5-7-5, add next word and increase cumulative count
    if (syllableCount[currentLine] + syllables <= maxSyllables[currentLine]) {
      haiku[currentLine] += selectedWord + " ";
      syllableCount[currentLine] += syllables;
    }
    if (syllableCount[currentLine] === maxSyllables[currentLine]) {
      currentLine++;
    }
    }
  }


//random word from multiple word types (nouns, verbs, adjectives) in the JSONs

function getRandomWord(wordJson) {
   //pick catagory
  const categories = ['nouns', 'adjectives', 'verbs'];
  const randomCategory = categories[floor(random(categories.length))];
  
  // random word from the chosen word type
  const randomArray = wordJson[randomCategory];
  const randomWord = randomArray[floor(random(randomArray.length))];
  return randomWord;
}


// show word in haiku structure
function displayHaiku() {
  background(220);
  let haikuText = (haiku.join("\n")).toLowerCase();

  // text styling
  text(haikuText, width / 2, height / 2);
  textSize(20);
 fill(0, 0, 0);
 //font: coding + typewriter style crossover
 textFont("Courier");

}

// count fraction in corner to know possible word count remaining
function displaySyllableCount() {
  
  textSize(16);
  fill(0);

  //only shows count while still building haiku, 
  //then disappears so not in saved image of completed
  if (currentLine !== 3) {
    text(`${syllableCount[currentLine]}/${maxSyllables[currentLine]}`, 20, 10);
  }
}

//save image button

function saveImage() {
  saveCanvas('haiku', 'png');
}


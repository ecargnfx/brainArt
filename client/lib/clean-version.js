var brainData; 
// eeg
var el1; 
var el2; 
var er1; 
var er2; 
// alpha 
var al1; 
var al2; 
var ar1; 
var ar2; 
// alpha colors
var aR;
var aG;
var aB;
var aX; 

var EEG = function(dataArray) {
  // data = [0, 1, .2, .3];
  el1 = dataArray[0];
  el2 = dataArray[1];
  er1 = dataArray[2];
  er2 = dataArray[3];
};

var Alpha = function(dataArray) {
  // data = [0, 1, .2, .3];
  al1 = dataArray[0];
  al2 = dataArray[1];
  ar1 = dataArray[2];
  ar2 = dataArray[3];
};

  
function setup() {
  createCanvas(windowWidth, windowHeight);

  socket.on('/muse/eeg', function(data){

    brainData = new EEG(data.values);
    console.log(data.values)
  });

  socket.on('/muse/elements/alpha_session_score', function (data){

    brainData = new Alpha(data.values); // look inside data for values, grabs array 

  });   
}

function draw() {
  background(200); 
  
  // eegBez(aR, aG, aB, aX);
  alphaCol();
  // ellipse(width/2,height/2,al1/10,ar2/10)
  // bezier(0,height/2, al1*width, al2*height, ar1*width, ar2*height, width, height/2);
  // console.log(al1,al2,ar1,ar2)
}



var eegBez = function(r,g,b,x){
  aX1 = map(el1, 0, 1682, 0, width);
  aY1 = map(el2, 0, 1682, 0, height);
  aX2 = map(er1, 0, 1682, 0, width);
  aY2 = map(er2, 0, 1682, 0, height);
  noFill();
  strokeWeight(5);
  stroke(r,g,b,x);
  bezier(0,height/2, aX1, aY1, aX2, aY2, width, height/2); 
  alpha(r,g,b,x);
}
  
var alphaCol = function(){
  aR = map(al1, 0, 1, 0, 255);
  aG = map(al2, 0, 1, 0, 255);
  aB = map(ar1, 0, 1, 0, 255);
  aX = map(ar2, 0, 1, 0, 100); 
  var c = color(aR, aG, aB, aX);
  fill(c);
  ellipse(width/2,height/2,100,100);
}  
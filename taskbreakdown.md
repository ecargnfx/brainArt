var gui;
 

var EEG = function(dataArray) {
  // data = [0, 1, .2, .3];
  this.Alpha = dataArray[0];
  this.Beta = dataArray[1];
  this.Delta = dataArray[2];
  this.Theta = dataArray[3];
};

var alphaEvent = function(brainData){
  gui = new dat.GUI();
  var brainData;

  socket.on('/muse/elements/alpha_session_score', function (data){

    var alphaData = new EEG(data.values); // look inside data for values, grabs array
    brainData = alphaData;

    // data can be accessed here but repeatedly calls gui on every event
    // console.log(brainData.Alpha)

  });  

  gui.add(brainData, 'Alpha',0,1);
  console.log(brainData.Alpha)


}

  
function setup() {
  createCanvas(windowWidth, windowHeight);
  alphaEvent();
  // brainData = new EEG();
  
  // var folder = gui.addFolder('Data');
  // folder.add(brainData, 'Alpha',0,1);
  

  
  // gui.add(brainData, 'Alpha',0,1);
  // console.log(brainData.Alpha)
  
}

function draw() {
  background(200);
  a = map(brainData.Alpha, 0, 1, 10, 255);
  drawCircle(width/2,height/2,a,a);
}

function drawCircle(x,y,d,d){
  
  noFill();
  ellipse(x,y,d,d);
  // console.log(d);
  if (d > 10){
    drawCircle(x+d/2,y,d/2,d/2);
    // drawCircle(x-d/2,y,d/2,d/2);
    // drawCircle(x,y+d/2,d/2,d/2);
    // drawCircle(x,y-d/2,d/2,d/2);
  };
  
  
};



5 Parameters
- Speed


what I have now:
- ability to change visual with dat.gui
- ability to randomize counter between range 




when we get data from path, run function that sets table value

setTableValue holds path name and object for key value


map data.value range of 0-1 to 0-255 

5 parameters, store data.path in the 5 parameters 

create gui slider with 5 sliders
each slider has range from 0-1







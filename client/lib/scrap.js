// Q: should this be window.location?
var serverUrl = window.location.href;
var socket = io.connect(serverUrl);

// 3D 
var camera, scene, renderer, material, smaterial, geometry, sgeometry, originalgGeometry, alphaGeo, alphaMat;
var objectMaterial1, objectMaterial2;
var gui, guiControl, object
var mobile = false;
var texture
var Alpha;
var mappedAlpha2 = 0;
var mappedAlpha3 = 0;
var mouseX = 0, mouseY = 0;
var alphaData

init();
setup();

function reset(){
  recordState = 0;
//  console.log("reset success")
}


function mousemove(e) {
    mouseX = e.clientX - window.innerWidth / 2
    mouseY = e.clientY - window.innerHeight / 2
}

function map_range(value, low1, high1, low2, high2) {
    return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
};

function remove(object) {
    scene.remove(object)
}

function init() {
    // renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio((window.devicePixelRatio) ? window.devicePixelRatio : 1);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.autoClear = false;
    renderer.setClearColor(0x000000, 0.0);
    document.body.appendChild(renderer.domElement);
    // scene
    scene = new THREE.Scene();
    // camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.x = 10;
    camera.position.y = 1;
    camera.position.z = 8;
    camera.lookAt(scene.position);
    // controls
    controls = new THREE.OrbitControls(camera);
    // controls.autoRotate = true;
    if (WEBVR.isAvailable() === true) {
        controls = new THREE.VRControls(camera);
        controls.standing = false;
        renderer = new THREE.VREffect(renderer);
        document.body.appendChild(WEBVR.getButton(renderer));
    }
    // events
    window.addEventListener('deviceorientation', setOrientationControls, true);
    window.addEventListener('resize', onWindowResize, false);
    // window.addEventListener('mousemove', mousemove, false);
    window.addEventListener('mousemove', changeBrush, false);
}

function setup() {

    // grab brain data
    Alpha = function(dataArray) {
      this.al1 = dataArray[0];
      this.al2 = dataArray[1];
      this.ar1 = dataArray[2];
      this.ar2 = dataArray[3];
    }; 
    Beta = function(dataArray) {
      this.al1 = dataArray[0];
      this.al2 = dataArray[1];
      this.ar1 = dataArray[2];
      this.ar2 = dataArray[3];
    }; 
    Delta = function(dataArray) {
      this.al1 = dataArray[0];
      this.al2 = dataArray[1];
      this.ar1 = dataArray[2];
      this.ar2 = dataArray[3];
    }; 
    Gamma = function(dataArray) {
      this.al1 = dataArray[0];
      this.al2 = dataArray[1];
      this.ar1 = dataArray[2];
      this.ar2 = dataArray[3];
    }; 
    Theta = function(dataArray) {
      this.al1 = dataArray[0];
      this.al2 = dataArray[1];
      this.ar1 = dataArray[2];
      this.ar2 = dataArray[3];
    }; 





    objectMaterial1 = new THREE.MeshStandardMaterial({

        shading: THREE.FlatShading,
        side: THREE.DoubleSide,
        transparent: true
    });
    objectMaterial2 = new THREE.MeshStandardMaterial({

        shading: THREE.SmoothShading,
        side: THREE.DoubleSide,
        wireframe: true,
        transparent: true
    });

    // cubes
    // SHADER

    uniforms1 = {
      time:       { value: 1.0 },
      resolution: { value: new THREE.Vector2() }
    };
    
    uniforms2 = {
      time:       { value: 4.0 },
      resolution: { value: new THREE.Vector2() },
      texture:    { value: new THREE.TextureLoader().load( "assets/textures/bluecloud.jpg" ) }
    };

    uniforms2.texture.value.wrapS = uniforms2.texture.value.wrapT = THREE.RepeatWrapping;


    // var params = [
    //   [ 'fragment_shader1', uniforms1 ]
    // ];
    var vShader = $('#vertexShader');
    var fShader = $('#fragment_shader1');
    
    alphaGeo = new THREE.TetrahedronGeometry(.1, 5) //sphere
    betaGeo = new THREE.TorusKnotGeometry( .1, .5, 5, 6, 4, 6 ) //knot
    deltaGeo = new THREE.TorusKnotGeometry( .1, .5, 5, 6, 1, 1 ) //loop
    thetaGeo = new THREE.TorusKnotGeometry( .1, .5, 5, 6, 7, 6 ) //flower
    gammaGeo = new THREE.TetrahedronGeometry(.1, 0) //triangle

    shaderMat = new THREE.ShaderMaterial( {
      // uniforms: params[ 0 ][ 1 ],
      vertexShader:   vShader.text(),
      fragmentShader: fShader.text()
    } );
    
  
                 
    // object
    var sgeometry = new THREE.TorusKnotGeometry(1.4, 0.55, 100, 16, mappedAlpha2, mappedAlpha3);
    // originalgGeometry = new THREE.TorusKnotGeometry(1.4, 0.55, 100, 16, mappedAlpha2, mappedAlpha3);
    object = new THREE.Mesh(sgeometry, objectMaterial1);
    // scene.add(object);



    // Helpers
    var axis = new THREE.AxisHelper(10);
    // scene.add(axis);

    // light
    var ambientLight = new THREE.AmbientLight(0x9281D1 );
    scene.add(ambientLight);

    var lights = [];
    lights[0] = new THREE.DirectionalLight( 0xf4d3c4, 1 );
    lights[0].position.set( 3, 0, 0 );
    lights[1] = new THREE.DirectionalLight( 0x11B9E8, 1 );
    lights[1].position.set( 1.75, 3, 0.5 );
    lights[2] = new THREE.DirectionalLight( 0x8a00C9, 1 );
    lights[2].position.set( -1.75, -2, 0.5 );
    scene.add( lights[0] );
    scene.add( lights[1] );
    scene.add( lights[2] );
} 

function changeBrush(e) {


    if (Math.random() > .3)
        return;
    var sphere = new THREE.Mesh(alphaGeo, objectMaterial1)

    console.log(e.clientX, window.innerWidth, e.clientX - window.innerWidth / 2)

    var pos = {
        x: mouseX,
        y: -e.clientY + window.innerHeight / 2
    }

    if (alphaData.ar1 <= .5) {
      sphere.position.set(pos.x / 100, pos.y / 100, 0)
      sphere.rotation.set(Math.random(), Math.random(), Math.random())
      sphere.scale.set(alphaData.ar1 * 2 + 1, alphaData.ar1 * 2 + 1, alphaData.ar1 * 2 + 1)   
      sphere.material.color = new THREE.Color(0xFF0000);   
    } 
    else{
      sphere.position.set(pos.x / 100, pos.y / 100, 0)
      sphere.rotation.set(Math.random(), Math.random(), Math.random())
      sphere.scale.set(alphaData.ar1 * 2 + 1, alphaData.ar1 * 2 + 1, alphaData.ar1 * 2 + 1)  
      sphere.material.color = new THREE.Color(0xFFff00);     
    };


    
    console.log("alpha " + alphaData.al2,alphaData.ar1,alphaData.al1)

    scene.add( sphere);
}

var num = 0
var time = 0; // used for shimmer

var lastTime = performance.now(), //  
    threshold = 1000 / 60; // 1/60 seconds

socket.on('/muse/acc', function (data){
  var accFB = data.values[0];
  var accUD = data.values[1];
  var accLR = data.values[2];

  // var mappedAcc = map_range(alphaData.ar2, 0, 1, 0, 19.5);
  // camera
  camera.position.x = (mouseX - camera.position.x) * 0.02;
  // console.log(accLR)
  // console.log(camera.position.x)
  camera.position.y = (-mouseY - camera.position.y) * 0.02;
  // camera.position.z = (-accFB - camera.position.z) * 0.02;
  
  camera.lookAt(scene.position)  
});

var map  = new THREE.TextureLoader().load("assets/textures/white-fur-texture.jpg");

// CREATE data obj (Q: is it the same as var dataObject?)
function createThreeObj(passData, sgeometry){
  return {
    geometry: sgeometry,
    material: objectMaterial1,
    // material: {
    //   color: 0xffffff,
    //   shading: THREE.SmoothShading,
    //   side: THREE.DoubleSide,
    //   wireframe: true,
    //   transparent: true
    //   texture: {
    //     img: 'INSERT AN IMAGE HERE'
    //   },
    // }    
  };
}

// SAVE obj to DB by POSTing to node.js server with data I want saved    
function save(threejsObj){
  $.post( window.location.origin, threejsObj, function(data){
    // console.log(data);
  });  
}

var threejsObj = {
    // geometry: sgeometry,
    material: objectMaterial1,
}

// reconstitute obj from db
// getData(threejsObj);

var objectRequest = {
  getBy: 'most recent time stamp'
}

getData(objectRequest);

function getData(requestObject){
  $.get(serverUrl, requestObject, function(data){
    // what does data look like
    // make an obj variable from data
    // var texture = new THREE.TextureLoader().load(obj.material.texture.img); 
  //   var geometry = new THREE.TorusKnotGeometry(1.4, 0.55, 100, 16, mappedAlpha2, mappedAlpha3);
  //   var material = new THREE.MeshStandardMaterial({
  //     shading: THREE.FlatShading,
  //     side: THREE.DoubleSide
  //   });
  //   new THREE.Mesh(geometry, material);
  }, 'json');
}

socket.on('/muse/elements/alpha_session_score', function (data){

  // COMMENT THIS LINE FOR DYNAMIC DATA 
  // var data = dataFixture;
  
  var nextTime = performance.now();
  var lag = (nextTime - lastTime);
  

  // console.log(nextTime, ":", data.values[0])

  // checks time elapsed between last time and next time. If lag >= 1/60 second, then run function.
  if (lag >= threshold) {

    // reset lastTime
    lastTime = nextTime;

    alphaData = new Alpha(data.values); // look inside data for values, grabs array 

    var mappedAlpha2 = map_range(alphaData.ar2, 0, 1, 0, 19.5);      
    var mappedAlpha3 = map_range(alphaData.al1, 0, 1, 0, 19.5); //works

    // if (mappedAlpha2 < 10) {
    //   var sgeometry = new THREE.TorusKnotGeometry(1.4, 0.55, 100, 16, 15, 15);
    //   object.material.color = new THREE.Color(0xFF0000);
    //   // originalgGeometry = new THREE.TorusKnotGeometry(1.4, 0.55, 100, 16, mappedAlpha2, mappedAlpha3);
    //   object.geometry = sgeometry;
    // } 
    // else{
    //   var sgeometry = new THREE.TorusKnotGeometry(1.4, 0.55, 100, 16, 5, 16);
    //   object.material.color = new THREE.Color(0x00ff00);
    //   // originalgGeometry = new THREE.TorusKnotGeometry(1.4, 0.55, 100, 16, mappedAlpha2, mappedAlpha3);
    //   object.geometry = sgeometry;      
    // };


    alpha2 = mappedAlpha2;
    alpha3 = mappedAlpha3;
    // 
    
    var saveObject = createThreeObj(data, sgeometry); 
    
    // console.log(data) 
    // console.log(sgeometry)
    // if(mappedAlpha2 > 19){
    //   console.log('about to save')
    //   // debugger
    //   save(saveObject);
    // } 

      controls.update();
      if (mobile) {
          camera.position.set(0, 0, 0)
          camera.translateZ(10);
      }
      renderer.render(scene, camera);
  } 
});  

var alpha2;
var alpha3;
var recordState = 0;

function passData(data2, data3){
  return {
    alpha2: data2,
    alpha3: data3,
  };
  // console.log(data2, data3)
}

function saveData(gotData){
  // console.log('about to save:', gotData);
  $.post( window.location.origin, gotData, function(data){
    // console.log('savedData:', data);
  }, 'json');  
}



socket.on('/muse/elements/experimental/concentration', function (data){
  // COMMENT THIS LINE FOR DYNAMIC DATA 
  // var data = focusFixture;


  var focusData = data.values;
//  console.log(focusData)
  if (focusData > 0.5) {
      if (object.material != objectMaterial1){
          object.material = objectMaterial1
      }
   } else {
      if (object.material != objectMaterial2)
          object.material = objectMaterial2
   };  
   object.material.opacity = focusData + .1;
  // console.log(focusData)

  // if (focusData == 1) {
  //   object.material.map = map;
  //   object.material.map.needsUpdate=true;
  // }

  var brainData = passData(alpha2, alpha3);   
  if (focusData === 1 && recordState === 0){
    // save mappedAlpha3, mappedAlpha2, and texture
    
    // alpha2 = alpha2;
    // alpha3 = alpha3;
  //  console.log("alpha2 is" + alpha2);
  //  console.log("alpha3 is" + alpha3);
    saveData(brainData);
    //TODO: button click to trigger reset function Just save the first one and stop
    recordState = 1;
  //  console.log("recordState = " + recordState);
  }
  
});

// socket.on('/muse/elements/delta_session_score', function(data){

//     setTableValue(data.path, {
//         'Band Power Session Score: Delta' : data.values
//     });

// });

// socket.on('/muse/elements/theta_session_score', function(data){

//     setTableValue(data.path, {
//         'Band Power Session Score: Theta' : data.values
//     });

// });

// socket.on('/muse/elements/beta_session_score', function(data){

//     setTableValue(data.path, {
//         'Band Power Session Score: Beta' : data.values
//     });

// });

// socket.on('/muse/elements/gamma_session_score', function(data){

//     setTableValue(data.path, {
//         'Band Power Session Score: Gamma' : data.values
//     });

// });

// Ask for all the data
socket.emit('setPaths',
    [
      '/muse/acc',
        '/muse/eeg',
        '/muse/batt',
        '/muse/elements',
        '/muse/elements/experimental/concentration',
        '/muse/elements/horseshoe',
        '/muse/elements/blink',
        '/muse/elements/jaw_clench',
        '/muse/elements/low_freqs_absolute',
        '/muse/elements/delta_absolute',
        '/muse/elements/theta_absolute',
        '/muse/elements/alpha_absolute',
        '/muse/elements/beta_absolute',
        '/muse/elements/gamma_absolute',
        '/muse/elements/delta_relative',
        '/muse/elements/theta_relative',
        '/muse/elements/alpha_relative',
        '/muse/elements/beta_relative',
        '/muse/elements/gamma_relative',
        '/muse/elements/delta_session_score',
        '/muse/elements/theta_session_score',
        '/muse/elements/alpha_session_score',
        '/muse/elements/beta_session_score',
        '/muse/elements/gamma_session_score'
    ]
);
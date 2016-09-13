var serverUrl = window.location.href;
var socket = io.connect(serverUrl);

// 3D 
var camera, scene, renderer, material, smaterial, geometry, sgeometry, originalgGeometry, alphaMat;
var objectMaterial1, objectMaterial2;
var gui, guiControl, object
var mobile = false;
var texture
var Alpha, Theta;
var mappedAlpha2 = 0;
var mappedAlpha3 = 0;
var mouseX = 0, mouseY = 0;
var alphaData, thetaData
var accFB, accUD, accLR
var shaderMat
var focusData
var tetraGeo1, icoGeo1, sphereGeo

init();
setup();


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
    // window.addEventListener('mousemove', changeBrush, false);
}

function setup() {
    var cubeMap = getCubeMap(3)
    var cubeShader = THREE.ShaderLib['cube'];
    cubeShader.uniforms['tCube'].value = cubeMap;
    var skyBoxMaterial = new THREE.ShaderMaterial({
        fragmentShader: cubeShader.fragmentShader,
        vertexShader: cubeShader.vertexShader,
        uniforms: cubeShader.uniforms,
        depthWrite: false,
        side: THREE.BackSide
    });
    var skyBox = new THREE.Mesh(new THREE.CubeGeometry(100, 100, 100), skyBoxMaterial);
    // scene.add(skyBox);

    // grab brain data
    Alpha = function(dataArray) {
      this.al1 = dataArray[0];
      this.al2 = dataArray[1];
      this.ar1 = dataArray[2];
      this.ar2 = dataArray[3];
    }; 
    Theta = function(dataArray) {
      this.tl1 = dataArray[0];
      this.tl2 = dataArray[1];
      this.tr1 = dataArray[2];
      this.tr2 = dataArray[3];
    }; 

    // MATERIALS

    objectMaterial1 = new THREE.MeshStandardMaterial({
        shading: THREE.FlatShading,
        side: THREE.DoubleSide,
        transparent: true,
        // opacity: alphaData.al1 + .1,
        color: 0xF5C0AE
    });

    objectMaterial2 = new THREE.MeshStandardMaterial({
        shading: THREE.SmoothShading,
        side: THREE.DoubleSide,
        wireframe: true,
        transparent: true,
        // opacity: alphaData.al1 + .1,
        
        color: 0x90C3D4
    });



    // shaderMat = new THREE.ShaderMaterial( {

    //   uniforms: {
    //     time: { value: 1.0 },
    //     resolution: { value: new THREE.Vector2() }
    //   },
    //   attributes: {
    //     vertexOpacity: { value: [] }
    //   },
    //   vertexShader: document.getElementById( 'vertexShader' ).textContent,
    //   fragmentShader: document.getElementById( 'fragmentShader' ).textContent

    // } );

    // CREATE OBJECT SHAPE
    tetraGeo1 = new THREE.TetrahedronGeometry(.1, 0) //tri
    icoGeo1 = new THREE.IcosahedronGeometry(.1, 0) //ico
    sphereGeo = new THREE.TetrahedronGeometry(.1, 3) //sphere
                 
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

    // console.log(e.clientX, window.innerWidth, e.clientX - window.innerWidth / 2)

    var pos = {
        x: e.clientX - window.innerWidth / 2,
        y: -e.clientY + window.innerHeight / 2
    }
    if (thetaData.tr1 <= .25 || thetaData.tr2 <= .25 || thetaData.tl1 <= .25 || thetaData.tl2 <= .25) {
      var tetra1 = new THREE.Mesh(tetraGeo1, objectMaterial1)    
      if (alphaData.ar1 > .5 && alphaData.ar2 > .5 && alphaData.al1 > .5 && alphaData.al2 > .5) {
          tetra1.material = objectMaterial2
       };         
      tetra1.position.set(pos.x / 50, pos.y / 50, 0)
      tetra1.rotation.set(Math.random(), Math.random(), Math.random())
      tetra1.scale.set(thetaData.tr1 * 2 + 1, thetaData.tr1 * 2 + 1, thetaData.tr1 * 2 + 1)   
      scene.add( tetra1);
    } 
    else if (thetaData.tr1 > .25 && thetaData.tr1 <= .5 || thetaData.tr2 > .25 && thetaData.tr2 <= .5 || thetaData.a11 > .25 && thetaData.tl1 <= .5 || thetaData.tl2 > .25 && thetaData.tl2 <= .5) {
      var ico1 = new THREE.Mesh(icoGeo1, objectMaterial1)      
      if (alphaData.ar1 > .5 && alphaData.ar2 > .5 && alphaData.al1 > .5 && alphaData.al2 > .5) {
          ico1.material = objectMaterial2
       };      
      ico1.position.set(pos.x / 50, pos.y / 50, 0)
      ico1.rotation.set(Math.random(), Math.random(), Math.random())
      ico1.scale.set(thetaData.tr1 * 2 + 1, thetaData.tr1 * 2 + 1, thetaData.tr1 * 2 + 1)   
      scene.add( ico1);
    } 
    else{
      var sphere = new THREE.Mesh(sphereGeo, objectMaterial1)      
      if (alphaData.ar1 > .5 && alphaData.ar2 > .5 && alphaData.al1 > .5 && alphaData.al2 > .5) {
          sphere.material = objectMaterial2
       };
      sphere.position.set(pos.x / 50, pos.y / 50, 0)
      sphere.rotation.set(Math.random(), Math.random(), Math.random())
      sphere.scale.set(thetaData.tr1 * 2 + 1, thetaData.tr1 * 2 + 1, thetaData.tr1 * 2 + 1)  
      scene.add( sphere); 
    };
   
    console.log("theta " + thetaData.tl1,thetaData.tl2,thetaData.tr1,thetaData.tr2)   
    console.log("alpha " + alphaData.al1,alphaData.al2,alphaData.ar1,alphaData.ar2)    
}

var lastTime = performance.now(), //  
    threshold = 1000 / 60; // 1/60 seconds

socket.on('/muse/acc', function (data){
  accFB = data.values[0];
  accUD = data.values[1];
  accLR = data.values[2];

  // var mappedAcc = map_range(alphaData.ar2, 0, 1, 0, 19.5);
  // camera
  camera.position.x = (mouseX - camera.position.x) * 0.02;
  // console.log(accLR)
  // console.log(camera.position.x)
  camera.position.y = (-mouseY - camera.position.y) * 0.02;
  // camera.position.z = (-accFB - camera.position.z) * 0.02;
  
  
});
  var time=0;
  var radius=0;


socket.on('/muse/elements/alpha_session_score', function (data){

  // COMMENT THIS LINE FOR DYNAMIC DATA 
  // var data = dataFixture;

  var nextTime = performance.now();
  var lag = (nextTime - lastTime);

  if (lag >= threshold) {
    // reset lastTime
    lastTime = nextTime;

    time+=.01;
    radius+=1;

    alphaData = new Alpha(data.values); // look inside data for values, grabs array
    console.log("alpha " + data.values)

    var brush = new THREE.Mesh(tetraGeo1, objectMaterial1); 
    brush.material.opacity = alphaData.ar1;   
    brush.position.y = radius*Math.sin(time)*radius;
    brush.position.x = radius*Math.cos(time)*radius; 
    // brush.position.z = Math.random() * 1000 - 500;
    brush.rotation.set(Math.random(), Math.random(), Math.random());
    brush.scale.set(alphaData.ar1 * 100, alphaData.ar1 * 100, alphaData.ar1 * 100); 
    brush.material.color = new THREE.Color(0xfff200);

    if (alphaData.ar1 >= .7 && alphaData.ar2 >= .7 && alphaData.al1 >= .7 && alphaData.al2 >= .7) {    
      brush.geometry = sphereGeo;  
      // sphere.material.color = new THREE.Color(0xff0000); 
    } 
    else if (alphaData.ar1 >= .3  && alphaData.ar1 < .7 || alphaData.ar2 >= .3  && alphaData.ar2 < .7 || alphaData.al1 >= .3  && alphaData.al1 < .7 || alphaData.al2 >= .3 && alphaData.al2 < .7){ 
      brush.geometry = icoGeo1; 
      // ico.material.color = new THREE.Color(0xf58500); 
    } 
    scene.add(brush);
  }   
     



      controls.update();
      if (mobile) {
          camera.position.set(0, 0, 0)
          camera.translateZ(10);
      }
      renderer.render(scene, camera);  
});  



socket.on('/muse/elements/experimental/concentration', function (data){
  // COMMENT THIS LINE FOR DYNAMIC DATA 
  // var data = focusFixture;


  focusData = data.values;
//  console.log(focusData)
  // if (focusData > 0.5) {
  //     if (object.material != objectMaterial1){
  //         object.material = objectMaterial1
  //     }
  //  } else {
  //     if (object.material != objectMaterial2)
  //         object.material = objectMaterial2
  //  };  
   // object.material.opacity = focusData + .1;
  // console.log(focusData)



  if (focusData === 1){
    // do something
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

socket.on('/muse/elements/theta_session_score', function(data){

    thetaData = new Theta(data.values);
    // console.log("theta " + data.values)
});

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
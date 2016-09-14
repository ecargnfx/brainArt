var serverUrl = window.location.href;
var socket = io.connect(serverUrl);

// 3D 
var camera, scene, renderer, material, smaterial, geometry, sgeometry, originalgGeometry, alphaMat;
var solidMat, wfMatT, wfMatB, wfMatP, wfMatK, wfMatO, wfMatY
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
var emitter, particleGroup;
var alphaAvg, thetaAvg

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
renderer = new THREE.WebGLRenderer(  );
        // renderer.autoClearColor = false;
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
    camera.position.z = 15;
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
    scene.add(skyBox);

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

    solidMat = new THREE.MeshStandardMaterial({
        shading: THREE.FlatShading,
        side: THREE.DoubleSide,
        transparent: true,
        // opacity: alphaData.al1 + .1,
        color: 0xF5C0AE
    });

    wfMatT = new THREE.MeshStandardMaterial({
        shading: THREE.SmoothShading,
        side: THREE.DoubleSide,
        wireframe: true,
        transparent: true,
        // opacity: alphaAvg,
        color: 0x76F580
    });
    wfMatB = new THREE.MeshStandardMaterial({
        shading: THREE.SmoothShading,
        side: THREE.DoubleSide,
        wireframe: true,
        transparent: true,
        // opacity: alphaAvg,
        color: 0x90C3D4
    });
    wfMatP = new THREE.MeshStandardMaterial({
        shading: THREE.SmoothShading,
        side: THREE.DoubleSide,
        wireframe: true,
        transparent: true,
        // opacity: alphaAvg,
        color: 0xB290D4
    });
    wfMatK = new THREE.MeshStandardMaterial({
        shading: THREE.SmoothShading,
        side: THREE.DoubleSide,
        wireframe: true,
        transparent: true,
        // opacity: alphaAvg,
        color: 0xFCFC58
    });
    wfMatO = new THREE.MeshStandardMaterial({
        shading: THREE.SmoothShading,
        side: THREE.DoubleSide,
        wireframe: true,
        transparent: true,
        // opacity: alphaAvg,
        color: 0xFA8573 
    });
    wfMatY = new THREE.MeshStandardMaterial({
        shading: THREE.SmoothShading,
        side: THREE.DoubleSide,
        wireframe: true,
        transparent: true,
        // opacity: alphaAvg,
        color: 0xF068FC 
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
    tetraGeo1 = new THREE.TetrahedronGeometry(alphaAvg, 0) //tri
    icoGeo1 = new THREE.IcosahedronGeometry(alphaAvg, 0) //ico
    sphereGeo = new THREE.TetrahedronGeometry(alphaAvg, 3) //sphere
                 
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
    // console.log("theta " + thetaData.tl1,thetaData.tl2,thetaData.tr1,thetaData.tr2)   
    // console.log("alpha " + alphaData.al1,alphaData.al2,alphaData.ar1,alphaData.ar2)    
}

// Create particle group and emitter
function initParticles() {
  particleGroup = new SPE.Group({
    texture: {
            value: THREE.ImageUtils.loadTexture('assets/textures/smokeparticle.png')
        }
  });

  emitter = new SPE.Emitter({
            particleCount: 500,
            maxAge: {
                value: 2
            },
            position: {
                value: new THREE.Vector3( 0, 10, 0 )
            },
            size: {
                value: [0, 4]
            },
            color: {
                value: new THREE.Color(0.5, 0.25, 0.9)
            },
            opacity: {
                value: 1
            },
            rotation: {
                axis: new THREE.Vector3( 0, 0, 1 ),
                angle: 0,
                static: false,
                center: new THREE.Vector3()
            },
            direction: -1
        });

  particleGroup.addEmitter( emitter );
  scene.add( particleGroup.mesh );
}

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

var lastTime = performance.now(), //  
    threshold = 1000 / 60; // 1/60 seconds

socket.on('/muse/elements/alpha_session_score', function (data){

  // COMMENT THIS LINE FOR DYNAMIC DATA 
  // var data = dataFixture;
  
  var nextTime = performance.now();
  var lag = (nextTime - lastTime);

  // checks time elapsed between last time and next time. If lag >= 1/60 second, then run function.
  if (lag >= threshold) {

    // reset lastTime
    lastTime = nextTime;    

    alphaData = new Alpha(data.values); // look inside data for values, grabs array 
    
    // Calculate Alpha average
    var sum = data.values.reduce(function(a, b) { return a + b; });
    alphaAvg = sum / data.values.length;
    // console.log("The sum of " + data.values + " is: " + sum + " The average is: " + avg)

    var pos = {
        x: accLR,
        y: accUD/10,
        z: accFB
    }


  }
      controls.update();
      if (mobile) {
          camera.position.set(0, 0, 0)
          camera.translateZ(10);
      }

      renderer.render(scene, camera);  
});  

// for particles
// function animate() {
//     requestAnimationFrame( animate );
//     particleGroup.tick( 0.016 );
//     renderer.render( scene, camera );
// }







Leap.loop({
 
  hand: function(hand){
    var swipeX = hand.screenPosition()[0];
    var swipeY = hand.screenPosition()[1];
    var swipeZ = hand.screenPosition()[2];
    console.log( swipeX );

    var pos = {
      x: swipeX,
      y: swipeY,
      z: swipeZ
    }

    var brush = new THREE.Mesh(icoGeo1, solidMat);
    brush.position.x = pos.x / 50; 
    brush.position.y = - pos.y / 50;
    brush.material.opacity = .3; 
    // brush.position.z = pos.z / 50;
    // brush.rotation.set(Math.random(), Math.random(), Math.random());
    brush.rotation.z = Date.now() * 0.0009; 
    brush.rotation.y = Date.now() * 0.0009;
    TweenMax.from(brush.scale,1,{x:0.001,y:0.001,z:0.001}); 
    
    console.log("avgs " + thetaAvg, alphaAvg)
    // if (alphaAvg >= .7) {    
    //   brush.geometry = sphereGeo;  

    // } 
    // else if (alphaAvg < .7){ 
    //   brush.geometry = icoGeo1; 
    //   brush.material.opacity = .5; 
    //   var s = Math.sin( Date.now() * 0.002 );
    //     brush.material.color.setHSL(0.5, s, 0.5 );
    //   // ico.material.color = new THREE.Color(0xf58500); 
    // } 

    if (thetaAvg > alphaAvg) {
      brush.geometry = sphereGeo;
      brush.scale.set(thetaAvg * 5, thetaAvg * 5, thetaAvg * 5);     
      if (thetaAvg >= .7) {
        brush.material = wfMatT; 
      } 
      else if (thetaAvg >= .3 && thetaAvg < .7){
        brush.material = wfMatB; 
      }
      else{
        brush.material = wfMatP; 
      };  
    } 
    else{
      brush.geometry = tetraGeo1;
      brush.scale.set(alphaAvg * 5, alphaAvg * 5, alphaAvg * 5); 
      if (alphaAvg >= .7) {
        brush.material = wfMatK;
      } 
      else if (alphaAvg >= .3 && alphaAvg < .7){
        brush.material = wfMatO;
      }
      else{
        brush.material = wfMatY;
      };
    };

    if (thetaAvg === 0 || alphaAvg === 0) {
      brush.material.opacity = 0; 
    };

    scene.add(brush);

  }
 
}).use('screenPosition');

socket.on('/muse/elements/experimental/concentration', function (data){
  // COMMENT THIS LINE FOR DYNAMIC DATA 
  // var data = focusFixture;


  focusData = data.values;
//  console.log(focusData)
  // if (focusData > 0.5) {
  //     if (object.material != solidMat){
  //         object.material = solidMat
  //     }
  //  } else {
  //     if (object.material != wfMat)
  //         object.material = wfMat
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
    var sum = data.values.reduce(function(a, b) { return a + b; });
    thetaAvg = sum / data.values.length;


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
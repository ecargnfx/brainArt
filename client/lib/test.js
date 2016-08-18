var socket = io.connect('http://localhost:8080');

// 3D 
var camera, scene, renderer, material, smaterial, geometry, sgeometry, originalgGeometry;
var gui, guiControl, object
var mobile = false;
var texture
var Alpha;
var mappedAlpha2 = 0;
var mappedAlpha3 = 0;
var mouseX = 0, mouseY = 0;

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
    camera.position.y = 5;
    camera.position.z = 3;
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
    window.addEventListener('mousemove', mousemove, false);
}

function setup() {

    // texture = new THREE.TextureLoader().load("assets/textures/watercolor-blue.jpg");
    // texture.wrapS = THREE.RepeatWrapping;
    // texture.wrapT = THREE.RepeatWrapping;
    // texture.repeat.set(2, 2);
    smaterial = new THREE.MeshPhongMaterial({
        color: 0xffffff,
        // wireframe: true,
        // // side: THREE.DoubleSide,         
        // transparent: true, 
        // opacity: 1
    });

    // grab alpha data
    Alpha = function(dataArray) {
      // data = [0, 1, .2, .3];
      this.al1 = dataArray[0];
      this.al2 = dataArray[1];
      this.ar1 = dataArray[2];
      this.ar2 = dataArray[3];
    }; 
                   
    // central object
    sgeometry = new THREE.TorusKnotGeometry(1.4, 0.55, 100, 16, mappedAlpha2, mappedAlpha3);
    // originalgGeometry = new THREE.TorusKnotGeometry(1.4, 0.55, 100, 16, mappedAlpha2, mappedAlpha3);
    object = new THREE.Mesh(sgeometry, smaterial);
    scene.add(object);

    //particles
    particle = new THREE.Object3D();
    scene.add(particle);

    var partGeo = new THREE.TetrahedronGeometry(2, 0);
    var partMat = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      shading: THREE.FlatShading
    });
    for (var i = 0; i < 1000; i++) {
      var mesh = new THREE.Mesh(partGeo, partMat);
      mesh.position.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize();
      mesh.position.multiplyScalar(90 + (Math.random() * 700));
      mesh.rotation.set(Math.random() * 2, Math.random() * 2, Math.random() * 2);
      particle.add(mesh);
    }

    // light
    var ambientLight = new THREE.AmbientLight(0x9281D1 );
    scene.add(ambientLight);

    var lights = [];
    lights[0] = new THREE.DirectionalLight( 0xf4d3c4, 1 );
    lights[0].position.set( 3, 0, 0 );
    lights[1] = new THREE.DirectionalLight( 0xEF94A5, 1 );
    lights[1].position.set( 1.75, 3, 0.5 );
    lights[2] = new THREE.DirectionalLight( 0x5A5CA8, 1 );
    lights[2].position.set( -1.75, -2, 0.5 );
    scene.add( lights[0] );
    scene.add( lights[1] );
    scene.add( lights[2] );
}

var num = 0
var time = 0; // used for shimmer

var lastTime = performance.now(), //  
    threshold = 1000 / 60; // 1/60 seconds

socket.on('/muse/acc', function (data){
  var accFB = data.values[0];
  var accUD = data.values[1];
  var accLR = data.values[2];
  // console.log(accLR) //TODO: map accelerometer to mouse
});

var map  = new THREE.TextureLoader().load("assets/textures/white-fur-texture.jpg");
var mat = new THREE.MeshPhongMaterial({
color: 0xffffff,
shading: THREE.FlatShading
});

var mat2 = new THREE.MeshPhongMaterial({
color: 0xffffff,
wireframe: true,
side: THREE.DoubleSide

});

socket.on('/muse/elements/experimental/concentration', function (data){

  particle.rotation.x += 0.0000;
  particle.rotation.y -= 0.0040;

  var focusData = data.values;
  if (focusData > 0.5) {
    // console.log(focusData)
    // object.material.map = map;
    // object.material.map.needsUpdate=true;
    object.material.wireframe = false;
    // object.material.shading = true;    
    object.material.shading = THREE.FlatShading;
    object.material.side = THREE.DoubleSide;
    // debugger  
  } else{
    object.material.wireframe = true;
    object.material.side = THREE.DoubleSide;
    object.material.shading = THREE.SmoothShading;
    // object.material.map = texture;
  };  
  // object.material.opacity = focusData;
  // console.log(focusData)
});

socket.on('/muse/elements/beta_session_score', function (data){
  var nextTime = performance.now();
  var lag = (nextTime - lastTime);
  // console.log(nextTime, ":", data.values[0])

  // checks time elapsed between last time and next time. If lag >= 1/60 second, then run function.
  if (lag >= threshold) {

    // camera
    camera.position.x = (mouseX - camera.position.x) * 0.02;
    // console.log(mouseX)
    // console.log(camera.position.x)
    camera.position.y = (-mouseY - camera.position.y) * 0.02;
    camera.position.z = 9;
    
    camera.lookAt(scene.position)

    // reset lastTime
    lastTime = nextTime;

    var alphaData = new Alpha(data.values); // look inside data for values, grabs array 
    
    mappedAlpha2 = map_range(alphaData.ar2, 0, 1, 0, 19.5);      
    mappedAlpha3 = map_range(alphaData.al1, 0, 1, 0, 19.5); //works
    console.log(mappedAlpha2);
    console.log(mappedAlpha3);

    sgeometry = new THREE.TorusKnotGeometry(1.4, 0.55, 100, 16, mappedAlpha2, mappedAlpha3);
    // originalgGeometry = new THREE.TorusKnotGeometry(1.4, 0.55, 100, 16, mappedAlpha2, mappedAlpha3);
    object.geometry = sgeometry;

      controls.update();
      if (mobile) {
          camera.position.set(0, 0, 0)
          camera.translateZ(10);
      }
      renderer.render(scene, camera);
  } 
});  

// Ask for all the data
socket.emit('setPaths',
    [
      '/muse/acc',
        '/muse/eeg',
        '/muse/batt',
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
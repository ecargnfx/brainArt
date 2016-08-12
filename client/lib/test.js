var socket = io.connect('http://localhost:8080');

// 3D 

var camera, scene, renderer, material, geometry, sgeometry, originalgGeometry;
var gui, guiControl, object
var mobile = false;
var texture
var Alpha;
var mappedAlpha2 = 0;
var mappedAlpha3 = 0;

init();
setup();
// render();

function init() {
    // renderer
    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    // scene
    scene = new THREE.Scene();
    // camera
    camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 3);
    camera.focalLength = camera.position.distanceTo(scene.position);
    scene.add(camera)
    // controls
    // gui = new dat.GUI();
    // guiControl = new function () {
    //     this.shimmer = 0.1;
    //     this.p = 5;
    //     this.q = 5;
    // }

    // gui.add(guiControl, 'shimmer', 0, 0.5);
    // gui.add(guiControl, 'p', 0, 20).onChange(function () {
    //     changeGeometry();
    // });
    // gui.add(guiControl, 'q', 0, 20).onChange(function () {
    //     changeGeometry();
    // });

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
}

// function changeGeometry() {
//     sgeometry = new THREE.TorusKnotGeometry(1.4, 0.55, 100, 16, Math.round(alphaData.al2), Math.round(alphaData.al2));
//     originalgGeometry = new THREE.TorusKnotGeometry(1.4, 0.55, 100, 16, Math.round(alphaData.al2), Math.round(alphaData.al2));
//     object.geometry = sgeometry;
//     object.material.color = new THREE.Color(0xFFFFFF*Math.random())
// }

function map_range(value, low1, high1, low2, high2) {
    return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
};

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
    texture = new THREE.TextureLoader().load("assets/textures/watercolor-blue.jpg");
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2, 2);
    var smaterial = new THREE.MeshStandardMaterial({
        envMap: cubeMap,
        map: texture,
        shading: THREE.FlatShading,
        side: THREE.DoubleSide,
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
    originalgGeometry = new THREE.TorusKnotGeometry(1.4, 0.55, 100, 16, mappedAlpha2, mappedAlpha3);
    object = new THREE.Mesh(sgeometry, smaterial);
    scene.add(object);

    // light
    var light = new THREE.AmbientLight(0xFFFFFF);
    scene.add(light);
}


function remove(object) {
    scene.remove(object)
}


var num = 0
var time = 0; // used for shimmer



var lastTime = performance.now(), //  
    threshold = 1000 / 60; // 1/60 seconds




socket.on('/muse/acc', function (data){
  var accFB = data.values[0];
  var accUD = data.values[1];
  var accLR = data.values[2];
});

socket.on('/muse/elements/experimental/concentration', function (data){
  var focusData = data.values;
  if (focusData > 0.5) {
    object.material.color = new THREE.Color(0xFF0000);  
  } else{
    object.material.color = new THREE.Color(0xFFFFFF);
  };  
});

socket.on('/muse/elements/beta_session_score', function (data){
  var nextTime = performance.now();
  var lag = (nextTime - lastTime);
  // console.log(nextTime, ":", data.values[0])

  // checks time elapsed between last time and next time. If lag >= 1/60 second, then run function.
  if (lag >= threshold) {
    // reset lastTime
    lastTime = nextTime;

    var alphaData = new Alpha(data.values); // look inside data for values, grabs array 
    
    mappedAlpha2 = map_range(alphaData.ar2, 0, 1, 0, 20);      
    mappedAlpha3 = map_range(alphaData.al1, 0, 1, 0, 20); //works
    
    // time += 1
    // texture.offset.y = time / 10000;
    // for (var i = 0; i < sgeometry.vertices.length; i++) {
    //     var v = sgeometry.vertices[i]
    //     var ov = originalgGeometry.vertices[i];
    //     var sin = (Math.sin(time / 100 + i / 10) + 1) / 2
    //     var random = ((Math.random() * 0.2) + 0);
    //     v.x = ov.x + alphaData.al1 * random;
    //     v.y = ov.y + alphaData.al1 * random;
    //     v.z = ov.z + alphaData.al1 * random;
    // }
    // // object.rotation.y += alphaData.al2;         

    // sgeometry.verticesNeedUpdate = true;


    sgeometry = new THREE.TorusKnotGeometry(1.4, 0.55, 100, 16, mappedAlpha2, mappedAlpha3);
    originalgGeometry = new THREE.TorusKnotGeometry(1.4, 0.55, 100, 16, mappedAlpha2, mappedAlpha3);
    object.geometry = sgeometry;
    // object.material.color = new THREE.Color(0xFFFFFF*Math.random())
    // if (mappedAlpha2 > 15 && mappedAlpha3 > 15) {
    //   object.material.color = new THREE.Color(0xFF0000);  
    // } else{
    //   object.material.color = new THREE.Color(0xFFFFFF);
    // };
    // console.log(mappedAlpha2, mappedAlpha3)

              controls.update();
              if (mobile) {
                  camera.position.set(0, 0, 0)
                  camera.translateZ(10);
              }
              renderer.render(scene, camera);
  } 
      

});  






// Now ask for all the data
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
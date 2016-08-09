/**
 *  Node Muse
 *  Web Gui example
 *
 *  This is the frontend socket script connecting to the
 *  backend server and subscribing to its information.
 *  ---------------------------------------------------
 *  @package    node-muse
 *  @author     Jimmy Aupperlee <j.aup.gt@gmail.com>
 *  @license    GPLv3
 *  @version    1.0.0
 *  @since      File available since Release 0.1.0
 */


/**
 * Quick settings
 */

// Minimum update interval for the charts
var update_interval = 200;

/**
 * Required modules
 */

var socket = io.connect('http://localhost:8080');

/**
 *3D 
 */

var scene, camera, renderer;
var geometry, material, mesh;
var Alpha;
// alpha 
var al1; 
var al2; 
var ar1; 
var ar2; 

init();
setup();
/*animate();
*/ 
function init() {
 
    scene = new THREE.Scene();
 
    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 10000 );
    camera.position.z = 1000;
 
    geometry = new THREE.BoxGeometry( 200, 200, 200 );
    material = new THREE.MeshBasicMaterial( { color: 0xff0000, wireframe: true } );
 
    mesh = new THREE.Mesh( geometry, material );
    scene.add( mesh );
 
    renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );
 
    document.body.appendChild( renderer.domElement );
     
}
 
function setup(){
  Alpha = function(dataArray) {
    // data = [0, 1, .2, .3];
    this.al1 = dataArray[0];
    this.al2 = dataArray[1];
    this.ar1 = dataArray[2];
    this.ar2 = dataArray[3];
    console.log(this.al1);
  };
  var lastTime = performance.now(), //  
      threshold = 1000 / 60; // 1/60 seconds

  socket.on('/muse/elements/alpha_session_score', function (data){
    var nextTime = performance.now();
    var lag = (nextTime - lastTime);
    console.log(nextTime, ":", data.values[0])

    // checks time elapsed between last time and next time. If lag >= 1/60 second, then run function.
    if (lag >= threshold) {
      // reset lastTime
      lastTime = nextTime;

      var brainData = new Alpha(data.values); // look inside data for values, grabs array 

      mesh.rotation.x += brainData.al1;
      mesh.rotation.y += brainData.al2;

      // render
      renderer.render( scene, camera );

    } 
        

  });  

} 
/*function animate() {
 
    requestAnimationFrame( animate );
 
    
 
    
 
}*/




// Now ask for all the data
socket.emit('setPaths',
    [
      '/muse/acc',
        '/muse/eeg',
        '/muse/batt',
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
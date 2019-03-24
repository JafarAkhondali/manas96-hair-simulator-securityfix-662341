// Set the scene size.
const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;
// Set some camera attributes.
const VIEW_ANGLE = 45;
const ASPECT = WIDTH / HEIGHT;
const NEAR = 0.1;
const FAR = 10000;

// Get the DOM element to attach to
const container = document.querySelector('#container');

const renderer = new THREE.WebGLRenderer({antialias: true});
const camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR,FAR);
camera.position.set(100,100,100);   //does not work
var controls = new THREE.OrbitControls(camera, renderer.domElement)
controls.screenSpacePanning = true;
controls.enableKeys = true;
controls.keyPanSpeed = 60;
controls.minDistance = 0;
controls.maxDistance = 100000;

const scene = new THREE.Scene();
scene.add(camera);
renderer.setSize(WIDTH, HEIGHT);
container.appendChild(renderer.domElement);

scene.add(new THREE.AxesHelper(50)); //RED: x   GREEN: y    BLUE: z


var geo = new THREE.PlaneBufferGeometry(2000, 2000, 8, 8);
var mat = new THREE.MeshBasicMaterial({ color: new THREE.Color('grey'), side: THREE.DoubleSide });
var plane = new THREE.Mesh(geo, mat);
plane.rotateX(-Math.PI / 2);
scene.add(plane);


const sphereMaterial = new THREE.MeshLambertMaterial({color: new THREE.Color('red')});
const sphere = new THREE.Mesh(new THREE.SphereGeometry(10,100,100),sphereMaterial);
sphere.position.z = -300;
sphere.position.y = 100;
scene.add(sphere);

var ambientLight = new THREE.AmbientLight(new THREE.Color('white'), 0.4);
scene.add(ambientLight);

const pointLight =new THREE.PointLight(new THREE.Color('white'));
pointLight.position.x = 10;
pointLight.position.y = 50;
pointLight.position.z = 130;
scene.add(pointLight);
var pointLightHelper = new THREE.PointLightHelper(pointLight, 5);
scene.add(pointLightHelper);

const cubeMaterial = new THREE.MeshLambertMaterial({color: new THREE.Color('yellow') });
var cube = new THREE.Mesh(new THREE.BoxGeometry(50, 50, 50), cubeMaterial);
cube.position.z = -200;
cube.position.x = 100;
cube.position.y = 100;
scene.add(cube);

var anchorMaterial = new THREE.MeshLambertMaterial({color: new THREE.Color('yellow')});
anchor = new THREE.Mesh(new THREE.SphereGeometry(1,50,50), anchorMaterial);
anchor.position.set(sphere.position.x, sphere.position.y + 100, sphere.position.z);  
scene.add(anchor);

var MAX_POINTS = 2;
var lineGeometry = new THREE.BufferGeometry();
var positions = new Float32Array( MAX_POINTS * 3 ); // 3 vertices per point
lineGeometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );

// drawcalls
var drawCount = 2; // draw the first 2 points, only
lineGeometry.setDrawRange( 0, drawCount );

var lineMaterial = new THREE.LineBasicMaterial( { color: 0x4CE93A, linewidth: 1000 } );
line = new THREE.Line( lineGeometry,  lineMaterial );
var linePositions = line.geometry.attributes.position.array;
linePositions[0] = anchor.position.x;
linePositions[1] = anchor.position.y;
linePositions[2] = anchor.position.z;
scene.add( line );
// update positions
function updateLinePositions() {
  linePositions[3] = sphere.position.x;
  linePositions[4] = sphere.position.y;
  linePositions[5] = sphere.position.z;
}







var GRAVITY = new THREE.Vector3(0, -9.8, 0);
var MASS = 30;
var velocity = new THREE.Vector3(0, 0, 0);
var timeStep = 0.1;

var springStiffness = 8;              //spring constant (hook's law)
var damping = 6;                     //damping coefficient 


var gui = new dat.GUI();
// var springControls = gui.addFolder('Spring');
gui.add(GRAVITY, 'y', -100, -1).name('Gravity force').listen();
gui.add(this, 'springStiffness', 0, 10).name('Spring stiffness').listen();    
gui.add(this, 'damping', 0, 50).name('Damping force').listen();

controls.target = anchor.position.clone();
function animate() {

  cube.rotation.x += 0.001;
  cube.rotation.y += 0.001;
  cube.rotation.z += 0.001;
  pointLight.position.y += 0.01;
  pointLight.position.x += 0.01;


  var springForce = sphere.position.clone().sub(anchor.position).multiplyScalar(-springStiffness);
  var dampingForce = velocity.clone().multiplyScalar(damping);
  var force = springForce.add(GRAVITY.clone().multiplyScalar(MASS)).sub(dampingForce);
  
  var accleration = force.clone().divideScalar(MASS);
  velocity.add(accleration.clone().multiplyScalar(timeStep));
  sphere.position.add(velocity.clone().multiplyScalar(timeStep));

  updateLinePositions();
  line.geometry.attributes.position.needsUpdate = true;

  //var springForceY = -k * (positionY - anchorY)
  //var dampingForceY = damping * velocityY
  // var forceY = mass * GRAVITY;
  // var accelerationY = forceY / mass;
  // velocityY = velocityY + accelerationY * timeStep;
  // sphere.position.y = sphere.position.y + velocityY * timeStep;  

  requestAnimationFrame( animate );
  controls.update();
  renderer.render( scene, camera );
}
animate();
// uses wave simulation equations derived in this article:
// https://medium.com/@matiasortizdiez/beginners-introduction-to-natural-simulation-in-python-ii-simulating-a-water-ripple-809356ffcb43

import * as THREE from 'three';
import { OrbitControls } from 'OrbitControls';



// todo:
// reevaluate shadow effects

// scene setup ----------------
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x9156d0);


// camera setup ----------------
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.setZ(30);


// renderer setup ----------------
const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#bg'),
});
// renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.render(scene, camera);
renderer.shadowMap.enabled = true;


// controls setup - remove when implementing? ----------------
const controls = new OrbitControls(camera, renderer.domElement);
controls.target = new THREE.Vector3(0, 0, -40);
controls.update();

// light setup - rearrange before implimenting ----------------
// ambient light
scene.add(new THREE.AmbientLight(0xffffff, 0.5));
// directional light
const dirLight = new THREE.DirectionalLight(0xffffff, 1.0)
dirLight.position.x += 20
dirLight.position.y += 20
dirLight.position.z += 20
dirLight.castShadow = true
dirLight.shadow.mapSize.width = 4096;
dirLight.shadow.mapSize.height = 4096;
const d = 25;
dirLight.shadow.camera.left = - d;
dirLight.shadow.camera.right = d;
dirLight.shadow.camera.top = d;
dirLight.shadow.camera.bottom = - d;
dirLight.position.z = -30;

let target = new THREE.Object3D();
target.position.z = -30;
dirLight.target = target;
dirLight.target.updateMatrixWorld();

dirLight.shadow.camera.lookAt(0, 0, -30);
scene.add(dirLight);
// scene.add( new THREE.CameraHelper( dirLight.shadow.camera ) );


// plane geometry ----------------
const x_min = 0;
const x_max = 30; // length from x_min
const nx = 200; // number of nodes in x dimension
const Lx = x_max - x_min; // total length of plane
const dx = Lx / nx; // distance between nodes
const y_min = 0;
const y_max = x_max; // plane shape square
const ny = nx;
const Ly = y_max - y_min; // total width of plane
const dy = Ly / ny;

const geometry = new THREE.PlaneBufferGeometry(Lx, Ly, nx, ny); // length/width and number of vertices in each dimension
// const count = geometry.attributes.position.count; // get total number of vertices from geometry object (nx * ny)
const plane = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({ color: 0xf2a23a }));
plane.receiveShadow = true;
plane.castShadow = true;
plane.rotation.x = - Math.PI / 2;
plane.position.z = - 30;
scene.add(plane);

// wave function variables
const c = 1; // sqrt(proportionality constant / mass)
const CFL = 0.2; // Courant–Friedrichs–Lewy condition
const dt = c * CFL * dx;
const nt = 400; // number of time frames computed
const nu = 0.002;

// matrix of each vertex and elevation for each point in simulated time (t, x, y)
var u = []; // creates u matrix with time dimension
for (var i=0; i<2; i++) { // creates x dimension
    u[i] = []
    for (var j=0; j<3; j++) { // creates y dimension, populates all points with zero
        u[i][j] = [0, 0 ,0]
	}
}

u[0, Math.floor(Nx / 2), Math.floor(Ny / 2)] = Math.sin(0) // disturbance at t = 0
u[1, Math.floor(Nx / 2), Math.floor(Ny / 2)] = Math.sin(1 / 10) // disturbance at t = 1

// python range to js: range(5) = [...Array(5).keys()]

function jsRange(start, stop) {
	var range = [];
    for (let i=start; i<stop; i++) {
      range.push(i);
    }
  return range;
}

// const tRange = [...Array(nt-1).keys()]; // base 0
// tRange.shift(); // transform to base 1




function animate() {
    // const now = Date.now() / 300;

    for (let i = 0; i < count; i++) { // iterate through each vertex
        const x = geometry.attributes.position.getX(i);

        // SINE WAVE
        const xangle = x + now
        const xsin = Math.sin(xangle)
        geometry.attributes.position.setZ(i, xsin);
    }
    geometry.computeVertexNormals();
    geometry.attributes.position.needsUpdate = true;

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}
animate();


function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
};
window.addEventListener('resize', onWindowResize);
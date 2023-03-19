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
const nx = 11; // number of nodes in x dimension
const Lx = x_max - x_min; // total length of plane
const dx = Lx / (nx - 1); // distance between nodes
// console.log(dx)
const y_min = 0;
const y_max = x_max; // plane shape square
const ny = nx;
const Ly = y_max - y_min; // total width of plane
const dy = Ly / (ny - 1);
// console.log(dy)

const geometry = new THREE.PlaneBufferGeometry(Lx, Ly, nx-1, ny-1); // length/width and number of segments (not vertices!) in each dimension
// const plane = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({ color: 0xf2a23a }));
const material = new THREE.MeshBasicMaterial({
    color: 0xFF6347,
    wireframe: true
});
const plane = new THREE.Mesh(geometry, material);
plane.receiveShadow = true;
plane.castShadow = true;
plane.rotation.x = - Math.PI / 2;
plane.position.z = - 30;
scene.add(plane);

// wave function variables
const c = 1; // sqrt(proportionality constant / mass)
// const CFL = 0.2; // Courant–Friedrichs–Lewy condition - needs to < 1; forces dt < dx (i think???)
// const dt = c * CFL * dx;
const dt = 0.0025;
// const nt = 400; // number of time frames computed
// const nu = 0.002;

// create a matrix of elevation values for points (t, x, y)
// initialize matrix with all elevation values set to 0
// line 32 transcribed:
// var u = []; // create array representing time dimension, then,
// for (var i=0; i<nt; i++) { // for each point in time,
//     u[i] = []; // create new array representing x dimension,
//     for (var j=0; j<nx; j++) { // then, for each row of x vertices,
//         u[i][j] = new Array(ny).fill(0); // create new array representing y dimension, of length ny, full of 0s
// 	}
// }
// console.log(u)

// initial disturbance
// u[0, Math.floor(nx / 2), Math.floor(ny / 2)] = Math.sin(0); // disturbance at t = 0
// u[1, Math.floor(nx / 2), Math.floor(ny / 2)] = Math.sin(1 / 10); // disturbance at t = 1


// transcribed Python calculation from Matias Ortiz's Medium article, URL @ top of code
// iterates through each point in u to assign elevations to vertices
// console.log('calculating elevations')
// for (var t=1; t<nt-1; t++) { // in Python: for t in range(1, nt-1):
//     if (t > nt) {
//         console.log(nt)
//         console.log('time: ' + t);
//         break
//     }
//     for (var x=1; x<nx-1; x++) {
//         if (x > nx) {
//             console.log(nx)
//             console.log('x: ' + x);
//             break
//         }
//         for (var y=1; y<ny-1; y++) {
//             if (y > ny) {
//                 console.log(ny)
//                 console.log('y: ' + y);
//                 break
//             }
//             if (t < 100) {
//                 u[t, Math.floor(nx / 2), Math.floor(ny / 2)] = Math.sin(t/10);
//             }
//             // copy and pasted, then transcribed exponentiation from py to js
//             // assumes order of operations carried out the same between py and js
//             // console.log(u[t-1, x, y])
//             u[t+1, x, y] = Math.pow(c, 2) * Math.pow(dt, 2) * (((u[t, x+1, y] - 2*u[t, x, y] + u[t, x-1, y])/(Math.pow(dx, 2))) + ((u[t, x, y+1] - 2*u[t, x, y] + u[t, x, y-1])/(Math.pow(dy, 2)))) + 2*u[t, x, y] - u[t-1, x, y];
//             // console.log()
//         }
//     }
// }
// now, u values are elevations; z=u(t,x,y)


// matrix u will hold vertice properties t,x,y for t-1, t, and t+1 at all x,y in plane
const count = geometry.attributes.position.count; // get total number of vertices from geometry object (nx * ny)
var u = []; // create array representing time dimension, then,
for (var i=0; i<3; i++) { // for past(0), present(1), and future(2) timeframes, 
    u[i] = []; // create new array representing x dimension,
    for (var j=0; j<nx; j++) { // then, for each row of x vertices,
        u[i][j] = new Array(ny).fill(0); // create new array representing y dimension, of length ny, full of 0s
	}
}
console.log(u)

var time = 0;
function animate() {
    time = time + 1;

    if (time < 10) {
        console.log('generating splash');
        // initial disturbance
        u[0][Math.floor(nx / 2)][Math.floor(ny / 2)] = Math.sin(0); // disturbance at t = 0
        u[1][Math.floor(nx / 2)][Math.floor(ny / 2)] = Math.sin(1 / 10); // disturbance at t = 1
        // console.log(Math.floor(nx / 2), Math.floor(ny / 2))
        // nx=7; (3,3)
    }

    // if (time == 10) {
    //     console.log(Math.sin(.1))
    //     console.log(u[0][3][3], u[1][3][3])
    // }

    for (var x=1; x<nx-1; x++) {
        for (var y=1; y<ny-1; y++) {
            // variables used in future value calculation
            // const xP1 = (x + 1 % nx + nx) % nx; // x Plus 1: accounts for out of range indices by wrapping to other end
            // const xM1 = (x - 1 % nx + nx) % nx; // x-1 wrapped
            // const yP1 = (y + 1 % ny + ny) % ny; // y+1 wrapped
            // const yM1 = (x - 1 % ny + ny) % ny; // y-1 wrapped
            const t = 1; // t is present, t-1 is past
            const term1 = Math.pow(c, 2) * Math.pow(1, 2)
            // const term1 = ;
            const term2 = ((u[t][x+1][y] - 2*u[t][x][y] + u[t][x-1][y])/(Math.pow(dx, 2)));
            const term3 = ((u[t][x][y+1] - 2*u[t][x][y] + u[t][x][y-1])/(Math.pow(dy, 2)));
            const term4 = 2*u[t][x][y] - u[t-1][x][y];
            // console.log(term1,term2,term3,term4);
            u[2][x][y] = Math.round((term1 * (term2 + term3) + term4)*10000)/10000;
            console.log(u[2][x][y])
        }
    }
    
    // if (time >= 30) {
    //     return
    // }
    
    for (let i = 0; i < count; i++) { // iterate through each geometry vertex to assign z value
        // transform geometry coordinates to matrix indices
        // assumes geometry is centered at 0,0
        // assumes simulation matrix has same number of nodes as geometry
        // assumes nx,ny are odd
        const xGeometry = geometry.attributes.position.getX(i);
        const yGeometry = geometry.attributes.position.getY(i);
        const xMatrix = (xGeometry / dx) + (Math.floor(nx / 2))
        const yMatrix = (yGeometry / dy) + (Math.floor(ny / 2))
        // console.log(xMatrix,yMatrix)
        
        // get elevation from simulation matrix, assign to geometry vertex
        const amplification = 100;
        const z = u[1][xMatrix][yMatrix] * amplification;
        // console.log(z)
        geometry.attributes.position.setZ(i, z);
    }
    geometry.computeVertexNormals();
    geometry.attributes.position.needsUpdate = true;
    
    renderer.render(scene, camera);
    
    // shift present elevations to past, and future to present, for use in next iteration
    u[0] = u[1] // set u[past] = u[present]
    u[1] = u[2] // set u[present] = u[future], as calculated this iteration

    requestAnimationFrame(animate);
}
animate();


function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
};
window.addEventListener('resize', onWindowResize);
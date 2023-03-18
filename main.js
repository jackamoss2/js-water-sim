import * as THREE from 'three';
import { OrbitControls } from 'OrbitControls';


// todo:
// reevaluate shadow effects

// scene setup ----------------
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xa8def0);


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
const geometry = new THREE.PlaneBufferGeometry(30, 30, 200, 200);
const plane = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({ color: 0xf2a23a }));
plane.receiveShadow = true;
plane.castShadow = true;
plane.rotation.x = - Math.PI / 2;
plane.position.z = - 30;
scene.add(plane);





function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
animate();


function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
};
window.addEventListener('resize', onWindowResize);
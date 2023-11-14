import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const loader = new GLTFLoader();
let vase = undefined;

const renderer = new THREE.WebGLRenderer({ antialias: true });
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  50,
  window.innerWidth / window.innerHeight,
  1,
  1000
);

loader.load(
  'models/vase.glb',
  (gltf) => {
    gltf.scene.position.set(0, -40, 0);
    vase = gltf.scene;
    scene.add(gltf.scene);
  },
  undefined,
  (error) => {
    console.error(error);
  }
);

const environment = new RoomEnvironment();
const pmremGenerator = new THREE.PMREMGenerator(renderer);
scene.environment = pmremGenerator.fromScene(environment).texture;

renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 2;

let point = new THREE.DirectionalLight(0xffffff, 4);
point.position.set(0, 200, 200);
scene.add(point);

const ambient = new THREE.AmbientLight(0xffffff, 0.26);
scene.add(ambient);

camera.position.set(0, 100, 200);
camera.lookAt(scene.position);

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0xb9d3ff, 1);
camera.aspect = window.innerWidth / window.innerHeight;
camera.updateProjectionMatrix();
renderer.setSize(window.innerWidth, window.innerHeight);
window.addEventListener('resize', onWindowResize);
new OrbitControls(camera, renderer.domElement);

const startButton = document.createElement('button');
startButton.innerText = 'Start';
startButton.id = 'start';

document.getElementById('app').appendChild(renderer.domElement);
document.getElementById('app').appendChild(startButton);

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

animate();

let isStart = false;

startButton.addEventListener('click', () => {
  if (isStart) return;

  const client = new WebSocket('ws://127.0.0.1:8080');
  client.onopen = function () {
    console.log('WebSocket Client Connected');
  };
  client.onmessage = function (e) {
    try {
      const data = JSON.parse(e.data);
      const x = data.x;
      const y = -data.z;
      const z = data.y;
      const theta = Math.atan2(-y, -z);
      const phi = Math.atan2(-x, Math.sqrt(z * z + y * y));
      vase.rotation.z = phi;
      vase.rotation.x = theta;
    } catch (error) {}
  };
});

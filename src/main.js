import * as mqtt from 'mqtt/dist/mqtt';
import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const TAG_IMAGES = [
  'textures/tag51-side.png',
  'textures/tag51-side.png',
  'textures/tag51-top.png',
  'textures/tag51-bottom.png',
  'textures/tag51-side.png',
  'textures/tag51-side.png',
];

function buildTextures(modelImages) {
  const loader = new THREE.TextureLoader();
  return modelImages.map((img) => {
    const texture = loader.load(img);
    texture.generateMipmaps = false;
    return texture;
  });
}

const renderer = new THREE.WebGLRenderer({ antialias: true });
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 1000);
const tagTextures = buildTextures(TAG_IMAGES);
const materials = tagTextures.map((texture) => new THREE.MeshBasicMaterial({ map: texture }));
const geometry = new THREE.BoxGeometry(81.6, 2, 33.4);
const mesh = new THREE.Mesh(geometry, materials);
scene.add(mesh);
const point = new THREE.PointLight(0xffffff);
point.position.set(200, 100, 150);
scene.add(point);
const ambient = new THREE.AmbientLight(0x444444);
scene.add(ambient);
camera.position.set(0, 100, 100);
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

  const client = mqtt.connect('ws://127.0.0.1:8083/mqtt');

  client.subscribe('testtopic/#');

  client.on('message', (topic, message) => {
    const data = JSON.parse(message.toString());
    mesh.rotation.x = data.x * (Math.PI / 180);
    mesh.rotation.y = data.y * (Math.PI / 180);
    mesh.rotation.z = data.z * (Math.PI / 180);
  });
});

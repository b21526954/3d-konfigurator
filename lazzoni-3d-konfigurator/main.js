import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Configuration
const config = {
  baseSize: 60,       // Standard cube size (cm)
  spacing: 5,         // Gap between cubes
  colors: [0x0000ff, 0xFf0000] // Blue and Red
};

// Scene Setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf0f0f0);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(120, 60, 180);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const mainLight = new THREE.DirectionalLight(0xffffff, 0.8);
mainLight.position.set(15, 25, 15);
mainLight.castShadow = true;
scene.add(mainLight);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// Cube System
const cubes = [];

function createCube(width, height, depth, xPosition, colorIndex) {
  const geometry = new THREE.BoxGeometry(width, height, depth);
  const material = new THREE.MeshStandardMaterial({
    color: config.colors[colorIndex % 2],
    roughness: 0.3
  });

  const cube = new THREE.Mesh(geometry, material);
  cube.castShadow = true;
  cube.position.set(
    xPosition + width / 2,
    height / 2,
    0
  );
  
  scene.add(cube);
  return cube;
}

function disposeCube(cube) {
  scene.remove(cube);
  cube.geometry.dispose();
  cube.material.dispose();
}

// UI Controls
const widthSlider = document.getElementById('width');
const heightSlider = document.getElementById('height');
const depthSlider = document.getElementById('depth');

function updateConfig() {
  const width = Math.max(30, parseInt(widthSlider.value));
  const height = Math.max(30, parseInt(heightSlider.value));
  const depth = Math.max(30, parseInt(depthSlider.value));

  // Update displayed values
  document.getElementById('width-value').textContent = width;
  document.getElementById('height-value').textContent = height;
  document.getElementById('depth-value').textContent = depth;

  // Calculate required cubes
  const requiredCubes = Math.ceil(width / config.baseSize);
  let currentX = 0;

  // Update cubes
for (let i = 0; i < requiredCubes; i++) {
    let cubeWidth;
    if (i === requiredCubes - 1) {
        cubeWidth = width - (i * config.baseSize);
    } else {
        cubeWidth = config.baseSize;
    }

    if (i >= cubes.length) {
        cubes.push(createCube(cubeWidth, height, depth, currentX, i));
    } else {
        disposeCube(cubes[i]);
        cubes[i] = createCube(cubeWidth, height, depth, currentX, i);
    }

    let spaceToAdd = 0;
    if (i !== requiredCubes - 1) {
        spaceToAdd = config.spacing;
    }
    currentX += cubeWidth + spaceToAdd;
}

  // Remove extra cubes
  while (cubes.length > requiredCubes) {
    disposeCube(cubes.pop());
  }
}

// Event Listeners
widthSlider.addEventListener('input', updateConfig);
heightSlider.addEventListener('input', updateConfig);
depthSlider.addEventListener('input', updateConfig);

  // Reset sliders
function reset() {
  widthSlider.value = 60;
  heightSlider.value = 60;
  depthSlider.value = 60;
  
  // Update displayed values
  document.getElementById('width-value').textContent = 60;
  document.getElementById('height-value').textContent = 60;
  document.getElementById('depth-value').textContent = 60;
  
  // Rebuild scene
  updateConfig();
}

// Button event
document.getElementById('reset-btn').addEventListener('click', reset);

// Animation Loop
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

// Initialization
updateConfig();
animate();

// Window Resize Handler
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
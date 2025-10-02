import * as THREE from 'three';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import gsap from 'gsap';

const scene = new THREE.Scene();

// ✅ Correct PerspectiveCamera constructor
const camera = new THREE.PerspectiveCamera(
  25,
  window.innerWidth / window.innerHeight, // aspect
  0.1,
  100
);

const loader = new RGBELoader();
loader.load(
  'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/2k/smelting_tower_02_2k.hdr', // make sure file is inside /public
  (texture) => {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    scene.environment = texture;
    //scene.background = texture; // add if you want HDRI visible
  }
);

let spherMesh = []

const radius = 1.3;
const segment = 32;
const orbitRadius = 4.5;
const colors = ["red", "green", "blue", "yellow"];
const textures = ["./public/planets_resources/resources/csilla/color.png", "./public/planets_resources/resources/earth/map.jpg", "./public/planets_resources/resources/venus/map.jpg", "./public/planets_resources/resources/volcanic/color.png"];
const sphereGroup = new THREE.Group();

const starTexture = new THREE.TextureLoader().load("./public/planets_resources/resources/stars.jpg");
const starGeometry = new THREE.SphereGeometry(50, 64, 64);
const starMaterial = new THREE.MeshStandardMaterial({ map: starTexture, opacity: 0.2, side: THREE.BackSide });
const starMesh = new THREE.Mesh(starGeometry, starMaterial);
scene.add(starMesh);



// ✅ Add spheres in circle
for (let i = 0; i < 4; i++) {

  const textureLoader = new THREE.TextureLoader();
  const texture = textureLoader.load(textures[i]);
  texture.colorSpace = THREE.SRGBColorSpace;

  const geometry = new THREE.SphereGeometry(radius, segment, segment);
  const material = new THREE.MeshStandardMaterial({
    map: texture,
    metalness: 0.6,   // makes HDRI reflections visible
    roughness: 0.2
  });
  const mesh = new THREE.Mesh(geometry, material);

  spherMesh.push(mesh)

  const angle = (i / 4) * (Math.PI * 2);
  mesh.position.x = orbitRadius * Math.cos(angle);
  mesh.position.z = orbitRadius * Math.sin(angle)

  sphereGroup.add(mesh);
}
sphereGroup.rotation.x = 0.2;
scene.add(sphereGroup);

camera.position.z = 9;

let lastWheelTime = 0
const throttleDelay = 2000

let scrollCount = 0

function throttleWheelHandler(event) {
  const now = Date.now()
  if (now - lastWheelTime > throttleDelay) {
    lastWheelTime = now
    const direction = event.deltaY > 0 ? "DOWN" : "UP"
    scrollCount = (scrollCount + 1) % 4
    console.log("Scroll count:", scrollCount)

    const headings = document.querySelectorAll(".heading")
    gsap.to(headings, {
      duration: 1,
      y: `-=${100}%`,
      ease: "power2.inOut",
    })

    gsap.to(sphereGroup.rotation, {
      duration: 1,
      y: `-=${Math.PI / 2}`,
      ease: "power2.inOut",
    })
    if (scrollCount === 0) {
      gsap.to(headings, {
        duration: 1,
        y: `0`,
        ease: "power2.inOut",
      })
    }
  }
}

window.addEventListener("wheel", throttleWheelHandler)

const canvas = document.getElementById('canvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// ✅ Animation (rotating group with GSAP)
// setInterval(() => {
//   gsap.to(sphereGroup.rotation, {
//     y: `+=${Math.PI / 2}`,
//     duration: 2,
//     ease: "expo.easeInOut"
//   });
// }, 2500);

const clock = new THREE.Clock();

function animate() {
  
  renderer.setAnimationLoop(animate);
  for (let i = 0; i < spherMesh.length; i++) {
    const sphere = spherMesh[i]
    sphere.rotation.y += clock.getElapsedTime() * 0.0002
  }
  renderer.render(scene, camera);
}

animate()

// ✅ Fix resize issue
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

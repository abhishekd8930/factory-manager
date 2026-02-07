
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

/**
 * 3D Pattern Viewer Module
 * Handles the Three.js scene, geometry generation, and user interaction.
 */

// STATE MANAGEMENT
const State = {
    scene: null,
    camera: null,
    renderer: null,
    controls: null,
    meshes: {
        front: null,
        back: null,
        flap: null,
        box: null
    },
    isInitialized: false,
    reqId: null // Animation frame ID
};

// CONFIGURATION: Measurements provided by user
const PANTS_MEASUREMENTS = {
    "30": { waist: 15, hip: 18, length: 40, bottom: 7 },
    "32": { waist: 16, hip: 19, length: 41, bottom: 7.5 },
    "34": { waist: 17, hip: 20, length: 42, bottom: 8 },
    "36": { waist: 18, hip: 21, length: 43, bottom: 8.5 },
    "38": { waist: 19, hip: 22, length: 44, bottom: 9 },
    // Robust Default
    "default": { waist: 16, hip: 19, length: 41, bottom: 7.5 }
};

/**
 * Initialize the 3D Scene
 */
export function init3DViewer() {
    if (State.isInitialized) return;

    const container = document.getElementById('pattern-canvas');
    if (!container) {
        console.warn("3D Viewer: Container #pattern-canvas not found.");
        return;
    }

    try {
        // 1. Scene Setup
        State.scene = new THREE.Scene();
        State.scene.background = new THREE.Color(0x0f172a); // Slate-900

        // 2. Camera Setup
        const width = container.clientWidth;
        const height = container.clientHeight;
        State.camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
        State.camera.position.set(0, -10, 60);

        // 3. Renderer Setup
        State.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        State.renderer.setSize(width, height);
        State.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Performance opt
        container.appendChild(State.renderer.domElement);

        // 4. Controls
        State.controls = new OrbitControls(State.camera, State.renderer.domElement);
        State.controls.enableDamping = true;
        State.controls.dampingFactor = 0.05;

        // 5. Lighting
        setupLights();

        // 6. Helpers
        const gridHelper = new THREE.GridHelper(100, 100, 0x334155, 0x1e293b);
        gridHelper.rotation.x = Math.PI / 2;
        State.scene.add(gridHelper);

        // 7. Events
        window.addEventListener('resize', onWindowResize);

        // Start Loop
        animate();

        State.isInitialized = true;
        console.log("3D Viewer: Initialized successfully.");

    } catch (e) {
        console.error("3D Viewer: Initialization failed", e);
    }
}

function setupLights() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    State.scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(10, 10, 50);
    State.scene.add(dirLight);
}

function onWindowResize() {
    const container = document.getElementById('pattern-canvas');
    if (!container || !State.camera || !State.renderer) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    State.camera.aspect = width / height;
    State.camera.updateProjectionMatrix();
    State.renderer.setSize(width, height);
}

function animate() {
    State.reqId = requestAnimationFrame(animate);
    if (State.controls) State.controls.update();
    if (State.renderer && State.scene && State.camera) {
        State.renderer.render(State.scene, State.camera);
    }
}

/**
 * Main Render Function
 * @param {string} size - Size key (e.g., "32")
 */
window.render3DPattern = (size = "32") => {
    if (!State.isInitialized) init3DViewer();
    if (!State.scene) return;

    // Cleanup old meshes to prevent memory leaks
    cleanupMeshes();

    // Get measurements
    const dims = PANTS_MEASUREMENTS[size] || PANTS_MEASUREMENTS["default"];

    // Materials (Shared)
    const materials = {
        fabric: new THREE.MeshPhongMaterial({ color: 0x6366f1, side: THREE.DoubleSide, shininess: 30 }),
        back: new THREE.MeshPhongMaterial({ color: 0x94a3b8, side: THREE.DoubleSide, shininess: 30 }),
        component: new THREE.MeshLambertMaterial({ color: 0xe2e8f0, side: THREE.DoubleSide })
    };

    // 1. Generate Front Panel
    State.meshes.front = createPantPanel(dims, materials.fabric);
    State.meshes.front.position.set(-10, 20, 0);
    State.scene.add(State.meshes.front);

    // 2. Generate Back Panel (Wider)
    const backDims = {
        waist: dims.waist + 2,
        hip: dims.hip + 2,
        length: dims.length,
        bottom: dims.bottom + 1
    };
    State.meshes.back = createPantPanel(backDims, materials.back);
    State.meshes.back.position.set(10, 20, -5);
    State.scene.add(State.meshes.back);

    // 3. Generate Components
    createComponents(dims, materials.fabric, materials.component);

    // Initial Update
    update3DScene();
};

function cleanupMeshes() {
    ['front', 'back', 'flap', 'box'].forEach(key => {
        const mesh = State.meshes[key];
        if (mesh) {
            State.scene.remove(mesh);
            if (mesh.geometry) mesh.geometry.dispose();
            if (mesh.material) {
                if (Array.isArray(mesh.material)) mesh.material.forEach(m => m.dispose());
                else mesh.material.dispose();
            }
            State.meshes[key] = null;
        }
    });
}

function createPantPanel(d, material) {
    const shape = new THREE.Shape();

    // 1. Waist (Start Top Left)
    shape.moveTo(-d.waist / 2, 0);
    shape.lineTo(d.waist / 2, 0);

    // 2. Right Side (Waist -> Hip -> Bottom)
    // Hip Point (Approx 8 units down)
    const hipY = -8;
    shape.lineTo(d.hip / 2, hipY);

    // Leg Bottom
    shape.lineTo(d.bottom / 2, -d.length);

    // 3. Bottom Hem
    shape.lineTo(-d.bottom / 2, -d.length);

    // 4. Inseam (Bottom -> Crotch)
    // Crotch Point (Approx 12 units down, narrower than hip)
    const crotchY = -12;
    shape.lineTo(-d.hip / 2, crotchY);

    // 5. Crotch Curve (Back to Start)
    shape.lineTo(-d.waist / 2, 0);

    // Ensure shape is closed
    shape.closePath();

    const geometry = new THREE.ShapeGeometry(shape);
    return new THREE.Mesh(geometry, material);
}

function createComponents(d, fabricMat, componentMat) {
    // Box Pocket
    const boxGeo = new THREE.PlaneGeometry(d.waist / 2.5, 6);
    State.meshes.box = new THREE.Mesh(boxGeo, fabricMat); // Match fabric color
    State.meshes.box.position.set(10, 10, -4.9);
    State.meshes.box.visible = false;
    State.scene.add(State.meshes.box);

    // Flap
    const flapGeo = new THREE.PlaneGeometry(d.waist / 2.5, 2);
    State.meshes.flap = new THREE.Mesh(flapGeo, componentMat); // Contrast color
    State.meshes.flap.position.set(10, 14, -4.8);
    State.meshes.flap.visible = false;
    State.scene.add(State.meshes.flap);
}

/**
 * Toggle Visibility based on UI Inputs
 */
window.update3DScene = () => {
    const showFlap = document.getElementById('chk-3d-flap')?.checked;
    const showBox = document.getElementById('chk-3d-box')?.checked;

    if (State.meshes.flap) State.meshes.flap.visible = !!showFlap;
    if (State.meshes.box) State.meshes.box.visible = !!showBox;
};

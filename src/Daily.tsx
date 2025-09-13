import { Canvas } from '@react-three/fiber';
import "./index.css";
import { OrbitControls, Text, Box, Sphere, Environment, ContactShadows } from '@react-three/drei';
import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useNavigate } from 'react-router-dom';
import * as THREE from 'three';

function RubiksCube() {
    const groupRef = useRef<THREE.Group>(null);
    const [removedSpheres, setRemovedSpheres] = useState<Set<string>>(new Set());
    const [removedCubes, setRemovedCubes] = useState<Set<string>>(new Set());

    useFrame((state) => {
        if (groupRef.current) {
            // groupRef.current.rotation.y = state.clock.elapsedTime * 0.3;
            // groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
        }
    });

    const handleSphereClick = (sphereId: string, cubeId: string) => {
        setRemovedSpheres(prev => new Set([...prev, sphereId]));
        
        // Check if all spheres on this cube are removed
        const cubeSpheres = getCubeSpheres(cubeId);
        const remainingSpheres = cubeSpheres.filter(id => !removedSpheres.has(id) && id !== sphereId);
        
        
        if (remainingSpheres.length === 0) {
            setRemovedCubes(prev => new Set([...prev, cubeId]));
        }
    };

    const getCubeSpheres = (cubeId: string) => {
        const [x, y, z] = cubeId.split('-').map(Number);
        const spheres = [];
        
        // Only add sphere IDs for outer faces (same logic as InteractiveCube)
        if (z === 2) spheres.push(`${cubeId}-front`);
        if (z === 0) spheres.push(`${cubeId}-back`);
        if (x === 0) spheres.push(`${cubeId}-left`);
        if (x === 2) spheres.push(`${cubeId}-right`);
        if (y === 2) spheres.push(`${cubeId}-top`);
        if (y === 0) spheres.push(`${cubeId}-bottom`);
        
        return spheres;
    };

    // Create a 3x3x3 Rubik's cube
    const cubeSize = 0.6;
    const gap = 0.1;
    const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff8800', '#ffffff'];

    const cubes = [];
    for (let x = 0; x < 3; x++) {
        for (let y = 0; y < 3; y++) {
            for (let z = 0; z < 3; z++) {
                const cubeId = `${x}-${y}-${z}`;
                const position: [number, number, number] = [
                    (x - 1) * (cubeSize + gap),
                    (y - 1) * (cubeSize + gap),
                    (z - 1) * (cubeSize + gap)
                ];

                if (removedCubes.has(cubeId)) continue;

                cubes.push(
                    <InteractiveCube
                        key={cubeId}
                        position={position}
                        size={cubeSize}
                        color={colors[(x + y + z) % colors.length]}
                        cubeId={cubeId}
                        removedSpheres={removedSpheres}
                        onSphereClick={handleSphereClick}
                    />
                );
            }
        }
    }

    return (
        <group ref={groupRef}>
            {cubes}
        </group>
    );
}

function InteractiveCube({ position, size, color, cubeId, removedSpheres, onSphereClick }: {
    position: [number, number, number];
    size: number;
    color: string;
    cubeId: string;
    removedSpheres: Set<string>;
    onSphereClick: (sphereId: string, cubeId: string) => void;
}) {
    const sphereRadius = size * 0.15;
    const sphereOffset = size * 0.6;
    const [x, y, z] = cubeId.split('-').map(Number);

    // Only add spheres on outer faces (faces that are not touching other cubes)
    const faces = [];
    
    // Front face (z = 2)
    if (z === 2) {
        faces.push({ id: 'front', position: [0, 0, sphereOffset] as [number, number, number] });
    }
    
    // Back face (z = 0)
    if (z === 0) {
        faces.push({ id: 'back', position: [0, 0, -sphereOffset] as [number, number, number] });
    }
    
    // Left face (x = 0)
    if (x === 0) {
        faces.push({ id: 'left', position: [-sphereOffset, 0, 0] as [number, number, number] });
    }
    
    // Right face (x = 2)
    if (x === 2) {
        faces.push({ id: 'right', position: [sphereOffset, 0, 0] as [number, number, number] });
    }
    
    // Top face (y = 2)
    if (y === 2) {
        faces.push({ id: 'top', position: [0, sphereOffset, 0] as [number, number, number] });
    }
    
    // Bottom face (y = 0)
    if (y === 0) {
        faces.push({ id: 'bottom', position: [0, -sphereOffset, 0] as [number, number, number] });
    }

    const sphereColors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#f0932b', '#eb4d4b'];

    return (
        <group position={position}>
            <Box args={[size, size, size]}>
                <meshStandardMaterial color={color} />
            </Box>
            
            {faces.map((face, index) => {
                const sphereId = `${cubeId}-${face.id}`;
                if (removedSpheres.has(sphereId)) return null;
                
                return (
                    <Sphere
                        key={sphereId}
                        position={face.position}
                        args={[sphereRadius, 16, 16]}
                        onClick={() => onSphereClick(sphereId, cubeId)}
                    >
                        <meshStandardMaterial color={sphereColors[index % sphereColors.length]} />
                    </Sphere>
                );
            })}
        </group>
    );
}


function Scene() {
    return (
        <>
            {/* Lighting */}
            <ambientLight intensity={0.4} />
            <directionalLight position={[10, 10, 5]} intensity={1} />
            <pointLight position={[-10, -10, -10]} intensity={0.5} color="#6aaa64" />
            <pointLight position={[10, 10, 10]} intensity={0.5} color="#c9b458" />

            {/* Environment */}
            <Environment preset="sunset" />
            <ContactShadows opacity={0.4} scale={10} blur={2} far={4.5} />

            {/* 3D Text */}
            <Text
                position={[0, 3, 0]}
                fontSize={1}
                color="#6aaa64"
                anchorX="center"
                anchorY="middle"
            // font="/fonts/helvetiker_regular.typeface.json"
            >
                SCREWDLE
            </Text>

            {/* Rubik's Cube */}
            <RubiksCube />

            {/* Ground plane */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3, 0]}>
                <planeGeometry args={[20, 20]} />
                <meshStandardMaterial color="#f5f7fa" transparent opacity={0.3} />
            </mesh>
        </>
    );
}

export function Daily() {
    const navigate = useNavigate();
    const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

    useEffect(() => {
        const updateSize = () => {
            setCanvasSize({
                width: window.innerWidth - 40,
                height: window.innerHeight - 40
            });
        };

        updateSize();
        window.addEventListener('resize', updateSize);
        return () => window.removeEventListener('resize', updateSize);
    }, []);

    return (
        <div className="flex w-full h-full flex-col min-h-screen rounded-3xl text-center p-5">
        
            <div 
                id="canvas-container" 
                className="flex-grow w-full h-full rounded-2xl overflow-hidden shadow-game border-2 border-border bg-gradient-to-br from-indigo-500 to-purple-600"
            >
                <Canvas
                    camera={{ position: [0, 0, 8], fov: 60 }}
                    style={{ 
                        width: canvasSize.width || '100%', 
                        height: canvasSize.height|| '100%', 
                        borderRadius: '16px' 
                    }}
                >

                    <Scene />
                    <OrbitControls
                        enablePan={true}
                        enableZoom={true}
                        enableRotate={true}
                        minDistance={5}
                        maxDistance={15}
                    />
                </Canvas>
            </div>



        </div>
    );
}

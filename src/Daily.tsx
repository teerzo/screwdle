import { Canvas } from '@react-three/fiber';
import "./index.css";
import { OrbitControls, Text, Box, Sphere, Environment, ContactShadows } from '@react-three/drei';
import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function FloatingCube({ position, color, speed = 1 }: { position: [number, number, number], color: string, speed?: number }) {
    const meshRef = useRef<THREE.Mesh>(null);
    const [hovered, setHovered] = useState(false);

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.x += 0.01 * speed;
            meshRef.current.rotation.y += 0.01 * speed;
            meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * speed) * 0.5;
        }
    });

    return (
        <Box
            ref={meshRef}
            position={position}
            scale={hovered ? 1.2 : 1}
            onPointerOver={() => setHovered(true)}
            onPointerOut={() => setHovered(false)}
        >
            <meshStandardMaterial color={color} />
        </Box>
    );
}

function RotatingSphere({ position, color }: { position: [number, number, number], color: string }) {
    const meshRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.x = state.clock.elapsedTime * 0.5;
            meshRef.current.rotation.y = state.clock.elapsedTime * 0.3;
        }
    });

    return (
        <Sphere ref={meshRef} position={position} args={[0.5, 32, 32]}>
            <meshStandardMaterial color={color} />
        </Sphere>
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

            {/* Floating Cubes representing letters */}
            <FloatingCube position={[-2, 0, 0]} color="#6aaa64" speed={1} />
            <FloatingCube position={[-1, 0, 0]} color="#c9b458" speed={1.2} />
            <FloatingCube position={[0, 0, 0]} color="#787c7e" speed={0.8} />
            <FloatingCube position={[1, 0, 0]} color="#6aaa64" speed={1.1} />
            <FloatingCube position={[2, 0, 0]} color="#c9b458" speed={0.9} />

            {/* Rotating Spheres */}
            <RotatingSphere position={[-3, 2, -2]} color="#6aaa64" />
            <RotatingSphere position={[3, 2, -2]} color="#c9b458" />
            <RotatingSphere position={[0, -2, 2]} color="#787c7e" />

            {/* Ground plane */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3, 0]}>
                <planeGeometry args={[20, 20]} />
                <meshStandardMaterial color="#f5f7fa" transparent opacity={0.3} />
            </mesh>
        </>
    );
}

export function Daily() {
    const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const updateSize = () => {
            if (containerRef.current) {
                const rect = containerRef.current.getBoundingClientRect();
                setCanvasSize({
                    width: rect.width,
                    height: rect.height
                });
            }
        };

        updateSize();
        window.addEventListener('resize', updateSize);
        return () => window.removeEventListener('resize', updateSize);
    }, []);

    return (
        <div className="flex w-full h-full flex-col min-h-screen rounded-3xl  text-center p-5">



            {/* <div className="w-full flex-grow bg-red-500">

                TEST
            </div> */}


            {/* <div className="mb-10">
                    <h1 className="text-6xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent tracking-wider">
                        DAILY SCREWDLE
                    </h1>
                    <p className="text-lg text-tertiary font-normal">3D Word Challenge Experience</p>
                </div> */}

            {/* <div id="canvas-container" className="flex-grow w-full h-full my-5 rounded-2xl overflow-hidden shadow-game border-2 border-border bg-gradient-to-br from-indigo-500 to-purple-600"> */}
            <div 
                ref={containerRef}
                id="canvas-container" 
                className="flex-grow w-full h-full rounded-2xl overflow-hidden shadow-game border-2 border-border bg-gradient-to-br from-indigo-500 to-purple-600"
            >
                <Canvas
                    camera={{ position: [0, 0, 15], fov: 60 }}
                    style={{ 
                        width: canvasSize.width || '100%', 
                        height: canvasSize.height || '100%', 
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

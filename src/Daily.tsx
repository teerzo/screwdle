import { Canvas, useThree } from '@react-three/fiber';
import "./index.css";
import { OrbitControls, Text, Box, Environment, ContactShadows } from '@react-three/drei';
import { Physics, RigidBody } from '@react-three/rapier';
import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useNavigate } from 'react-router-dom';
import * as THREE from 'three';

interface PhysicsScrewData {
    id: string;
    position: [number, number, number];
    rotation: [number, number, number];
    direction: [number, number, number];
    color: string;
}

interface PhysicsCubeData {
    id: string;
    position: [number, number, number];
    size: number;
    color: string;
}

function RubiksCube() {
    const groupRef = useRef<THREE.Group>(null);
    const [removedSpheres, setRemovedSpheres] = useState<Set<string>>(new Set());
    const [removedCubes, setRemovedCubes] = useState<Set<string>>(new Set());
    const [animatingSpheres, setAnimatingSpheres] = useState<Set<string>>(new Set());
    const [physicsScrews, setPhysicsScrews] = useState<PhysicsScrewData[]>([]);
    const [physicsCubes, setPhysicsCubes] = useState<PhysicsCubeData[]>([]);
    const physicsScrewCounter = useRef(0);
    const physicsCubeCounter = useRef(0);
    const animatingSpheresRef = useRef<Set<string>>(new Set());
    const removedSpheresRef = useRef<Set<string>>(new Set());
    const pendingPhysicsScrewsRef = useRef<Set<string>>(new Set());
    const pendingPhysicsCubesRef = useRef<Set<string>>(new Set());
    const removedCubesRef = useRef<Set<string>>(new Set());

    useFrame((state) => {
        if (groupRef.current) {
            // groupRef.current.rotation.y = state.clock.elapsedTime * 0.3;
            // groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
        }
    });

    // Sync refs with state
    useEffect(() => {
        animatingSpheresRef.current = animatingSpheres;
    }, [animatingSpheres]);
    
    useEffect(() => {
        removedSpheresRef.current = removedSpheres;
    }, [removedSpheres]);
    
    useEffect(() => {
        removedCubesRef.current = removedCubes;
    }, [removedCubes]);

    const handleSphereClick = (sphereId: string, cubeId: string, position: [number, number, number], rotation: [number, number, number], direction: [number, number, number], color: string) => {
        // Only allow the first screw to animate - ignore if any animation is already in progress
        if (animatingSpheresRef.current.size > 0) {
            return;
        }
        
        // Prevent clicking if already animating or removed (check refs for synchronous check)
        if (animatingSpheresRef.current.has(sphereId) || removedSpheresRef.current.has(sphereId)) {
            return;
        }
        
        // Mark as animating immediately in ref
        animatingSpheresRef.current.add(sphereId);
        
        // Start animation
        setAnimatingSpheres(prev => new Set([...prev, sphereId]));
        
        // After 1 second, remove the screw and spawn physics version
        setTimeout(() => {
            // Double-check the screw hasn't been removed by another click (check ref)
            if (removedSpheresRef.current.has(sphereId)) {
                // Already removed, just clean up animation state
                setAnimatingSpheres(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(sphereId);
                    return newSet;
                });
                animatingSpheresRef.current.delete(sphereId);
                pendingPhysicsScrewsRef.current.delete(sphereId);
                return;
            }
            
            // Check if physics screw is already pending for this sphereId
            if (pendingPhysicsScrewsRef.current.has(sphereId)) {
                // Physics screw already scheduled, don't create another
                setAnimatingSpheres(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(sphereId);
                    return newSet;
                });
                animatingSpheresRef.current.delete(sphereId);
                return;
            }
            
            // Mark as pending
            pendingPhysicsScrewsRef.current.add(sphereId);
            
            setRemovedSpheres(prev => {
                // Double-check again in state
                if (prev.has(sphereId)) return prev;
                const newRemoved = new Set([...prev, sphereId]);
                removedSpheresRef.current = newRemoved;
                
                // Check if all spheres on this cube are removed
                const cubeSpheres = getCubeSpheres(cubeId);
                const remainingSpheres = cubeSpheres.filter(id => !newRemoved.has(id));
                if (remainingSpheres.length === 0) {
                    // Check if physics cube is already pending or cube is already removed (synchronous check)
                    if (pendingPhysicsCubesRef.current.has(cubeId) || removedCubesRef.current.has(cubeId)) {
                        // Physics cube already scheduled or cube already removed, don't create another
                        return newRemoved;
                    }
                    
                    // Mark as pending immediately
                    pendingPhysicsCubesRef.current.add(cubeId);
                    
                    // Mark cube as removed
                    setRemovedCubes(prevCubes => {
                        if (prevCubes.has(cubeId)) {
                            // Already removed, clean up pending flag
                            pendingPhysicsCubesRef.current.delete(cubeId);
                            return prevCubes;
                        }
                        const newRemovedCubes = new Set([...prevCubes, cubeId]);
                        removedCubesRef.current = newRemovedCubes;
                        return newRemovedCubes;
                    });
                    
                    // Convert cube to physics cube
                    // Get cube position and color from cubeId
                    const cubeIdParts = cubeId.split('-').map(Number);
                    const x = cubeIdParts[0] ?? 0;
                    const y = cubeIdParts[1] ?? 0;
                    const z = cubeIdParts[2] ?? 0;
                    const cubeSize = 0.6;
                    const gap = 0.1;
                    const cubePosition: [number, number, number] = [
                        (x - 1) * (cubeSize + gap),
                        (y - 1) * (cubeSize + gap),
                        (z - 1) * (cubeSize + gap)
                    ];
                    const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff8800', '#ffffff'];
                    const cubeColor = colors[(x + y + z) % colors.length] || '#ffffff';
                    
                    physicsCubeCounter.current += 1;
                    const uniqueCubeId = `${cubeId}-physics-${physicsCubeCounter.current}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                    
                    setPhysicsCubes(prev => {
                        // Deduplicate: check if a cube with this cubeId already exists
                        const existingCube = prev.find(c => c.id.startsWith(`${cubeId}-physics-`));
                        if (existingCube) {
                            // Don't add duplicate, clean up pending flag
                            pendingPhysicsCubesRef.current.delete(cubeId);
                            return prev;
                        }
                        
                        // Remove from pending after successful creation
                        pendingPhysicsCubesRef.current.delete(cubeId);
                        
                        return [...prev, {
                            id: uniqueCubeId,
                            position: cubePosition,
                            size: cubeSize,
                            color: cubeColor
                        }];
                    });
                }
                
                return newRemoved;
            });
            
            setAnimatingSpheres(prev => {
                const newSet = new Set(prev);
                newSet.delete(sphereId);
                animatingSpheresRef.current = newSet;
                return newSet;
            });
            
            // Calculate final position after animation (outward movement)
            const maxOutwardDistance = 0.3;
            const finalPosition: [number, number, number] = [
                position[0] + direction[0] * maxOutwardDistance,
                position[1] + direction[1] * maxOutwardDistance,
                position[2] + direction[2] * maxOutwardDistance
            ];
            
            // Spawn physics screw with unique ID and deduplication
            physicsScrewCounter.current += 1;
            const uniqueId = `${sphereId}-physics-${physicsScrewCounter.current}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            
            setPhysicsScrews(prev => {
                // Deduplicate: check if a screw with the exact same ID already exists (shouldn't happen, but safety check)
                const existingScrew = prev.find(s => s.id === uniqueId);
                if (existingScrew) {
                    // Don't add duplicate, clean up pending flag
                    pendingPhysicsScrewsRef.current.delete(sphereId);
                    return prev;
                }
                
                // Remove from pending after successful creation
                pendingPhysicsScrewsRef.current.delete(sphereId);
                
                return [...prev, {
                    id: uniqueId,
                    position: finalPosition,
                    rotation: rotation,
                    direction: direction,
                    color: color
                }];
            });
        }, 200);
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
                        color={colors[(x + y + z) % colors.length] || '#ffffff'}
                        cubeId={cubeId}
                        removedSpheres={removedSpheres}
                        animatingSpheres={animatingSpheres}
                        onSphereClick={handleSphereClick}
                    />
                );
            }
        }
    }

    return (
        <group ref={groupRef} position={[0, 1, 0]}>
            {cubes}
            {/* Render physics screws */}
            {physicsScrews.map((screw) => (
                <PhysicsScrew
                    key={screw.id}
                    position={screw.position}
                    rotation={screw.rotation}
                    color={screw.color}
                />
            ))}
            {/* Render physics cubes */}
            {physicsCubes.map((cube) => (
                <PhysicsCube
                    key={cube.id}
                    position={cube.position}
                    size={cube.size}
                    color={cube.color}
                />
            ))}
        </group>
    );
}

function Screw({ position, rotation, direction, color, onClick, isAnimating }: {
    position: [number, number, number];
    rotation: [number, number, number];
    direction: [number, number, number];
    color: string;
    onClick: () => void;
    isAnimating: boolean;
}) {
    const outerGroupRef = useRef<THREE.Group>(null);
    const innerGroupRef = useRef<THREE.Group>(null);
    const animationStartTime = useRef<number | null>(null);
    const initialPosition = useRef<[number, number, number]>(position);
    const screwLength = 0.15;
    const screwRadius = 0.03;
    const headRadius = 0.06;
    const headHeight = 0.04;
    const maxOutwardDistance = 0.3; // How far the screw moves outward

    // Reset initial position when position changes
    useEffect(() => {
        initialPosition.current = position;
    }, [position]);
    
    const handleClick = (event: any) => {
        event.stopPropagation();
        
        // React Three Fiber's onClick already handles raycasting and only fires
        // if this object is the first thing hit. Since we've disabled raycasting
        // on the cube's Box, this should work correctly. But we can add an extra
        // check to be sure by verifying the event target.
        
        // Verify that the clicked object is part of this screw
        if (event.object && outerGroupRef.current) {
            // Check if the clicked object is a child of this screw's group
            let currentParent: THREE.Object3D | null = event.object.parent;
            while (currentParent) {
                if (currentParent === outerGroupRef.current) {
                    onClick();
                    return;
                }
                currentParent = currentParent.parent;
            }
        }
    };

    useFrame((state) => {
        if (outerGroupRef.current && innerGroupRef.current && isAnimating) {
            if (animationStartTime.current === null) {
                animationStartTime.current = state.clock.elapsedTime;
            }
            
            const elapsed = state.clock.elapsedTime - animationStartTime.current;
            const duration = 1.0; // 1 second
            
            if (elapsed < duration) {
                const progress = elapsed / duration;
                
                // Rotate the screw around its local Y axis (the axis it's built along)
                // Multiple full rotations to simulate unscrewing
                const rotations = 3; // Number of full rotations
                innerGroupRef.current.rotation.y = progress * rotations * Math.PI * 2;
                
                // Move the screw outward along its direction vector
                const outwardDistance = progress * maxOutwardDistance;
                outerGroupRef.current.position.set(
                    initialPosition.current[0] + direction[0] * outwardDistance,
                    initialPosition.current[1] + direction[1] * outwardDistance,
                    initialPosition.current[2] + direction[2] * outwardDistance
                );
            } else {
                // Animation complete, reset
                innerGroupRef.current.rotation.y = 0;
                outerGroupRef.current.position.set(
                    initialPosition.current[0],
                    initialPosition.current[1],
                    initialPosition.current[2]
                );
            }
        } else if (!isAnimating && outerGroupRef.current && innerGroupRef.current) {
            animationStartTime.current = null;
            // Reset rotation and position
            innerGroupRef.current.rotation.y = 0;
            outerGroupRef.current.position.set(
                initialPosition.current[0],
                initialPosition.current[1],
                initialPosition.current[2]
            );
        }
    });

    return (
        <group ref={outerGroupRef} position={initialPosition.current} rotation={rotation} onClick={handleClick}>
            <group ref={innerGroupRef}>
                {/* Screw head (wider cylinder) */}
                <mesh position={[0, headHeight / 2, 0]}>
                    <cylinderGeometry args={[headRadius, headRadius, headHeight, 16]} />
                    <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
                </mesh>
                
                {/* Screw head edge (torus for rounded edge) */}
                {/* <mesh position={[0, headHeight, 0]}>
                    <torusGeometry args={[headRadius, 0.01, 8, 16]} />
                    <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
                </mesh> */}
                
                {/* Screw shaft (main cylinder) */}
                <mesh position={[0, -screwLength / 2 + headHeight, 0]}>
                    <cylinderGeometry args={[screwRadius, screwRadius, screwLength, 16]} />
                    <meshStandardMaterial color={color} metalness={0.7} roughness={0.3} />
                </mesh>
                
                {/* Threads - create spiral pattern using multiple small toruses */}
                {Array.from({ length: 6 }).map((_, i) => {
                    const yPos = -screwLength / 2 + headHeight + (i / 6) * screwLength;
                    return (
                        <mesh key={i} position={[0, yPos, 0]} rotation={[Math.PI / 2, (i * Math.PI) / 3, 0]}>
                            <torusGeometry args={[screwRadius * 1.05, 0.008, 8, 16]} />
                            <meshStandardMaterial color={color} metalness={0.6} roughness={0.4} />
                        </mesh>
                    );
                })}
            </group>
        </group>
    );
}

function PhysicsScrew({ position, rotation, color }: {
    position: [number, number, number];
    rotation: [number, number, number];
    color: string;
}) {
    const rigidBodyRef = useRef<any>(null);
    const screwLength = 0.15;
    const screwRadius = 0.03;
    const headRadius = 0.06;
    const headHeight = 0.04;

    useEffect(() => {
        if (rigidBodyRef.current) {
            // Generate random force direction
            const forceMagnitude = 20 + Math.random() * 3; // Random force between 2-5
            const forceX = (Math.random() - 0.5) * forceMagnitude;
            const forceY = Math.random() * forceMagnitude * 0.5; // Slight upward bias
            const forceZ = (Math.random() - 0.5) * forceMagnitude;
            
            // Apply impulse (instantaneous force)
            rigidBodyRef.current.applyImpulse(
                { x: forceX, y: forceY, z: forceZ },
                true
            );
            
            // Also apply random angular impulse for spinning
            const angularMagnitude = 1 + Math.random() * 2;
            const angularX = (Math.random() - 0.5) * angularMagnitude;
            const angularY = (Math.random() - 0.5) * angularMagnitude;
            const angularZ = (Math.random() - 0.5) * angularMagnitude;
            
            rigidBodyRef.current.applyTorqueImpulse(
                { x: angularX, y: angularY, z: angularZ },
                true
            );
        }
    }, []);

    return (
        <RigidBody
            ref={rigidBodyRef}
            position={position}
            rotation={rotation}
            colliders="hull"
            gravityScale={1}
            restitution={0.4}
            friction={0.6}
            linearDamping={0.5}
            angularDamping={0.5}
        >
            <group>
                {/* Screw head (wider cylinder) */}
                <mesh position={[0, headHeight / 2, 0]}>
                    <cylinderGeometry args={[headRadius, headRadius, headHeight, 16]} />
                    <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
                </mesh>
                
                {/* Screw shaft (main cylinder) */}
                <mesh position={[0, -screwLength / 2 + headHeight, 0]}>
                    <cylinderGeometry args={[screwRadius, screwRadius, screwLength, 16]} />
                    <meshStandardMaterial color={color} metalness={0.7} roughness={0.3} />
                </mesh>
                
                {/* Threads - create spiral pattern using multiple small toruses */}
                {Array.from({ length: 6 }).map((_, i) => {
                    const yPos = -screwLength / 2 + headHeight + (i / 6) * screwLength;
                    return (
                        <mesh key={i} position={[0, yPos, 0]} rotation={[Math.PI / 2, (i * Math.PI) / 3, 0]}>
                            <torusGeometry args={[screwRadius * 1.05, 0.008, 8, 16]} />
                            <meshStandardMaterial color={color} metalness={0.6} roughness={0.4} />
                        </mesh>
                    );
                })}
            </group>
        </RigidBody>
    );
}

function PhysicsCube({ position, size, color }: {
    position: [number, number, number];
    size: number;
    color: string;
}) {
    const rigidBodyRef = useRef<any>(null);
    const { camera } = useThree();
    
    const handleClick = (event: any) => {
        event.stopPropagation();
        
        if (rigidBodyRef.current) {
            // Get camera position
            const cameraPos = new THREE.Vector3();
            camera.getWorldPosition(cameraPos);
            
            // Calculate direction from camera to cube
            const direction = new THREE.Vector3(
                position[0] - cameraPos.x,
                position[1] - cameraPos.y,
                position[2] - cameraPos.z
            );
            
            // Normalize the direction
            direction.normalize();
            
            // Apply force magnitude
            const forceMagnitude = 1 + Math.random() * 1; // Random force between 20-30
            
            // Apply impulse in the direction from camera to cube
            rigidBodyRef.current.applyImpulse(
                {
                    x: direction.x * forceMagnitude,
                    y: direction.y * forceMagnitude,
                    z: direction.z * forceMagnitude
                },
                true
            );
            
            // Also apply some random angular impulse for spinning
            const angularMagnitude = 2 + Math.random() * 3;
            const angularX = (Math.random() - 0.5) * angularMagnitude;
            const angularY = (Math.random() - 0.5) * angularMagnitude;
            const angularZ = (Math.random() - 0.5) * angularMagnitude;
            
            rigidBodyRef.current.applyTorqueImpulse(
                { x: angularX, y: angularY, z: angularZ },
                true
            );
        }
    };

    useEffect(() => {
        if (rigidBodyRef.current) {
            // Calculate direction from center (0, 0, 0) to cube position for outward force
            const distance = Math.sqrt(position[0] ** 2 + position[1] ** 2 + position[2] ** 2);
            let directionX = 0;
            let directionY = 0;
            let directionZ = 0;
            
            if (distance > 0) {
                // Normalize direction vector
                directionX = position[0] / distance;
                directionY = position[1] / distance;
                directionZ = position[2] / distance;
            } else {
                // If at center, use random direction
                const angle = Math.random() * Math.PI * 2;
                directionX = Math.cos(angle);
                directionZ = Math.sin(angle);
                directionY = (Math.random() - 0.5) * 0.5;
            }
            
            // Generate force magnitude - stronger for cubes shooting out
            const forceMagnitude = 15 + Math.random() * 10; // Random force between 15-25
            
            // Apply force in outward direction with some randomness
            const randomFactor = 0.3; // 30% randomness
            const forceX = directionX * forceMagnitude + (Math.random() - 0.5) * forceMagnitude * randomFactor;
            const forceY = directionY * forceMagnitude + Math.random() * forceMagnitude * 0.2; // Slight upward bias
            const forceZ = directionZ * forceMagnitude + (Math.random() - 0.5) * forceMagnitude * randomFactor;
            
            // Apply impulse (instantaneous force)
            rigidBodyRef.current.applyImpulse(
                { x: forceX, y: forceY, z: forceZ },
                true
            );
            
            // Also apply random angular impulse for spinning
            const angularMagnitude = 3 + Math.random() * 4; // Stronger spin
            const angularX = (Math.random() - 0.5) * angularMagnitude;
            const angularY = (Math.random() - 0.5) * angularMagnitude;
            const angularZ = (Math.random() - 0.5) * angularMagnitude;
            
            rigidBodyRef.current.applyTorqueImpulse(
                { x: angularX, y: angularY, z: angularZ },
                true
            );
        }
    }, [position]);

    return (
        <RigidBody
            ref={rigidBodyRef}
            position={position}
            colliders="cuboid"
            gravityScale={1}
            restitution={0.3}
            friction={0.7}
            linearDamping={0.4}
            angularDamping={0.4}
        >
            <Box 
                args={[size, size, size]} 
                onClick={handleClick}
                onPointerOver={(e) => {
                    e.stopPropagation();
                    document.body.style.cursor = 'pointer';
                }}
                onPointerOut={() => {
                    document.body.style.cursor = 'default';
                }}
            >
                <meshStandardMaterial color={color} />
            </Box>
        </RigidBody>
    );
}

function InteractiveCube({ position, size, color, cubeId, removedSpheres, animatingSpheres, onSphereClick }: {
    position: [number, number, number];
    size: number;
    color: string;
    cubeId: string;
    removedSpheres: Set<string>;
    animatingSpheres: Set<string>;
    onSphereClick: (sphereId: string, cubeId: string, worldPosition: [number, number, number], rotation: [number, number, number], direction: [number, number, number], color: string) => void;
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

    const screwColors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#f0932b', '#eb4d4b'];

    // Get rotation for each face to orient the screw correctly
    // Screw is built along Y-axis, so we rotate to point in the correct direction
    const getRotation = (faceId: string): [number, number, number] => {
        switch (faceId) {
            case 'front': return [Math.PI / 2, 0, 0]; // Screw pointing forward (Z+)
            case 'back': return [-Math.PI / 2, 0, 0]; // Screw pointing backward (Z-)
            case 'left': return [0, 0, Math.PI / 2]; // Screw pointing left (X-)
            case 'right': return [0, 0, -Math.PI / 2]; // Screw pointing right (X+)
            case 'top': return [0, 0, 0]; // Screw pointing up (Y+)
            case 'bottom': return [Math.PI, 0, 0]; // Screw pointing down (Y-)
            default: return [0, 0, 0];
        }
    };

    // Get direction vector for outward movement
    const getDirection = (facePos: [number, number, number]): [number, number, number] => {
        // Normalize the position to get direction (it's already on a unit sphere essentially)
        const length = Math.sqrt(facePos[0] ** 2 + facePos[1] ** 2 + facePos[2] ** 2);
        if (length === 0) return [0, 0, 1];
        return [facePos[0] / length, facePos[1] / length, facePos[2] / length];
    };

    return (
        <group position={position}>
            <RigidBody
                type="fixed"
                position={[0, 0, 0]}
                colliders="cuboid"
                restitution={0.3}
                friction={0.7}
            >
                <Box 
                    args={[size, size, size]}
                    raycast={() => {}}
                >
                    <meshStandardMaterial color={color} />
                </Box>
            </RigidBody>
            
            {faces.map((face, index) => {
                const sphereId = `${cubeId}-${face.id}`;
                if (removedSpheres.has(sphereId)) return null;
                
                const faceRotation = getRotation(face.id);
                const faceDirection = getDirection(face.position);
                const faceColor = screwColors[index % screwColors.length] || '#ff6b6b';
                
                // Calculate world position (cube position + face offset)
                const worldPosition: [number, number, number] = [
                    position[0] + face.position[0],
                    position[1] + face.position[1],
                    position[2] + face.position[2]
                ];
                
                return (
                    <Screw
                        key={sphereId}
                        position={face.position}
                        rotation={faceRotation}
                        direction={faceDirection}
                        color={faceColor}
                        onClick={() => onSphereClick(sphereId, cubeId, worldPosition, faceRotation, faceDirection, faceColor)}
                        isAnimating={animatingSpheres.has(sphereId)}
                    />
                );
            })}
        </group>
    );
}


function Scene() {
    return (
        <Physics gravity={[0, -9.81, 0]}>
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

            {/* Ground plane with physics */}
            <RigidBody type="fixed" position={[0, -5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <mesh>
                    <planeGeometry args={[100, 100]} />
                    <meshStandardMaterial color="#f5f7fa" transparent opacity={0.3} />
                </mesh>
            </RigidBody>
        </Physics>
    );
}

export function Daily() {
    const navigate = useNavigate();
    const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const updateSize = () => {
            setCanvasSize({
                width: window.innerWidth,
                height: window.innerHeight
            });
        };

        updateSize();
        window.addEventListener('resize', updateSize);
        return () => window.removeEventListener('resize', updateSize);
    }, []);

    useEffect(() => {
        // Fade out loading after 1 second
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 1000);

        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="flex w-full h-full flex-col min-h-screen text-center relative">
        
            <div 
                id="canvas-container" 
                className="flex-grow w-full h-full overflow-hidden shadow-game  bg-gradient-to-br from-indigo-500 to-purple-600"
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
                        target={[0, 1, 0]}
                    />
                </Canvas>
            </div>

            {/* Loading overlay */}
            <div
                className={`absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center z-50 transition-opacity duration-500 ${
                    isLoading ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
            >
                <div className="text-white text-2xl font-bold">Loading...</div>
            </div>

        </div>
    );
}

import { useRef, useEffect } from 'react'
import { useGLTF } from '@react-three/drei'
import { useLoader } from '@react-three/fiber'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader'
import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';

function CombinedModel ({ glbUrl, objUrl }: { glbUrl: string; objUrl: string }) {
    const group = useRef<THREE.Group>(null);
    const { scene } = useGLTF(glbUrl);
    const obj = useLoader(OBJLoader, objUrl);

    useEffect(() => {
        if (scene && obj) {
            // 假设GLB模型中有一个名为"Head"的骨骼
            const headBone = scene.getObjectByName("Head")

            if (headBone instanceof THREE.Object3D) {
                // 将OBJ模型附加到头部骨骼
                headBone.add(obj)

                // 调整OBJ模型的位置、旋转和缩放以匹配GLB模型
                obj.position.set(0, 0, 0)
                obj.rotation.set(0, 0, 0)
                obj.scale.set(1, 1, 1)
                // 为OBJ模型创建蒙皮网格
                const firstChild = obj.children[0];
                if (firstChild instanceof THREE.Mesh) {
                    const geometry = firstChild.geometry;
                    const material = new THREE.MeshStandardMaterial();
                    const skinnedMesh = new THREE.SkinnedMesh(geometry, material);

                    // 创建骨骼并添加到蒙皮网格
                    const bone = new THREE.Bone()
                    const skeleton = new THREE.Skeleton([bone])
                    skinnedMesh.add(bone)
                    skinnedMesh.bind(skeleton)

                    // 设置蒙皮权重
                    const skinIndex = new Float32Array(geometry.attributes.position.count * 4)
                    const skinWeight = new Float32Array(geometry.attributes.position.count * 4)
                    for (let i = 0; i < skinIndex.length; i++) {
                        skinIndex[i] = 0
                        skinWeight[i] = 1
                    }
                    geometry.setAttribute('skinIndex', new THREE.BufferAttribute(skinIndex, 4))
                    geometry.setAttribute('skinWeight', new THREE.BufferAttribute(skinWeight, 4))

                    // 替换原始OBJ模型
                    obj.clear()
                    obj.add(skinnedMesh)
                }
            }
        }
    }, [scene, obj]);
    return (
        <group ref={group}>
            <primitive object={scene} />
        </group>
    )
}

export default function App ({glbUrl, objUrl}: {glbUrl: string, objUrl: string}) {
    return (
        <Canvas>
            <CombinedModel
                glbUrl={glbUrl}
                objUrl={objUrl}
            />
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} />
        </Canvas>
    )
}
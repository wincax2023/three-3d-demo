import React, { useState } from 'react';
import axios from 'axios';
import { Canvas } from '@react-three/fiber';
import CombinedModel from './CombinedModel'; // 假设您已经创建了这个组件

function App() {
  const [objUrl, setObjUrl] = useState(null);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null;
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await axios.post('/generate-head', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setObjUrl(response.data.obj_url);
    } catch (error) {
      console.error('Error generating head model:', error);
    }
  };

  return (
    <div>
      <input type="file" accept="image/*" onChange={handleImageUpload} />
      {objUrl && (
        <Canvas>
          <CombinedModel 
            glbUrl="/path/to/your/body.glb" 
            objUrl={objUrl} 
          />
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
        </Canvas>
      )}
    </div>
  );
}

export default App;
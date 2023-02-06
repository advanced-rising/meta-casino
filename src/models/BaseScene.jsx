import { Canvas, useThree } from '@react-three/fiber'
import { KeyboardControls, Loader, OrthographicCamera, PointerLockControls } from '@react-three/drei'
import { Physics } from '@react-three/cannon'
import * as THREE from 'three'

import Lights from './ui/Lights'
import Floor from './ui/Floor'
import { useEffect, useState } from 'react'

const BasicScene = ({ children }) => {
  const [isSet, setIsSet] = useState(false)
  useEffect(() => {
    if (window) {
      setIsSet(true)
    }
  }, [])

  {
    return (
      isSet && (
        <div className='w-full h-full'>
          <KeyboardControls
            map={[
              { name: 'forward', keys: ['ArrowUp', 'w', 'W'] },
              { name: 'backward', keys: ['ArrowDown', 's', 'S'] },
              { name: 'left', keys: ['ArrowLeft', 'a', 'A'] },
              { name: 'right', keys: ['ArrowRight', 'd', 'D'] },
              { name: 'jump', keys: ['Space'] },
            ]}>
            <Canvas
              shadows
              orthographic
              camera={{
                zoom: 100,
                position: [1, 5, 5],
                left: -(window.innerWidth / window.innerHeight),
                right: window.innerWidth / window.innerHeight,
                top: 1,
                bottom: -1,
                near: -1000,
                far: 1000,
              }}
              style={{ width: '100%', height: '100%' }}>
              <Lights />

              <Physics gravity={[0, -9.8, 0]}>
                {children}

                <Floor rotation={[Math.PI / -2, 0, 0]} color='white' />
              </Physics>

              {/* <OrthographicCamera /> */}
              {/* 화면 움직임 가능 */}
              {/* <PointerLockControls /> */}
            </Canvas>
            <Loader />
          </KeyboardControls>
        </div>
      )
    )
  }
}

export default BasicScene

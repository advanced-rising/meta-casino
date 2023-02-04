import { useState, useEffect } from 'react'

/*****************
 * Player Controls
 ****************/
export const usePlayerControls = () => {
  const keys = {
    KeyW: 'forward',
    KeyS: 'backward',
    KeyA: 'left',
    KeyD: 'right',
    Space: 'jump',
    mouse: 'mousedown',
    touch: 'touchstart',
  }
  const moveFieldByKey = (key) => keys[key]

  const [movement, setMovement] = useState({
    forward: false,
    backward: false,
    left: false,
    right: false,
    jump: false,
    mouse: false,
    touch: false,
  })

  let isPressed = false

  useEffect(() => {
    const handleKeyDown = (e) => setMovement((m) => ({ ...m, [moveFieldByKey(e.code)]: true }))
    const handleKeyUp = (e) => setMovement((m) => ({ ...m, [moveFieldByKey(e.code)]: false }))
    const handleMouseDown = (e) => setMovement((m) => ({ ...m, [moveFieldByKey(e.type)]: true }))
    const handleMouseUp = (e) => setMovement((m) => ({ ...m, [moveFieldByKey(e.type)]: false }))

    // 마우스 이벤트
    document.addEventListener('mousedown', (e) => {
      isPressed = true
      handleMouseDown(e)
    })
    document.addEventListener('mouseup', () => {
      isPressed = false
    })
    document.addEventListener('mousemove', (e) => {
      if (isPressed) {
        handleMouseUp(e)
      }
    })

    // 터치 이벤트
    document.addEventListener('touchstart', (e) => {
      isPressed = true
      handleMouseDown(e.touches[0])
    })
    document.addEventListener('touchend', () => {
      isPressed = false
    })
    document.addEventListener('touchmove', (e) => {
      if (isPressed) {
        handleMouseUp(e.touches[0])
      }
    })

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('keyup', handleKeyUp)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  return { ...movement }
}

export default usePlayerControls

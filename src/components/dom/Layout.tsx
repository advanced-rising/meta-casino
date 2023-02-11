import React, { useRef, forwardRef, useImperativeHandle } from 'react'

interface Props {
  children: React.ReactNode
}

const Layout = forwardRef(({ children, ...props }: Props, ref) => {
  const localRef = useRef()

  useImperativeHandle(ref, () => localRef.current)

  return (
    <div {...props} ref={localRef} className='z-10 w-screen h-screen overflow-hidden bg-white dom text-gray-50'>
      {children}
    </div>
  )
})
Layout.displayName = 'Layout'

export default Layout

import { useRef } from 'react'
import dynamic from 'next/dynamic'
import Header from '@/config'
import Layout from '@/components/dom/Layout'
import '@/styles/index.css'
import { Provider } from 'react-redux'
import { store } from '@/redux/store'
import Modals from '@/components/modal/Modals'

const Scene: any = dynamic(() => import('@/components/canvas/Scene'), { ssr: true })

export default function App({ Component, pageProps = { title: 'META CASINO' } }) {
  const ref = useRef()
  return (
    <>
      <Header title={pageProps.title} />
      <Provider store={store}>
        <Modals />
        <Layout ref={ref}>
          <Component {...pageProps} />
          {/* The canvas can either be in front of the dom or behind. If it is in front it can overlay contents.
           * Setting the event source to a shared parent allows both the dom and the canvas to receive events.
           * Since the event source is now shared, the canvas would block events, we prevent that with pointerEvents: none. */}
          {Component?.canvas && (
            <Scene className='pointer-events-none' eventSource={ref} eventPrefix='client'>
              {Component.canvas(pageProps)}
            </Scene>
          )}
        </Layout>
      </Provider>
    </>
  )
}

import { useRef } from 'react'
import dynamic from 'next/dynamic'
import Header from '@/config'
import Layout from '@/components/dom/Layout'
import '@/styles/index.css'
import { Provider } from 'react-redux'
import { store } from '@/redux/store'
import Modals from '@/components/modal/Modals'
import { useRouter } from 'next/router'

const Scene: any = dynamic(() => import('@/components/canvas/Scene'), { ssr: true })

export default function App({ Component, pageProps = { title: '' } }) {
  const ref = useRef(null)
  const router = useRouter()

  return (
    <>
      <Header title={pageProps.title} path={router.asPath} />
      <Provider store={store}>
        <Modals />
        <Layout ref={ref}>
          <Component {...pageProps} />
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

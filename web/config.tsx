import Head from 'next/head'

const SITE_NAME = 'META CASINO'
const SITE_URL = 'https://meta-casino.vercel.app'
const DEFAULT_DESC = '3D 메타버스 카지노 아케이드. 22개의 다양한 카지노·아케이드 게임을 3D 가상 공간에서 즐기세요. 룰렛, 슬롯, 블랙잭, 크래시 등.'
const AUTHOR = 'risingcore'
const KEYWORDS = 'meta casino, 메타 카지노, 3D casino, metaverse game, 온라인 카지노, 아케이드 게임, roulette, slot machine, blackjack, crash game, plinko, three.js, react'

interface Props {
  title?: string
  description?: string
  path?: string
}

export default function Header({ title, description = DEFAULT_DESC, path = '' }: Props) {
  const pageTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME
  const pageUrl = `${SITE_URL}${path}`

  return (
    <Head>
      <meta charSet='utf-8' />
      <meta name='viewport' content='width=device-width, initial-scale=1, maximum-scale=5' />

      {/* 기본 SEO */}
      <title>{pageTitle}</title>
      <meta name='description' content={description} />
      <meta name='keywords' content={KEYWORDS} />
      <meta name='author' content={AUTHOR} />
      <meta name='robots' content='index, follow' />
      <link rel='canonical' href={pageUrl} />

      {/* Open Graph */}
      <meta property='og:type' content='website' />
      <meta property='og:site_name' content={SITE_NAME} />
      <meta property='og:title' content={pageTitle} />
      <meta property='og:description' content={description} />
      <meta property='og:url' content={pageUrl} />
      <meta property='og:image' content={`${SITE_URL}/icons/share.png`} />
      <meta property='og:locale' content='ko_KR' />

      {/* Twitter */}
      <meta name='twitter:card' content='summary_large_image' />
      <meta name='twitter:title' content={pageTitle} />
      <meta name='twitter:description' content={description} />
      <meta name='twitter:image' content={`${SITE_URL}/icons/share.png`} />

      {/* 모바일 */}
      <meta name='theme-color' content='#0a0a0a' />
      <meta name='apple-mobile-web-app-capable' content='yes' />
      <meta name='apple-mobile-web-app-status-bar-style' content='black-translucent' />
      <meta name='apple-mobile-web-app-title' content={SITE_NAME} />

      {/* 파비콘 */}
      <link rel='icon' href='/favicon.ico' />
      <link rel='icon' type='image/png' sizes='32x32' href='/icons/favicon-32x32.png' />
      <link rel='icon' type='image/png' sizes='16x16' href='/icons/favicon-16x16.png' />
      <link rel='apple-touch-icon' sizes='180x180' href='/icons/apple-touch-icon.png' />
      <link rel='manifest' href='/manifest.json' />

      {/* 구조화 데이터 */}
      <script type='application/ld+json' dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: SITE_NAME,
        url: SITE_URL,
        description: DEFAULT_DESC,
        applicationCategory: 'Game',
        operatingSystem: 'Web',
        author: { '@type': 'Person', name: AUTHOR },
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'KRW' },
      })}} />
    </Head>
  )
}

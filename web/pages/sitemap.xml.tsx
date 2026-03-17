import { GetServerSideProps } from 'next'

const SITE_URL = 'https://meta-casino.vercel.app'

const pages = [
  '', '/space/roulette', '/space/slot', '/space/mines', '/space/crash',
  '/space/hilo', '/space/coinflip', '/space/dice', '/space/wheel',
  '/space/plinko', '/space/blackjack', '/space/baccarat',
  '/space/rps', '/space/horserace', '/space/tower', '/space/scratch',
  '/space/limbo', '/space/colorpredict', '/space/bombdefuse',
  '/space/keno', '/space/war', '/space/numberguess', '/space/wheelofdeath',
]

function Sitemap() { return null }

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(p => `  <url>
    <loc>${SITE_URL}${p}</loc>
    <changefreq>weekly</changefreq>
    <priority>${p === '' ? '1.0' : '0.8'}</priority>
  </url>`).join('\n')}
</urlset>`

  res.setHeader('Content-Type', 'text/xml')
  res.write(sitemap)
  res.end()
  return { props: {} }
}

export default Sitemap

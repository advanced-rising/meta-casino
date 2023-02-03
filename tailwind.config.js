const px0_500 = Array.from(Array(501))
  .map((_, i) => `${i}px`)
  .reduce((a, b) => {
    return { [b]: b, ...a }
  }, {})

module.exports = {
  mode: 'jit',
  content: ['./src/pages/**/*.{js,ts,jsx,tsx}', './src/components/**/*.{js,ts,jsx,tsx}'], // remove unused styles in production
  darkMode: 'media', // or 'media' or 'class'
  theme: {
    extend: {
      borderWidth: px0_500,
      fontSize: px0_500,
      lineHeight: px0_500,
      minWidth: px0_500,
      minHeight: px0_500,
      spacing: px0_500,
    },
    spacing: {
      ...px0_500,
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
}

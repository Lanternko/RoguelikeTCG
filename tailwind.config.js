// tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{html,js}", // 告訴 Tailwind 要掃描哪些檔案
  ],
  theme: {
    extend: {
      colors: {
        'human-base': '#9F563A', // 柿渋色
        'human-dark': '#79432C',
        'human-text': '#F3EAD3',
        'yin-base': '#293047',   // 藍鉄色
        'yin-dark': '#1A2033',
        'yin-text': '#D0D8E8',
        'yang-base': '#FCFAF2',   // 白練
        'yang-dark': '#E0D8C0',
        'yang-text': '#5D4037',
        'legendary-ring': '#DAA520', // 金色光環
      }
    },
  },
  plugins: [],
}
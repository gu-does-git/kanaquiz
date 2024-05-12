/** @type {import('tailwindcss').Config} */
const defaultTheme = require('tailwindcss/defaultTheme')

export default {
	darkMode: ['class', '[data-theme="dark"]'],
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {
			fontFamily: {
				sans: ['"Rubik", sans-serif', ...defaultTheme.fontFamily.sans],
				jp: '"Noto Sans JP", sans-serif'
			}
		}
	},
	plugins: []
}

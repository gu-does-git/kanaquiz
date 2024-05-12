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
			},
			animation: {
				'fade-in': 'fadeIn .5s ease-in-out',
				'fade-out': 'fadeOut .5s ease-in-out'
			},

			keyframes: {
				fadeIn: {
					from: { opacity: 0 },
					to: { opacity: 1 }
				},
				fadeOut: {
					from: { opacity: 1 },
					to: { opacity: 0 }
				}
			}
		}
	},
	plugins: []
}

/** @type {import('tailwindcss').Config} */
export default {
	content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
	theme: {
		extend: {
			colors: {
				main: {
					"00": "#171110",
					"05": "#3a2e30",
					10: "#38282A",
				},

				neutral: {
					"00": "#fff",
					"05": "#f7f7f7",
					15: "#7C7C6F",
					50: "#42433D",
				},
			},

			padding: {
				"px-5": "5px",
			},
		},
	},
	plugins: [],
};

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

				blue: {
					"00": "#00b0ff",
				},

				green: {
					"00": "#0d2c22",
					"05": "#39a280",
				},

				neutral: {
					"00": "#fff",
					"05": "#f7f7f7",
					10: "#aaa",
					15: "#7C7C6F",
					50: "#42433D",
				},
			},

			padding: {
				"5px": "5px",
				30: "7.5rem",
			},

			minWidth: {
				"100px": "100px",
			},
		},
	},
	plugins: [],
};

import type { Config } from "tailwindcss";

export default {
    darkMode: ["class"],
    content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
  		colors: {
  			primary: {
  				'50': '#f0f9ff',
  				'100': '#e0f2fe',
  				'200': '#bae6fd',
  				'300': '#7dd3fc',
  				'400': '#38bdf8',
  				'500': '#0ea5e9',
  				'600': '#0284c7',
  				'700': '#0369a1',
  				'800': '#075985',
  				'900': '#0c4a6e',
  				'950': '#082f49',
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			apple: {
  				blue: '#007AFF',
  				gray: {
  					'50': '#F2F2F7',
  					'100': '#E5E5EA',
  					'200': '#D1D1D6',
  					'300': '#C7C7CC',
  					'400': '#AEAEB2',
  					'500': '#8E8E93',
  					'600': '#636366',
  					'700': '#48484A',
  					'800': '#3A3A3C',
  					'900': '#1C1C1E'
  				}
  			},
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		fontFamily: {
  			sans: [
  				'-apple-system',
  				'BlinkMacSystemFont',
  				'SF Pro Display',
  				'SF Pro Text',
  				'system-ui',
  				'sans-serif'
  			]
  		},
  		fontSize: {
  			'display-large': [
  				'4rem',
  				{
  					lineHeight: '1.1',
  					fontWeight: '700'
  				}
  			],
  			display: [
  				'3rem',
  				{
  					lineHeight: '1.2',
  					fontWeight: '600'
  				}
  			],
  			'title-large': [
  				'2rem',
  				{
  					lineHeight: '1.3',
  					fontWeight: '600'
  				}
  			],
  			title: [
  				'1.5rem',
  				{
  					lineHeight: '1.4',
  					fontWeight: '600'
  				}
  			],
  			headline: [
  				'1.25rem',
  				{
  					lineHeight: '1.5',
  					fontWeight: '500'
  				}
  			],
  			'body-large': [
  				'1.125rem',
  				{
  					lineHeight: '1.6',
  					fontWeight: '400'
  				}
  			],
  			body: [
  				'1rem',
  				{
  					lineHeight: '1.6',
  					fontWeight: '400'
  				}
  			],
  			caption: [
  				'0.875rem',
  				{
  					lineHeight: '1.5',
  					fontWeight: '400'
  				}
  			]
  		},
  		borderRadius: {
  			xl: '1rem',
  			'2xl': '1.5rem',
  			'3xl': '2rem',
  			'4xl': '2.5rem',
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		boxShadow: {
  			apple: '0 4px 16px rgba(0, 0, 0, 0.12)',
  			'apple-lg': '0 8px 32px rgba(0, 0, 0, 0.12)',
  			glass: '0 8px 32px rgba(31, 38, 135, 0.37)'
  		},
  		backdropBlur: {
  			apple: '20px'
  		},
  		animation: {
  			'fade-in': 'fadeIn 0.5s ease-out',
  			'slide-up': 'slideUp 0.5s ease-out',
  			'scale-in': 'scaleIn 0.3s ease-out'
  		},
  		keyframes: {
  			fadeIn: {
  				'0%': {
  					opacity: '0'
  				},
  				'100%': {
  					opacity: '1'
  				}
  			},
  			slideUp: {
  				'0%': {
  					transform: 'translateY(20px)',
  					opacity: '0'
  				},
  				'100%': {
  					transform: 'translateY(0)',
  					opacity: '1'
  				}
  			},
  			scaleIn: {
  				'0%': {
  					transform: 'scale(0.95)',
  					opacity: '0'
  				},
  				'100%': {
  					transform: 'scale(1)',
  					opacity: '1'
  				}
  			}
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
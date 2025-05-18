import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: ["class"],
    content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
  	extend: {
      fontFamily: {
        manrope: ['Manrope', 'sans-serif'],
        klasik: ['Klasik', 'serif'],
      },
  		colors: {
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
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
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
  			},
  			sidebar: {
  				DEFAULT: 'hsl(var(--sidebar-background))',
  				foreground: 'hsl(var(--sidebar-foreground))',
  				primary: 'hsl(var(--sidebar-primary))',
  				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
  				accent: 'hsl(var(--sidebar-accent))',
  				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
  				border: 'hsl(var(--sidebar-border))',
  				ring: 'hsl(var(--sidebar-ring))'
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)',
            xl: 'var(--radius-xl, 2.5rem)',
            '2xl': 'var(--radius-lg, 2rem)',
            '3xl': 'var(--radius-md, 1.5rem)',
            '4xl': 'var(--radius-sm, 1rem)',
            '5xl': 'var(--radius-xs, 0.5rem)',
            'organic-pill': 'var(--radius-pill, 9999px)'
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			},
            'float-organic': {
                '0%': {
                    transform: 'translateY(0px)'
                },
                '50%': {
                    transform: 'translateY(-8px)'
                },
                '100%': {
                    transform: 'translateY(0px)'
                }
            },
            'pulse-organic': {
                '0%': {
                    opacity: 0.6,
                    transform: 'scale(0.98)'
                },
                '50%': {
                    opacity: 1,
                    transform: 'scale(1.02)'
                },
                '100%': {
                    opacity: 0.6,
                    transform: 'scale(0.98)'
                }
            },
            'shimmer-organic': {
                '0%': {
                    backgroundPosition: '-200% 0'
                },
                '100%': {
                    backgroundPosition: '200% 0'
                }
            },
            'spin-slow': {
                '0%': {
                    transform: 'rotate(0deg)'
                },
                '100%': {
                    transform: 'rotate(360deg)'
                }
            },
            'reverse-spin': {
                '0%': {
                    transform: 'rotate(360deg)'
                },
                '100%': {
                    transform: 'rotate(0deg)'
                }
            },
            'bounce-organic': {
                '0%, 100%': {
                    transform: 'translateY(0)'
                },
                '50%': {
                    transform: 'translateY(-15px)'
                }
            }
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out',
            'float-organic': 'float-organic 6s ease-in-out infinite',
            'pulse-organic': 'pulse-organic 2.5s infinite',
            'shimmer-organic': 'shimmer-organic 3s infinite linear',
            'spin-slow': 'spin-slow 8s linear infinite',
            'reverse-spin': 'reverse-spin 12s linear infinite',
            'bounce-organic': 'bounce-organic 2s ease-in-out infinite'
  		},
        transitionTimingFunction: {
            'bounce-organic': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
            'spring-organic': 'cubic-bezier(0.43, 0.13, 0.23, 0.96)'
        },
        boxShadow: {
            'soft-sm': 'var(--shadow-soft-sm)',
            'soft': 'var(--shadow-soft)',
            'soft-md': 'var(--shadow-soft-md)',
            'soft-lg': 'var(--shadow-soft-lg)'
        }
  	}
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;

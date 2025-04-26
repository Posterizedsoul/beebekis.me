import { browser } from '$app/environment';
import { writable } from 'svelte/store';

type Theme = 'light' | 'dark' | 'system';

const defaultValue: Theme = 'system';
const key = 'bb-theme';

// Function to get initial theme from localStorage or default
function getInitialTheme(): Theme {
	if (!browser) {
		return defaultValue;
	}
	const storedValue = localStorage.getItem(key) as Theme | null;
	return storedValue ?? defaultValue;
}

// Create the writable store
const theme = writable<Theme>(getInitialTheme());

// Function to set the theme and update localStorage
function setTheme(newTheme: Theme) {
	if (!browser) return;
	theme.set(newTheme);
	localStorage.setItem(key, newTheme);
}

// Subscribe to changes and update the <html> class
theme.subscribe((value) => {
	if (!browser) return;

	const applyThemeClass = (themeValue: 'light' | 'dark') => {
		document.documentElement.classList.remove('light', 'dark');
		document.documentElement.classList.add(themeValue);
	};

	if (value === 'system') {
		const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
		applyThemeClass(systemPrefersDark ? 'dark' : 'light');
	} else {
		applyThemeClass(value);
	}
});

// Listen for system theme changes if 'system' is selected
if (browser) {
	window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
		// Use get() to read the current value without subscribing again
		const currentStoreValue = theme.get(); // Requires importing { get } from 'svelte/store'
		// OR check localStorage directly
		// const currentStoredValue = localStorage.getItem(key) ?? defaultValue;

		if (currentStoreValue === 'system') { // Or check currentStoredValue
			document.documentElement.classList.remove('light', 'dark');
			document.documentElement.classList.add(e.matches ? 'dark' : 'light');
		}
	});
}

export { theme, setTheme };

// Add get import if using theme.get()
// import { get } from 'svelte/store';

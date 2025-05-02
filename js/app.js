/**
 * MarkdownStyle - Main Application Logic
 * Handles UI interaction and content loading
 */

document.addEventListener('DOMContentLoaded', () => {
	const markdownContent = document.getElementById('markdown-content');
	const fileSelect = document.getElementById('file-select');
	const styleSelect = document.getElementById('style-select');
	const themeStylesheet = document.getElementById('theme-stylesheet');

	// Load initial file
	loadMarkdownFile(fileSelect.value);

	// Add event listener for file selection
	fileSelect.addEventListener('change', (e) => {
		loadMarkdownFile(e.target.value);
	});

	// Add event listener for style selection
	styleSelect.addEventListener('change', (e) => {
		changeStyle(e.target.value);
	});

	/**
	 * Change the CSS style of the Markdown renderer
	 * @param {string} style - The style to apply (basic, modern, scientific, legal, retro1997)
	 */
	function changeStyle(style) {
		// Apply special handling for retro1997 theme
		if (style === 'retro1997') {
			document.body.classList.add('retro1997-theme');

			// Show browser compatibility notice
			if (!document.querySelector('.browser-notice')) {
				const notice = document.createElement('div');
				notice.className = 'browser-notice';
				notice.innerHTML = 'Best viewed in Netscape Navigator 3.0 at 800x600 resolution';
				document.body.prepend(notice);
			}

			// Update the date in any marquee elements that contain "Last updated"
			setTimeout(() => {
				const markdownContent = document.getElementById('markdown-content');
				const dateElements = markdownContent.querySelectorAll('marquee, .marquee span, [text*="Last updated"]');
				dateElements.forEach(el => {
					if (el.textContent.includes('Last updated')) {
						// Keep the text but update only the date part
						el.textContent = el.textContent.replace(/Last updated:.*(\d{4})/, 'Last updated: May 2, 2025');
					}
				});

				// Re-apply retro elements processing
				processRetro1997Elements(markdownContent);
			}, 100);
		} else {
			document.body.classList.remove('retro1997-theme');
			const notice = document.querySelector('.browser-notice');
			if (notice) notice.remove();
		}

		themeStylesheet.setAttribute('href', `styles/${style}.css`);
		// Save the selected style in local storage for persistence
		localStorage.setItem('preferredStyle', style);
	}

	// Load saved style preference if any
	const savedStyle = localStorage.getItem('preferredStyle');
	if (savedStyle) {
		styleSelect.value = savedStyle;
		changeStyle(savedStyle);
	}

	/**
	 * Load and render a markdown file
	 * @param {string} filename - The name of the markdown file to load
	 */
	function loadMarkdownFile(filename) {
		fetch(`./${filename}`)
			.then(response => {
				if (!response.ok) {
					throw new Error('Failed to load markdown file');
				}
				return response.text();
			})
			.then(markdownText => {
				// Remove any frontmatter or file comments
				const cleanMarkdown = markdownText.replace(/\/\/\s*filepath:.*$/gm, '');

				// Configure marked options to support GitHub Flavored Markdown
				marked.setOptions({
					gfm: true,           // GitHub Flavored Markdown
					breaks: true,        // Convert line breaks to <br>
					headerIds: true,     // Add IDs to headers
					mangle: false,       // Don't escape HTML
					sanitize: false,     // Don't sanitize HTML (important for allowing raw HTML)
					headerPrefix: '',    // Prefix for header IDs
					smartLists: true,    // Use smarter list behavior
					smartypants: true,   // Use "smart" typographic punctuation
					xhtml: true,         // Use XHTML compliant tags
					highlight: function (code, lang) {
						if (Prism.languages[lang]) {
							return Prism.highlight(code, Prism.languages[lang], lang);
						}
						return code;
					}
				});

				// Set renderer to allow raw HTML to pass through
				const renderer = new marked.Renderer();
				marked.use({ renderer });

				// Use the marked library to convert markdown to HTML
				const renderedHTML = marked.parse(cleanMarkdown);

				// Set the HTML content
				markdownContent.innerHTML = renderedHTML;

				// After content is loaded, highlight code blocks with Prism
				Prism.highlightAll();

				// Apply all Markdown enhancements
				enhanceMarkdown(markdownContent);
			})
			.catch(error => {
				console.error('Error loading markdown:', error);
				markdownContent.innerHTML = `<div class="error">Error loading markdown: ${error.message}</div>`;
			});
	}
});

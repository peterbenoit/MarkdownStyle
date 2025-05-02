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
	 * @param {string} style - The style to apply (basic, modern, or scientific)
	 */
	function changeStyle(style) {
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
					smartLists: true,    // Use smarter list behavior
					smartypants: true,   // Use "smart" typographic punctuation
					highlight: function (code, lang) {
						if (Prism.languages[lang]) {
							return Prism.highlight(code, Prism.languages[lang], lang);
						}
						return code;
					}
				});

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

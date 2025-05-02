/**
 * Markdown Style - Main Application Logic
 * Handles loading and rendering of Markdown content
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
	 * @param {string} style - The style to apply (basic or modern)
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

				// Process any task lists
				processTaskLists();

				// Process footnotes
				processFootnotes();
			})
			.catch(error => {
				console.error('Error loading markdown:', error);
				markdownContent.innerHTML = `<div class="error">Error loading markdown: ${error.message}</div>`;
			});
	}
});

/**
 * Process task lists in the rendered markdown
 * Transforms [ ] and [x] into checkboxes
 */
function processTaskLists() {
	const listItems = document.querySelectorAll('.markdown-body li');

	listItems.forEach(item => {
		const text = item.innerHTML;

		if (text.startsWith('[ ] ') || text.startsWith('[x] ')) {
			const isChecked = text.startsWith('[x] ');
			const listContent = text.substring(4);

			// Convert to task list item
			item.classList.add('task-list-item');
			if (item.parentElement) {
				item.parentElement.classList.add('task-list');
			}

			// Create checkbox
			const checkbox = document.createElement('input');
			checkbox.type = 'checkbox';
			checkbox.checked = isChecked;
			checkbox.disabled = true;

			// Replace the [ ] or [x] with checkbox
			item.innerHTML = item.innerHTML.replace(/^\[\s?\]|\[x\]/, '');
			item.prepend(checkbox);
		}
	});
}

/**
 * Process footnotes in the rendered markdown
 * Enhances footnote styling and interaction
 */
function processFootnotes() {
	// Add proper class to footnotes section
	const footnotes = document.querySelector('.markdown-body div:last-child');
	if (footnotes && footnotes.innerHTML.includes('<hr>')) {
		footnotes.classList.add('footnotes');
	}

	// Style footnote links
	const footnoteLinks = document.querySelectorAll('a[href^="#fn"]');
	footnoteLinks.forEach(link => {
		link.classList.add('footnote-ref');
	});

	// Style footnote backlinks
	const backLinks = document.querySelectorAll('a[href^="#fnref"]');
	backLinks.forEach(link => {
		link.classList.add('footnote-backref');
		link.innerHTML = '↩';
	});
}

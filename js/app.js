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

				// Process any task lists
				processTaskLists();

				// Process footnotes
				processFootnotes();

				// Process figure captions
				processFigureCaptions();

				// Typeset math if MathJax is loaded
				if (window.MathJax) {
					// Different versions of MathJax have different APIs
					if (typeof MathJax.typeset === 'function') {
						// MathJax v3 API
						MathJax.typeset();
					} else if (typeof MathJax.Hub !== 'undefined' && typeof MathJax.Hub.Queue === 'function') {
						// MathJax v2 API
						MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
					} else {
						console.warn("MathJax loaded but typesetting function not found.");
					}
				}
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

/**
 * Process image captions to transform them into proper figure/figcaption elements
 * Looks for images followed by italic text and restructures them
 */
function processFigureCaptions() {
	const content = document.querySelector('.markdown-body');
	if (!content) return;

	// Find all images in the content
	const images = content.querySelectorAll('img');

	images.forEach(img => {
		// Look for the next element after the image
		let nextElement = img.nextElementSibling;

		// Check if it's a <em> element (italic text) or a <p> with em inside (common with some markdown processors)
		if (nextElement) {
			let captionElement = null;
			let captionText = '';

			if (nextElement.tagName === 'EM') {
				captionElement = nextElement;
				captionText = nextElement.textContent;
			} else if (nextElement.tagName === 'P' && nextElement.querySelector('em')) {
				// If it's a paragraph with only an em inside
				const em = nextElement.querySelector('em');
				if (em && nextElement.textContent.trim() === em.textContent.trim()) {
					captionElement = nextElement;
					captionText = em.textContent;
				}
			} else if (nextElement.tagName === 'BR' && nextElement.nextElementSibling) {
				// If there's a BR followed by an EM or P with EM
				const afterBr = nextElement.nextElementSibling;
				if (afterBr.tagName === 'EM') {
					captionElement = afterBr;
					captionText = afterBr.textContent;
				} else if (afterBr.tagName === 'P' && afterBr.querySelector('em')) {
					const em = afterBr.querySelector('em');
					if (em && afterBr.textContent.trim() === em.textContent.trim()) {
						captionElement = afterBr;
						captionText = em.textContent;
					}
				}
			}

			if (captionElement) {
				// Create a new figure element
				const figure = document.createElement('figure');
				figure.className = 'markdown-figure';

				// Move the image inside the figure
				img.parentNode.insertBefore(figure, img);
				figure.appendChild(img);

				// Create a figcaption
				const figcaption = document.createElement('figcaption');
				figcaption.textContent = captionText;
				figure.appendChild(figcaption);

				// Remove the original caption element and any BR that might be in between
				if (captionElement.previousElementSibling && captionElement.previousElementSibling.tagName === 'BR') {
					captionElement.previousElementSibling.remove();
				}
				captionElement.remove();
			}
		}
	});
}

/**
 * MarkdownStyle - Markdown Processing Functions
 *
 * This file contains all the logic for processing and enhancing Markdown content
 * after it has been converted to HTML by marked.js. These functions handle special
 * formatting and enhancements that aren't natively supported by standard Markdown.
 */

/**
 * Process task lists in the rendered markdown
 * Transforms [ ] and [x] into checkboxes
 *
 * @param {HTMLElement} container - The container element with rendered Markdown
 */
function processTaskLists(container) {
	const listItems = container.querySelectorAll('li');

	listItems.forEach(item => {
		const text = item.innerHTML;

		if (text.startsWith('[ ] ') || text.startsWith('[x] ')) {
			const isChecked = text.startsWith('[x] ');

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
 *
 * @param {HTMLElement} container - The container element with rendered Markdown
 */
function processFootnotes(container) {
	// Add proper class to footnotes section
	const footnotes = container.querySelector('div:last-child');
	if (footnotes && footnotes.innerHTML.includes('<hr>')) {
		footnotes.classList.add('footnotes');
	}

	// Style footnote links
	const footnoteLinks = container.querySelectorAll('a[href^="#fn"]');
	footnoteLinks.forEach(link => {
		link.classList.add('footnote-ref');
	});

	// Style footnote backlinks
	const backLinks = container.querySelectorAll('a[href^="#fnref"]');
	backLinks.forEach(link => {
		link.classList.add('footnote-backref');
		link.innerHTML = '↩';
	});
}

/**
 * Process image captions to transform them into proper figure/figcaption elements
 * Looks for images followed by italic text and restructures them
 *
 * @param {HTMLElement} container - The container element with rendered Markdown
 */
function processFigureCaptions(container) {
	// Find all images in the content
	const images = container.querySelectorAll('img');

	images.forEach(img => {
		// Look for the next element after the image
		let nextElement = img.nextElementSibling;

		// Check if it's a <em> element (italic text) or a <p> with em inside
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

/**
 * Apply MathJax typesetting to render mathematical formulas
 */
function processMathJax() {
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
}

/**
 * Apply all Markdown enhancements to the rendered HTML content
 *
 * @param {HTMLElement} container - The container element with rendered Markdown
 */
function enhanceMarkdown(container) {
	processTaskLists(container);
	processFootnotes(container);
	processFigureCaptions(container);
	processMathJax();
}

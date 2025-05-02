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
 * Detects the type of legal document based on title and content
 * Adds appropriate CSS classes to the container
 *
 * @param {HTMLElement} container - The container element with rendered Markdown
 */
function processLegalDocumentType(container) {
	const title = container.querySelector('h1');
	if (!title) return;

	const titleText = title.textContent.toLowerCase();

	// Remove any existing document type classes
	container.classList.remove('agreement', 'contract', 'nda', 'amendment', 'policy');

	// Check for document types in the title
	if (titleText.includes('non-disclosure agreement') || titleText.includes('nda') ||
		titleText.includes('confidentiality agreement')) {
		container.classList.add('nda');
	} else if (titleText.includes('agreement')) {
		container.classList.add('agreement');
	} else if (titleText.includes('contract')) {
		container.classList.add('contract');
	} else if (titleText.includes('amendment')) {
		container.classList.add('amendment');
	} else if (titleText.includes('policy')) {
		container.classList.add('policy');
	}

	// For legal documents, mark defined terms (terms in code blocks)
	if (container.classList.contains('nda') || container.classList.contains('agreement') ||
		container.classList.contains('contract') || container.classList.contains('amendment') ||
		container.classList.contains('policy')) {

		const inlineCodeBlocks = container.querySelectorAll('code:not(pre code)');
		inlineCodeBlocks.forEach(codeBlock => {
			codeBlock.classList.add('defined-term');
		});

		// Process paragraphs, but skip those containing HTML tags like spans
		const paragraphs = container.querySelectorAll('p');
		paragraphs.forEach(paragraph => {
			// Skip paragraphs that contain HTML tags
			if (paragraph.innerHTML.includes('<span') ||
				paragraph.innerHTML.includes('</span') ||
				paragraph.innerHTML.includes('<div') ||
				paragraph.innerHTML.includes('</div')) {
				return;
			}

			// Process paragraphs that have regular text only
			const tempDiv = document.createElement('div');
			tempDiv.innerHTML = paragraph.innerHTML;

			// Only apply this replacement if there are no HTML tags in the content
			if (!/<\/?[a-z][\s\S]*>/i.test(paragraph.innerHTML)) {
				// Replace quoted terms with styled spans
				paragraph.innerHTML = paragraph.innerHTML.replace(/"([^"]+)"/g, (match, term) => {
					// Only treat shorter phrases as defined terms (longer quotes are likely regular quotations)
					if (term.split(' ').length <= 3) {
						return `<span class="defined-term">"${term}"</span>`;
					}
					return match;
				});
			}
		});

		// Fix any signature lines that might have been broken
		fixSignatureLines(container);
	}
}

/**
 * Fix signature lines that might have been broken during HTML processing
 *
 * @param {HTMLElement} container - The container element with rendered Markdown
 */
function fixSignatureLines(container) {
	// Look for broken signature lines - text that looks like HTML tags
	const paragraphs = container.querySelectorAll('p');
	paragraphs.forEach(paragraph => {
		// Check for text that looks like broken HTML
		if (paragraph.textContent.includes('<span class="signature-line">') ||
			paragraph.textContent.includes('<span class="date-line">')) {

			// Try to fix broken signature line HTML
			// Replace text that looks like HTML tags with actual HTML
			paragraph.innerHTML = paragraph.innerHTML
				.replace(/&lt;span class="signature-line"&gt;&lt;\/span&gt;/g, '<span class="signature-line"></span>')
				.replace(/&lt;span class="date-line"&gt;&lt;\/span&gt;/g, '<span class="date-line"></span>')
				.replace(/<span class="signature-line"><\/span>/g, '<span class="signature-line"></span>')
				.replace(/<span class="date-line"><\/span>/g, '<span class="date-line"></span>')
				.replace(/"signature-line">/g, '<span class="signature-line"></span>')
				.replace(/"date-line">/g, '<span class="date-line"></span>');
		}
	});
}

/**
 * Create an automatic table of contents for legal documents
 *
 * @param {HTMLElement} container - The container element with rendered Markdown
 */
function createLegalTableOfContents(container) {
	// Check if this appears to be a legal document
	const isLegal = container.classList.contains('nda') ||
		container.classList.contains('agreement') ||
		container.classList.contains('contract') ||
		container.classList.contains('policy');

	if (!isLegal) return;

	// Find all section headers (typically h2 elements in our structure)
	const sectionHeadings = Array.from(container.querySelectorAll('h2'));
	if (sectionHeadings.length < 3) return; // Not enough sections to warrant a TOC

	// Create the TOC container
	const tocContainer = document.createElement('div');
	tocContainer.className = 'toc-container';
	tocContainer.innerHTML = '<h3 class="toc-title">TABLE OF CONTENTS</h3>';

	// Create the list of contents
	const tocList = document.createElement('ol');
	tocList.className = 'toc-list';

	sectionHeadings.forEach((heading, index) => {
		// Give each heading an ID if it doesn't already have one
		if (!heading.id) {
			heading.id = `section-${index + 1}`;
		}

		// Create the TOC entry
		const listItem = document.createElement('li');
		const link = document.createElement('a');
		link.href = `#${heading.id}`;
		link.textContent = heading.textContent;
		listItem.appendChild(link);
		tocList.appendChild(listItem);
	});

	tocContainer.appendChild(tocList);

	// Insert the TOC after the document preamble (the first blockquote)
	const preamble = container.querySelector('blockquote');
	if (preamble) {
		preamble.parentNode.insertBefore(tocContainer, preamble.nextSibling);
	} else {
		// If no preamble, insert after the first paragraph following the title
		const title = container.querySelector('h1');
		if (title && title.nextElementSibling) {
			title.nextElementSibling.insertAdjacentElement('afterend', tocContainer);
		} else {
			// Last resort: insert at the beginning of the container
			container.insertBefore(tocContainer, container.firstChild);
		}
	}
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
 * Process retro 1997-style elements like marquees, hit counter, etc.
 *
 * @param {HTMLElement} container - The container element with rendered Markdown
 */
function processRetro1997Elements(container) {
	// Process marquee tags
	const marquees = container.querySelectorAll('marquee');
	marquees.forEach(marquee => {
		// Add some classic 90s styling
		marquee.style.backgroundColor = '#FFFF00';
		marquee.style.color = '#FF0000';
		marquee.style.fontWeight = 'bold';
	});

	// Process special under construction divs
	const constructionDivs = container.querySelectorAll('.under-construction');
	constructionDivs.forEach(div => {
		div.classList.add('blink');

		// Add construction gif if not already present
		if (!div.querySelector('img')) {
			const constructionImg = document.createElement('img');
			constructionImg.src = 'https://web.archive.org/web/20091021055957if_/http://hk.geocities.com/milkyy_way_hk/construction.gif';
			constructionImg.alt = 'Under Construction';
			div.prepend(constructionImg);
		}
	});

	// Process hit counter
	const hitCounters = container.querySelectorAll('.hit-counter');
	hitCounters.forEach(counter => {
		// Get current count from localStorage or use the text content
		const currentCount = counter.textContent.trim() || '000000';
		let count = parseInt(localStorage.getItem('retro1997_hitcount') || currentCount);

		// Increment count when viewing with retro theme
		const themeStylesheet = document.getElementById('theme-stylesheet');
		if (themeStylesheet && themeStylesheet.getAttribute('href').includes('retro1997')) {
			count += 1;
			localStorage.setItem('retro1997_hitcount', count.toString());
		}

		// Format count with leading zeros
		counter.textContent = count.toString().padStart(6, '0');
	});

	// Process new badges
	const newBadges = container.querySelectorAll('.new-badge');
	newBadges.forEach(badge => {
		badge.classList.add('blink');
		badge.textContent = 'NEW!';
		badge.style.color = '#FF0000';
		badge.style.fontSize = '10pt';
		badge.style.backgroundColor = '#FFFF00';
		badge.style.padding = '0 3px';
	});

	// Process "best viewed" message
	const bestViewed = container.querySelectorAll('.best-viewed');
	bestViewed.forEach(div => {
		div.style.textAlign = 'center';
		div.style.fontStyle = 'italic';
		div.style.fontSize = '10pt';
		div.style.marginTop = '20px';
	});
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
	processLegalDocumentType(container);

	// Process retro elements if needed
	const themeStylesheet = document.getElementById('theme-stylesheet');
	if (themeStylesheet && themeStylesheet.getAttribute('href').includes('retro1997')) {
		processRetro1997Elements(container);
	}

	// Only create TOC after document type is identified
	createLegalTableOfContents(container);

	processMathJax();
}

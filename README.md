# MarkdownStyle

A browser-based Markdown formatter with multiple theme options to demonstrate how the same Markdown content can be rendered with different visual styles.

## Overview

MarkdownStyle is a lightweight web application that converts Markdown files to styled HTML. It features multiple themes (Basic, Modern, and Scientific) and provides enhanced rendering for various Markdown elements.

## Features

-   **Multiple Themes**: Choose from different CSS themes to render your Markdown content:

    -   **Basic**: A simple, clean style similar to GitHub's Markdown rendering
    -   **Modern**: A dark theme with modern UI elements and animations
    -   **Scientific**: A theme optimized for academic and scientific documents

-   **Comprehensive Markdown Support**:

    -   Headings (H1-H6)
    -   Text formatting (bold, italic, strikethrough)
    -   Lists (ordered, unordered, nested)
    -   Code blocks with syntax highlighting via Prism.js
    -   Tables
    -   Blockquotes
    -   Horizontal rules
    -   Links and images with figure/caption support
    -   Task lists with interactive checkboxes
    -   Footnotes with proper formatting
    -   Mathematical equations via MathJax

-   **Enhanced Rendering**:
    -   Figure/caption pairs for images
    -   Interactive task lists
    -   Styled footnotes and citations
    -   Mathematical formula rendering
    -   Responsive design for various screen sizes

## Project Structure

```
MarkdownStyle/
├── index.html              # Main HTML file
├── README.md               # This documentation
├── *.md                    # Sample Markdown files
│
├── js/
│   ├── app.js              # Main application logic
│   ├── markdown.js         # Markdown enhancement functions
│   ├── marked.min.js       # Markdown parsing library
│   └── prism.js            # Syntax highlighting library
│
└── styles/
    ├── basic.css           # Basic theme (formerly custom.css)
    ├── modern.css          # Modern dark theme
    ├── scientific.css      # Scientific/academic theme
    └── prism.css           # Syntax highlighting styles
```

## Advanced Markdown Extensions

The project extends standard Markdown with several additional features:

### Figure Captions

To create an image with a caption, use standard Markdown image syntax followed by italicized text:

```markdown
![Alt text](image-url.jpg)
_This text becomes a caption_
```

The application will automatically convert this to a proper HTML5 `<figure>` and `<figcaption>` structure.

### Task Lists

Create task lists using the GitHub-style syntax:

```markdown
-   [ ] Unchecked item
-   [x] Checked item
```

These will be rendered as interactive checkboxes.

### Mathematical Equations

The scientific theme supports LaTeX mathematical equations using MathJax:

```markdown
Inline equation: $E = mc^2$

Block equation:
$$S = \sum_{i=1}^{n-1} \sum_{j=i+1}^{n} \text{sgn}(x_j - x_i)$$
```

### Scientific Paper Format

The scientific theme is optimized for academic papers with:

-   The first blockquote is styled as an abstract
-   Section headers are automatically numbered
-   Figures and tables get proper captions
-   References section is styled appropriately
-   Mathematical equations are rendered with LaTeX

## Technical Implementation

### Libraries Used

-   [marked.js](https://marked.js.org/) - Markdown parsing
-   [Prism.js](https://prismjs.com/) - Code syntax highlighting
-   [MathJax](https://www.mathjax.org/) - Mathematical equation rendering

### JavaScript Architecture

The code is organized with separation of concerns:

-   **app.js**: Handles UI interactions, theme switching, and file loading
-   **markdown.js**: Processes and enhances the rendered Markdown HTML

### CSS Structure

Each theme is implemented as a separate CSS file with a consistent structure:

-   Variable declarations for colors, fonts, and spacing
-   Base document styling
-   Specific styles for each Markdown element
-   Responsive design adjustments

## Usage

1. Clone this repository
2. Open `index.html` in a web browser
3. Use the dropdowns to select different themes and sample files
4. Create your own Markdown files to see them rendered with different styles

## Browser Compatibility

-   Chrome (latest)
-   Firefox (latest)
-   Safari (latest)
-   Edge (latest)

## License

MIT

## Acknowledgments

-   The project uses [marked.js](https://marked.js.org/) for Markdown parsing
-   Syntax highlighting via [Prism.js](https://prismjs.com/)
-   Mathematical formula rendering via [MathJax](https://www.mathjax.org/)

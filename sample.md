# Markdown Style Demo

This page demonstrates all supported Markdown features in our custom CSS implementation.

## Text Formatting

Basic text formatting includes **bold text**, _italic text_, and **_bold and italic text_**. You can also use ~~strikethrough~~ text.

## Headings

# H1 Heading

## H2 Heading

### H3 Heading

#### H4 Heading

##### H5 Heading

###### H6 Heading

## Lists

### Unordered Lists

-   Item 1
-   Item 2
    -   Nested item 2.1
    -   Nested item 2.2
-   Item 3

### Ordered Lists

1. First item
2. Second item
    1. Nested item 2.1
    2. Nested item 2.2
3. Third item

## Task Lists

-   [x] Completed task
-   [ ] Incomplete task
-   [x] Another completed task
-   [ ] Another incomplete task

## Code

Inline code: `const greeting = "Hello, world!";`

Code block:

```javascript
function sayHello(name) {
    console.log(`Hello, ${name}!`);
    return true;
}

// Call the function
sayHello('Markdown');
```

## Tables

| Header 1 | Header 2 | Header 3 |
| -------- | -------- | -------- |
| Row 1    | Data     | Data     |
| Row 2    | Data     | Data     |
| Row 3    | Data     | Data     |

## Blockquotes

> This is a blockquote.
>
> It can span multiple paragraphs.
>
> > And can be nested.

## Horizontal Rules

Above the line

---

Below the line

## Links and Images

[Visit GitHub](https://github.com)

![Placeholder Image](https://fakeimg.pl/300x150)

## Footnotes

Here is some text with a footnote[^1].

And another footnote[^2].

[^1]: This is the first footnote.
[^2]:
    This is the second footnote with multiple lines.
    This is part of the footnote.

## Mixed Content Example

### Project Roadmap

1. Phase 1: **Custom CSS Implementation**

    - [x] Create HTML structure
    - [x] Implement basic CSS
    - [ ] Test cross-browser compatibility

2. Phase 2: Framework Implementations
    - [ ] Tailwind CSS
    - [ ] Bulma
    - [ ] Bootstrap

> "Good design is as little design as possible." - Dieter Rams

Here's a simple component example:

```jsx
function Button({ text, onClick }) {
    return (
        <button className="primary-button" onClick={onClick}>
            {text}
        </button>
    );
}
```

## Final Notes

This document demonstrates all the Markdown features supported by our custom CSS implementation. The styling is responsive and works across different browsers.

# Intelligent PDF Generator

A web-based tool for creating beautifully formatted PDFs from your text content with Claude AI enhancement.

## Features

- Create professional PDFs directly in your browser
- Claude AI-powered document structuring and enhancement
- Automatic identification of key sections, quotes, and illustration opportunities
- Real-time preview of your enhanced document
- Multiple design templates: Elegant, Modern, Minimal, and Academic
- Customizable fonts and color themes
- Markdown-like formatting support
- Multi-page PDF generation for long documents
- Node.js backend for handling API calls securely

## How to Use

### Local Development
1. Clone this repository or download the files
2. Install dependencies with `npm install`
3. Start the server with `npm start` (or `npm run dev` for development)
4. Open `http://localhost:3000` in your browser

### Deploying to Cloudflare
1. Install the Cloudflare Wrangler CLI
2. Log in to Cloudflare with `wrangler login`
3. Configure your domain in `wrangler.toml` (already set to pdfs.delcarion.co.uk)
4. Deploy with `npm run deploy`

### Hosted Version
You can also access the hosted version at [https://pdfs.delcarion.co.uk](https://pdfs.delcarion.co.uk)
5. Enter your content in the text area
   - The first line becomes your document title
   - Enter your raw content - Claude AI will enhance it
6. Enter your Claude API key (required for AI enhancement)
7. Choose your document type and enhancement level
8. Click "Enhance with Claude AI" to process your content
9. Preview the enhanced document and markup
10. Choose your preferred template, font, and color theme
11. Click "Generate PDF" to download the beautifully formatted PDF

## Claude AI Enhancement

The tool uses Claude AI to enhance your document with:

- **Light Enhancement**: Basic structure, headings, lists, emphasis
- **Medium Enhancement**: Adds pull quotes, illustration suggestions, captions
- **Full Enhancement**: Adds sidebars, cross-references, table of contents, overall flow improvements

## Document Types

The tool supports different document types with specialized formatting:

- **Article**: Strong lead, narrative flow, conclusion
- **Report**: Executive summary, data presentation, recommendations
- **Academic**: Formal structure, citations, methodology sections
- **Blog**: Engaging intro, scannable format, conversational tone

## Markdown Formatting

The editor also supports basic markdown-style formatting if you prefer manual control:

- `# Heading 1` - Creates a large heading
- `## Heading 2` - Creates a medium heading
- `### Heading 3` - Creates a small heading
- `**bold text**` - Makes text **bold**
- `*italic text*` - Makes text *italic*
- `- List item` - Creates bulleted lists
- `[link text](url)` - Creates a hyperlink

## Technical Details

This project uses:
- HTML5 and CSS3 for layout and styling
- JavaScript for interactive functionality
- Claude API for intelligent document enhancement
- jsPDF for PDF generation
- html2canvas for converting HTML to images

## API Key Security

Your Claude API key is:
- Securely passed through the local proxy server
- Only used to make calls to the Claude API
- Never stored permanently (only in session storage)
- Cleared when you close your browser
- Never included in client-side code

## License

This project is available under the MIT License. Feel free to use, modify, and distribute as needed.

## Contributing

Contributions are welcome! Feel free to open issues or submit pull requests to improve this tool.
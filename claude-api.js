// Claude API Integration Service
class ClaudeService {
    constructor() {
        this.baseUrl = 'https://api.anthropic.com/v1/messages';
        this.apiKey = null;
        this.model = 'claude-3-sonnet-20240229';
    }

    setApiKey(apiKey) {
        if (!apiKey || apiKey.trim() === '') {
            throw new Error('API key is required');
        }
        this.apiKey = apiKey.trim();
    }

    async enhanceContent(rawContent, options) {
        if (!this.apiKey) {
            throw new Error('API key is not set. Please set your Claude API key first.');
        }

        const { enhanceLevel, documentType } = options;
        
        // Create the system prompt based on enhancement level and document type
        const systemPrompt = this.createSystemPrompt(enhanceLevel, documentType);
        
        try {
            // Use local proxy server
            // Use the base URL of the current page for the API endpoint
            const baseUrl = window.location.origin;
            const proxyUrl = `${baseUrl}/api/claude`;
            const response = await fetch(proxyUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    apiKey: this.apiKey,
                    model: this.model,
                    system: systemPrompt,
                    messages: [
                        {
                            role: 'user',
                            content: rawContent
                        }
                    ]
                })
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`API error: ${errorData.error?.message || response.statusText}`);
            }
            
            const data = await response.json();
            return data.content[0].text;
        } catch (error) {
            console.error('Error calling Claude API:', error);
            throw error;
        }
    }

    createSystemPrompt(enhanceLevel, documentType) {
        // Base prompt for all enhancement levels
        let systemPrompt = `
You are an expert document formatter and layout designer. Your task is to analyze the user's text content and enhance its STRUCTURE and LAYOUT ONLY for a beautiful PDF document.

CRITICAL: You must NOT modify, edit, summarize, rewrite, abridge, or change the original text content in any way. The exact original text must be preserved verbatim. Your task is strictly limited to:
1. Identifying structure (headings, paragraphs, lists)
2. Adding appropriate formatting tags 
3. Suggesting visual elements like pull quotes or illustration placeholders
4. Organizing the content visually

The document is a ${documentType}. You must preserve EVERY WORD of the original content exactly as written.
`;

        // Add enhancement level specific instructions
        switch (enhanceLevel) {
            case 'light':
                systemPrompt += `
For this light enhancement:
1. Identify and properly format section headings (using <section-header> tags)
2. Add proper paragraph breaks for readability
3. Format any lists or enumerations appropriately (using <ul>, <ol>, <li> tags)
4. Identify key points that could be emphasized (using <strong> tags)

ONLY use the following HTML-like tags in your response:
- <section-header>Section Title</section-header> - For section headers
- <strong>important text</strong> - For emphasizing important points
- <ul><li>List item 1</li><li>List item 2</li></ul> - For unordered lists
- <ol><li>Step 1</li><li>Step 2</li></ol> - For ordered lists
`;
                break;

            case 'medium':
                systemPrompt += `
For this medium enhancement:
1. Identify and properly format section headings (using <section-header> tags)
2. Add proper paragraph breaks for readability
3. Format any lists or enumerations appropriately (using <ul>, <ol>, <li> tags)
4. Identify key points that could be emphasized (using <strong> tags)
5. Extract meaningful quotes for pull quotes (using <pull-quote> tags)
6. Suggest places where illustrations or diagrams would be helpful (using <illustration-suggestion> tags)
7. Add descriptive captions for suggested illustrations (using <caption> tags)

ONLY use the following HTML-like tags in your response:
- <section-header>Section Title</section-header> - For section headers
- <strong>important text</strong> - For emphasizing important points
- <em>italic text</em> - For emphasized or italic text
- <ul><li>List item 1</li><li>List item 2</li></ul> - For unordered lists
- <ol><li>Step 1</li><li>Step 2</li></ol> - For ordered lists
- <pull-quote>Important quote from the text that deserves emphasis</pull-quote> - For creating pull quotes
- <illustration-suggestion><h4>Suggested Illustration</h4>Brief description of what illustration should show</illustration-suggestion> - For suggesting places where images or diagrams would enhance understanding
- <caption>Caption text for the illustration above</caption> - For image captions
`;
                break;

            case 'full':
                systemPrompt += `
For this full enhancement:
1. Identify and properly format section headings (using <section-header> tags)
2. Add proper paragraph breaks for readability
3. Format any lists or enumerations appropriately (using <ul>, <ol>, <li> tags)
4. Identify key points that could be emphasized (using <strong> tags)
5. Extract meaningful quotes for pull quotes (using <pull-quote> tags)
6. Suggest places where illustrations or diagrams would be helpful (using <illustration-suggestion> tags)
7. Add descriptive captions for suggested illustrations (using <caption> tags)
8. Create sidebars for supplementary information (using <sidebar> tags)
9. Add cross-references where appropriate (using <ref> tags)
10. Suggest a table of contents structure at the beginning
11. Consider the overall flow and readability of the document, restructuring if necessary

ONLY use the following HTML-like tags in your response:
- <section-header>Section Title</section-header> - For section headers
- <strong>important text</strong> - For emphasizing important points
- <em>italic text</em> - For emphasized or italic text
- <ul><li>List item 1</li><li>List item 2</li></ul> - For unordered lists
- <ol><li>Step 1</li><li>Step 2</li></ol> - For ordered lists
- <pull-quote>Important quote from the text that deserves emphasis</pull-quote> - For creating pull quotes
- <illustration-suggestion><h4>Suggested Illustration</h4>Brief description of what illustration should show</illustration-suggestion> - For suggesting places where images or diagrams would enhance understanding
- <caption>Caption text for the illustration above</caption> - For image captions
- <sidebar><h4>Sidebar Title</h4>Supplementary information that enhances the main content but isn't essential to the flow</sidebar> - For creating sidebars
- <ref>Reference to another section or external source</ref> - For cross-references
- <toc>Table of Contents suggestion</toc> - For table of contents
`;
                break;
        }

        // Add document type specific instructions
        switch (documentType) {
            case 'academic':
                systemPrompt += `
For academic papers, pay special attention to identifying:
- Abstract, introduction, methodology, results, discussion, conclusion sections
- Citations and references
- Headers and subheaders
- Figures and tables
`;
                break;

            case 'report':
                systemPrompt += `
For reports, pay special attention to identifying:
- Executive summary section
- Key data points that could be visualized
- Section headers and subheaders
- Recommendation and conclusion sections
`;
                break;

            case 'blog':
                systemPrompt += `
For blog posts, pay special attention to identifying:
- Natural section breaks
- Points that would benefit from subheadings
- Key quotes that could be highlighted
- Natural places where images would enhance understanding
`;
                break;

            case 'article':
                systemPrompt += `
For articles, pay special attention to identifying:
- Logical section breaks
- Main thesis points
- Supporting evidence
- Natural narrative arcs
`;
                break;
        }

        systemPrompt += `
CRITICAL INSTRUCTION: You MUST preserve the EXACT text of the original content. Do not add, remove, summarize, or alter ANY words from the original text. Do not add any new information, facts, opinions, or content that wasn't in the original text. 

Your ONLY permitted actions are:
1. Adding structural tags around the EXISTING text (never modifying the text itself)
2. Suggesting placement of visual elements using the tags provided
3. Identifying natural structure in the document

Even when adding things like pull quotes, you should ONLY use exact text that already exists in the document. Your response should be valid HTML-like markup that can be parsed and rendered properly.

For emphasis: You are NOT writing or editing content! You are ONLY adding structural tags around the existing text.
`;

        return systemPrompt;
    }
}

// Initialize Claude service
const claudeService = new ClaudeService();

// DOM Elements
document.addEventListener('DOMContentLoaded', () => {
    const enhanceBtn = document.getElementById('enhanceBtn');
    const apiKeyInput = document.getElementById('apiKey');
    const contentInput = document.getElementById('contentInput');
    const enhanceLevelSelect = document.getElementById('aiEnhanceLevel');
    const documentTypeSelect = document.getElementById('documentType');
    const aiStatus = document.querySelector('.ai-status');
    const aiStatusMessage = document.getElementById('aiStatusMessage');
    const markupPreview = document.getElementById('markupPreview');
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    // Tab functionality
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabName = btn.getAttribute('data-tab');
            
            // Update active tab button
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Update active tab content
            tabContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === tabName + 'Tab') {
                    content.classList.add('active');
                }
            });
        });
    });

    // Save API key in session storage (not permanent storage)
    apiKeyInput.addEventListener('change', () => {
        try {
            claudeService.setApiKey(apiKeyInput.value);
            sessionStorage.setItem('tempClaudeApiKey', apiKeyInput.value);
        } catch (error) {
            console.warn('Invalid API key:', error);
        }
    });

    // Load API key from session storage if available
    const savedApiKey = sessionStorage.getItem('tempClaudeApiKey');
    if (savedApiKey) {
        apiKeyInput.value = savedApiKey;
        try {
            claudeService.setApiKey(savedApiKey);
        } catch (error) {
            console.warn('Invalid saved API key:', error);
        }
    }

    // Enhance content with Claude
    enhanceBtn.addEventListener('click', async () => {
        const rawContent = contentInput.value.trim();
        
        if (!rawContent) {
            alert('Please enter some content to enhance.');
            return;
        }

        if (!claudeService.apiKey) {
            alert('Please enter your Claude API key.');
            return;
        }

        // Show loading state
        aiStatus.classList.remove('hidden');
        enhanceBtn.disabled = true;
        aiStatusMessage.textContent = 'Claude is analyzing your content...';

        try {
            const enhanceLevel = enhanceLevelSelect.value;
            const documentType = documentTypeSelect.value;
            
            const enhancedContent = await claudeService.enhanceContent(rawContent, {
                enhanceLevel,
                documentType
            });
            
            // Display enhanced content in markup preview
            markupPreview.textContent = enhancedContent;
            
            // Process enhanced content for visual preview
            processEnhancedContent(enhancedContent);
            
            // Switch to the markup tab
            document.querySelector('.tab-btn[data-tab="markup"]').click();
            
            aiStatusMessage.textContent = 'Enhancement completed successfully!';
            setTimeout(() => {
                aiStatus.classList.add('hidden');
            }, 3000);
        } catch (error) {
            console.error('Enhancement failed:', error);
            aiStatusMessage.textContent = `Error: ${error.message}`;
        } finally {
            enhanceBtn.disabled = false;
        }
    });

    // Process the enhanced content and update the visual preview
    function processEnhancedContent(enhancedContent) {
        const previewContent = document.getElementById('previewContent');
        const previewTitle = document.getElementById('previewTitle');
        
        // Extract title if present (first line or first section-header)
        let title = '';
        const titleMatch = enhancedContent.match(/<section-header>(.*?)<\/section-header>/);
        if (titleMatch && titleMatch[1]) {
            title = titleMatch[1];
        } else {
            // Use first line as title if no section header
            const lines = enhancedContent.split('\n');
            title = lines[0].replace(/<.*?>/g, '').trim();
        }
        
        previewTitle.textContent = title || 'Your Title';
        
        // Process HTML-like tags for visual rendering
        let processedContent = enhancedContent
            // Section headers (with page break hints)
            .replace(/<section-header>(.*?)<\/section-header>/g, '<h2 class="section-header" data-pdf-pagebreak="before">$1</h2>')
            // Pull quotes
            .replace(/<pull-quote>(.*?)<\/pull-quote>/g, '<blockquote class="pull-quote">$1</blockquote>')
            // Illustration suggestions (avoid page breaks inside)
            .replace(/<illustration-suggestion>(.*?)<\/illustration-suggestion>/gs, '<div class="illustration-suggestion" data-pdf-keep-together="true">$1</div>')
            // Captions
            .replace(/<caption>(.*?)<\/caption>/g, '<div class="caption">$1</div>')
            // Sidebars (avoid page breaks inside)
            .replace(/<sidebar>(.*?)<\/sidebar>/gs, '<div class="sidebar" data-pdf-keep-together="true">$1</div>')
            // Lists
            .replace(/<ul>(.*?)<\/ul>/gs, '<ul>$1</ul>')
            .replace(/<ol>(.*?)<\/ol>/gs, '<ol>$1</ol>')
            .replace(/<li>(.*?)<\/li>/g, '<li>$1</li>')
            // Basic text formatting
            .replace(/<strong>(.*?)<\/strong>/g, '<strong>$1</strong>')
            .replace(/<em>(.*?)<\/em>/g, '<em>$1</em>')
            // References
            .replace(/<ref>(.*?)<\/ref>/g, '<span class="reference">$1</span>')
            // Table of contents
            .replace(/<toc>(.*?)<\/toc>/gs, '<div class="toc" data-pdf-pagebreak="after">$1</div>');
        
        // Insert paragraph tags around plain text content (between tags)
        processedContent = processedContent.replace(/(?<=>)([^<>]+)(?=<)/g, (match) => {
            if (match.trim()) {
                return `<p>${match}</p>`;
            }
            return match;
        });
        
        // Add page break hints for long documents based on content length
        const wordCount = (processedContent.match(/\b\w+\b/g) || []).length;
        if (wordCount > 500) {
            // Insert soft page break hints in long blocks of text
            processedContent = processedContent.replace(
                /(<p>.*?<\/p>){5,}/gs, 
                (match) => match.replace(/(<\/p>)(<p>)/g, '$1<div class="pdf-break-hint"></div>$2')
            );
        }
        
        // Set the processed content
        previewContent.innerHTML = processedContent;
    }
});
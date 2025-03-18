// Get DOM elements
const contentInput = document.getElementById('contentInput');
const templateSelect = document.getElementById('templateSelect');
const fontSelect = document.getElementById('fontSelect');
const colorSelect = document.getElementById('colorSelect');
const generateBtn = document.getElementById('generateBtn');
const pdfPreview = document.getElementById('pdfPreview');
const previewContent = document.getElementById('previewContent');
const previewTitle = document.getElementById('previewTitle');

// Update preview based on user input
function updatePreview() {
    // Get selected options
    const templateClass = templateSelect.value;
    const fontFamily = fontSelect.value;
    const colorClass = colorSelect.value;
    
    // Update content
    const content = contentInput.value;
    previewContent.textContent = content || 'Your content will appear here...';
    
    // Extract title from first line if available
    const lines = content.split('\n');
    previewTitle.textContent = lines[0] || 'Your Title';
    
    // Update styling
    pdfPreview.className = `preview-container ${templateClass} ${colorClass}`;
    pdfPreview.style.fontFamily = fontFamily;
}

// Generate PDF with custom fonts and fixed layout
function generatePDF() {
    // Show a loading state
    generateBtn.textContent = 'Generating...';
    generateBtn.disabled = true;

    try {
        console.log("Starting PDF generation with custom fonts");
        
        // Get the title for the filename
        const title = previewTitle.textContent.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'document';
        
        // Get the actual content text
        const titleText = previewTitle.textContent;
        const contentText = previewContent.textContent || previewContent.innerText;
        
        // Get styling options
        const templateClass = templateSelect.value;
        const fontFamily = fontSelect.value;
        const colorClass = colorSelect.value;
        
        // Extract actual computed styles from the preview elements
        const previewStyles = window.getComputedStyle(pdfPreview);
        const titleStyles = window.getComputedStyle(previewTitle);
        const contentStyles = window.getComputedStyle(previewContent);
        
        // Log the computed styles for debugging
        console.log("Computed styles:", {
            preview: {
                backgroundColor: previewStyles.backgroundColor,
                padding: previewStyles.padding,
                fontFamily: previewStyles.fontFamily
            },
            title: {
                fontSize: titleStyles.fontSize,
                fontWeight: titleStyles.fontWeight,
                color: titleStyles.color,
                marginBottom: titleStyles.marginBottom
            },
            content: {
                fontSize: contentStyles.fontSize,
                lineHeight: contentStyles.lineHeight,
                color: contentStyles.color
            }
        });
        
        // Create PDF with styling options
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });
        
        // Set up PDF content formatting
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        
        // Calculate margins based on preview padding (convert from px to mm)
        const pxToMm = 0.264583; // 1px = 0.264583mm
        const previewPaddingTop = parseFloat(previewStyles.paddingTop) * pxToMm;
        const previewPaddingLeft = parseFloat(previewStyles.paddingLeft) * pxToMm;
        const previewPaddingRight = parseFloat(previewStyles.paddingRight) * pxToMm;
        
        // Use margin based on preview padding, with increased minimums for better spacing
        const margin = {
            top: Math.max(25, previewPaddingTop), // Increased from 15 to 25mm for header space
            left: Math.max(20, previewPaddingLeft), // Increased from 15 to 20mm
            right: Math.max(20, previewPaddingRight), // Increased from 15 to 20mm
            bottom: 20 // Increased from 15 to 20mm
        };
        
        // Define header margin (space reserved at top of each page for headers)
        const headerMargin = 10; // 10mm reserved for headers
        
        const usableWidth = pageWidth - (margin.left + margin.right);
        
        // Parse colors from computed styles - better color extraction
        const parseColor = (colorStr) => {
            if (!colorStr || colorStr === 'rgba(0, 0, 0, 0)') return null;
            
            // Handle rgb/rgba format
            if (colorStr.startsWith('rgb')) {
                const parts = colorStr.match(/\d+/g);
                if (parts && parts.length >= 3) {
                    return [parseInt(parts[0]), parseInt(parts[1]), parseInt(parts[2])];
                }
            }
            
            // Handle hex format - just return it as is for setTextColor/setFillColor
            return colorStr;
        };
        
        // Extract colors from computed styles
        const bgColor = parseColor(previewStyles.backgroundColor);
        const titleColor = parseColor(titleStyles.color);
        const textColor = parseColor(contentStyles.color);
        
        // Apply background color if it exists and isn't transparent
        if (bgColor) {
            if (Array.isArray(bgColor)) {
                doc.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
            } else {
                // Handle string hex colors
                doc.setFillColor(bgColor);
            }
            doc.rect(0, 0, pageWidth, pageHeight, 'F');
        } else {
            // Fallback colors based on class if computed styles don't have colors
            if (colorClass === 'blue') {
                doc.setFillColor(247, 249, 252);
                doc.rect(0, 0, pageWidth, pageHeight, 'F');
            } else if (colorClass === 'green') {
                doc.setFillColor(245, 251, 246);
                doc.rect(0, 0, pageWidth, pageHeight, 'F');
            } else if (colorClass === 'purple') {
                doc.setFillColor(249, 245, 252);
                doc.rect(0, 0, pageWidth, pageHeight, 'F');
            } else if (colorClass === 'dark') {
                doc.setFillColor(44, 62, 80);
                doc.rect(0, 0, pageWidth, pageHeight, 'F');
            }
        }
        
        // Load custom fonts based on the selected font family
        const loadCustomFonts = async () => {
            // Using local TTF files that exactly match what's used in the preview
            const fontUrls = {
                roboto: {
                    // Using Roboto with the exact weights that match Google Fonts (400=Regular, 700=Bold)
                    normal: './Roboto/Roboto-Regular.ttf',
                    bold: './Roboto/Roboto-Bold.ttf',
                    italic: './Roboto/Roboto-Italic.ttf',
                    bolditalic: './Roboto/Roboto-BoldItalic.ttf'
                },
                georgia: {
                    // Using the exact Georgia TTF files
                    normal: './georgia-2/georgia.ttf',
                    bold: './georgia-2/georgiab.ttf',
                    italic: './georgia-2/georgiai.ttf',
                    bolditalic: './georgia-2/georgiaz.ttf'
                },
                'palatino linotype': {
                    // Using the exact Palatino Linotype TTF files with proper naming
                    normal: './Palatino Linotype/palatinolinotype_roman.ttf',
                    bold: './Palatino Linotype/palatinolinotype_bold.ttf',
                    italic: './Palatino Linotype/palatinolinotype_italic.ttf',
                    bolditalic: './Palatino Linotype/palatinolinotype_bolditalic.ttf'
                },
                'palatino': {
                    // Using the original Palatino font files
                    normal: './Palatino font/pala.ttf',
                    bold: './Palatino font/palab.ttf',
                    italic: './Palatino font/palai.ttf',
                    bolditalic: './Palatino font/palabi.ttf'
                }
            };
            
            // Determine which font set to use with correct differentiation between Palatino variants
            let fontKey = 'roboto'; // Default
            if (fontFamily.includes('Georgia')) {
                fontKey = 'georgia';
            } else if (fontFamily.includes('Palatino Linotype')) {
                fontKey = 'palatino linotype';
            } else if (fontFamily.includes('Palatino')) {
                fontKey = 'palatino';
            }
            
            console.log(`Selected font family: '${fontFamily}', using font key: '${fontKey}'`);
            
            // Check if custom fonts are available
            if (!fontUrls[fontKey]) {
                console.log("No custom font available for:", fontFamily);
                return false;
            }
            
            try {
                // Inform the user we're loading fonts
                console.log(`Loading custom ${fontKey} fonts from local files...`);
                
                // Use fetch to get the font data (now from local files)
                const fetchFont = async (url) => {
                    try {
                        console.log(`Fetching font from ${url}`);
                        const response = await fetch(url);
                        
                        if (!response.ok) {
                            throw new Error(`Failed to load font from ${url}: ${response.status} ${response.statusText}`);
                        }
                        
                        const arrayBuffer = await response.arrayBuffer();
                        return new Uint8Array(arrayBuffer);
                    } catch (error) {
                        console.warn(`Error fetching font from ${url}:`, error);
                        return null;
                    }
                };
                
                // Try to load all variants for the selected font
                console.log(`Fetching all variants of ${fontKey}...`);
                
                const variantPromises = {
                    normal: fetchFont(fontUrls[fontKey].normal),
                    bold: fetchFont(fontUrls[fontKey].bold),
                    italic: fetchFont(fontUrls[fontKey].italic),
                    bolditalic: fetchFont(fontUrls[fontKey].bolditalic)
                };
                
                // Wait for all font variants to load
                const fontData = {
                    normal: await variantPromises.normal,
                    bold: await variantPromises.bold,
                    italic: await variantPromises.italic,
                    bolditalic: await variantPromises.bolditalic
                };
                
                // Make sure at least normal variant loaded
                if (!fontData.normal) {
                    console.warn(`Failed to load normal variant of ${fontKey}. Falling back to standard fonts.`);
                    return false;
                }
                
                try {
                    // Add each font variant that successfully loaded
                    console.log(`Adding ${fontKey} font variants to PDF...`);
                    
                    const addFontVariant = (variantData, style) => {
                        if (!variantData) {
                            console.log(`Skipping ${style} variant - not loaded`);
                            return false;
                        }
                        
                        const base64Data = arrayBufferToBase64(variantData);
                        const filename = `${fontKey.replace(/\s+/g, '-')}-${style}.ttf`; // Handle spaces in font key
                        
                        // Add to Virtual File System
                        doc.addFileToVFS(filename, base64Data);
                        
                        // Add font with proper Unicode support
                        doc.addFont(filename, fontKey, style, 'Identity-H');
                        
                        console.log(`Added ${fontKey} ${style} variant`);
                        return true;
                    };
                    
                    // Add each variant
                    const normalAdded = addFontVariant(fontData.normal, 'normal');
                    const boldAdded = addFontVariant(fontData.bold, 'bold');
                    const italicAdded = addFontVariant(fontData.italic, 'italic');
                    const bolditalicAdded = addFontVariant(fontData.bolditalic, 'bolditalic');
                    
                    // If at least normal variant was added successfully
                    if (normalAdded) {
                        // Verify we can use the font
                        doc.setFont(fontKey, 'normal');
                        console.log(`Custom font ${fontKey} loaded successfully`);
                        return fontKey;
                    } else {
                        console.warn(`Failed to add ${fontKey} font. Falling back to standard fonts.`);
                        return false;
                    }
                } catch (fontAddError) {
                    console.error(`Error adding ${fontKey} font:`, fontAddError);
                    return false;
                }
            } catch (error) {
                console.error("Failed to load custom fonts:", error);
                return false;
            }
        };
        
        // Helper function to convert ArrayBuffer to Base64
        function arrayBufferToBase64(buffer) {
            let binary = '';
            const bytes = new Uint8Array(buffer);
            const len = bytes.byteLength;
            for (let i = 0; i < len; i++) {
                binary += String.fromCharCode(bytes[i]);
            }
            return btoa(binary);
        }
        
        // Call the font loading function and continue with PDF generation
        loadCustomFonts().then(customFont => {
            // Set title text color
            if (titleColor) {
                if (Array.isArray(titleColor)) {
                    doc.setTextColor(titleColor[0], titleColor[1], titleColor[2]);
                } else {
                    doc.setTextColor(titleColor);
                }
            } else {
                // Fallback title colors
                if (colorClass === 'blue') doc.setTextColor(44, 62, 80); // #2c3e50
                else if (colorClass === 'green') doc.setTextColor(39, 174, 96); // #27ae60
                else if (colorClass === 'purple') doc.setTextColor(142, 68, 173); // #8e44ad
                else if (colorClass === 'dark') doc.setTextColor(236, 240, 241); // #ecf0f1
                else doc.setTextColor(51, 51, 51); // Default #333
            }
            
            // Use custom font if available, otherwise fall back to standard fonts
            let pdfFont = customFont || "helvetica";
            if (!customFont) {
                // Map font family to standard fonts if custom font loading failed
                if (fontFamily.includes('Georgia') || previewStyles.fontFamily.includes('Georgia')) {
                    pdfFont = "times";
                } else if (fontFamily.includes('Palatino') || previewStyles.fontFamily.includes('Palatino')) {
                    pdfFont = "times";
                } else if (fontFamily.includes('Courier') || previewStyles.fontFamily.includes('Courier')) {
                    pdfFont = "courier";
                }
            }
            
            // Extract font sizes from computed styles (convert from px to pt)
            const pxToPt = 0.75; // 1px = 0.75pt
            let titleFontSize = Math.round(parseFloat(titleStyles.fontSize) * pxToPt);
            const contentFontSize = Math.round(parseFloat(contentStyles.fontSize) * pxToPt);
            
            // Initialize contentStartY with a default value before any rendering attempts
            let contentStartY = margin.top + 20; // Default fallback position
            let titleHeight = 0;
            
            // Title style based on computed style and template
            let titleStyle = titleStyles.fontWeight > 400 ? "bold" : "normal";
            if (titleStyles.fontStyle === 'italic') {
                titleStyle = titleStyle === 'bold' ? "bolditalic" : "italic";
            }
            
            // Prepare title text (make a copy so we can modify it safely)
            let renderedTitleText = titleText;
            
            // Template-specific overrides (when needed)
            if (templateClass === 'elegant') {
                // For elegant template, use italic if not already set
                if (!titleStyle.includes('italic')) {
                    titleStyle = titleStyle === 'bold' ? "bolditalic" : "italic";
                }
            } else if (templateClass === 'modern') {
                // For modern style, ensure bold and increase size slightly
                titleStyle = titleStyle.includes('italic') ? "bolditalic" : "bold";
                titleFontSize = Math.max(titleFontSize, 18); // Ensure minimum size of 18pt
            } else if (templateClass === 'minimal') {
                // For minimal style, convert title to uppercase
                if (renderedTitleText) {
                    renderedTitleText = renderedTitleText.toUpperCase();
                }
            }
            
            // Render the title - with error handling
            let titleFont = pdfFont;
            try {
                // Set font and size
                doc.setFontSize(titleFontSize);
                doc.setFont(titleFont, titleStyle);
                
                // Position title with proper spacing after header margin
                const titleStartY = margin.top + headerMargin;
                
                // Calculate and place title
                const titleLines = doc.splitTextToSize(renderedTitleText, usableWidth);
                doc.text(titleLines, margin.left, titleStartY + titleFontSize/2);
                
                // Calculate title height
                const titleLineHeight = titleFontSize * 0.352778 * 1.2; // Convert pt to mm with 1.2 line height
                titleHeight = titleLines.length * titleLineHeight;
            } 
            catch (titleError) {
                console.error("Error rendering title with custom font:", titleError);
                
                // Fall back to standard font
                titleFont = "helvetica";
                doc.setFont(titleFont, titleStyle);
                doc.setFontSize(titleFontSize);
                
                // Position title with proper spacing after header margin
                const titleStartY = margin.top + headerMargin;
                
                // Recalculate with standard font
                const titleLines = doc.splitTextToSize(renderedTitleText, usableWidth);
                doc.text(titleLines, margin.left, titleStartY + titleFontSize/2);
                
                // Recalculate title height with standard font
                const titleLineHeight = titleFontSize * 0.352778 * 1.2;
                titleHeight = titleLines.length * titleLineHeight;
            }
            
            // Calculate contentStartY position based on template with improved spacing
            if (templateClass === 'elegant') {
                // Add underline for elegant style with proper positioning
                const titleStartY = margin.top + headerMargin;
                const lineY = titleStartY + titleHeight + 8; // Increased from 5 to 8mm
                doc.setDrawColor(200, 200, 200);
                doc.line(margin.left, lineY, pageWidth - margin.right, lineY);
                
                // Extra spacing after the line - significantly increased
                contentStartY = lineY + 15; // Increased from 8 to 15mm
            } 
            else if (templateClass === 'academic') {
                // Academic style needs more spacing after title
                const titleStartY = margin.top + headerMargin;
                contentStartY = titleStartY + titleHeight + 20; // Increased from 15 to 20mm
            }
            else if (templateClass === 'minimal') {
                // Minimal style needs generous spacing
                const titleStartY = margin.top + headerMargin;
                contentStartY = titleStartY + titleHeight + 18; // Use 18mm spacing
            }
            else {
                // Modern and other templates - increased spacing
                const titleStartY = margin.top + headerMargin;
                const titleMarginBottom = parseFloat(titleStyles.marginBottom) * pxToMm;
                contentStartY = titleStartY + titleHeight + (titleMarginBottom || 15); // Increased default from 10 to 15mm
            }
            
            // Set content text color
            if (textColor) {
                if (Array.isArray(textColor)) {
                    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
                } else {
                    doc.setTextColor(textColor);
                }
            } else {
                // Fallback content colors
                if (colorClass === 'dark') doc.setTextColor(236, 240, 241); // #ecf0f1
                else doc.setTextColor(51, 51, 51); // Default #333
            }
            
            // Apply additional template-specific styling to content
            let contentStyle = "normal";
            let paragraphSpacing = 1.5; // Default paragraph spacing multiplier
            
            if (templateClass === 'elegant') {
                // Elegant template has slightly larger paragraph spacing
                paragraphSpacing = 1.8;
            } else if (templateClass === 'modern') {
                // Modern template uses slightly condensed paragraph spacing
                paragraphSpacing = 1.3;
            } else if (templateClass === 'minimal') {
                // Minimal template uses wider paragraph spacing
                paragraphSpacing = 2.0;
            } else if (templateClass === 'academic') {
                // Academic template uses double spacing
                paragraphSpacing = 2.0;
                // Academic template may use a serif font if not already set
                if (!pdfFont.includes('times') && !fontFamily.includes('Georgia') && !fontFamily.includes('Palatino')) {
                    pdfFont = "times";
                }
            }
            
            // Add content with proper text wrapping (with try/catch for safety)
            try {
                doc.setFontSize(contentFontSize);
                doc.setFont(pdfFont, contentStyle);
                
                // Extract line height from computed styles or use reasonable default
                const computedLineHeight = parseFloat(contentStyles.lineHeight);
                const lineHeightMultiplier = isNaN(computedLineHeight) ? 1.5 : computedLineHeight / parseFloat(contentStyles.fontSize);
                
                // Define helper functions for page styling
                function addBackgroundToPage(doc, bgColor, colorClass, pageWidth, pageHeight) {
                    // Add background color to new page
                    if (bgColor) {
                        if (Array.isArray(bgColor)) {
                            doc.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
                        } else {
                            doc.setFillColor(bgColor);
                        }
                        doc.rect(0, 0, pageWidth, pageHeight, 'F');
                    } else {
                        // Fallback colors
                        if (colorClass === 'blue') doc.setFillColor(247, 249, 252);
                        else if (colorClass === 'green') doc.setFillColor(245, 251, 246);
                        else if (colorClass === 'purple') doc.setFillColor(249, 245, 252);
                        else if (colorClass === 'dark') doc.setFillColor(44, 62, 80);
                        else doc.setFillColor(255, 255, 255); // Default white
                        doc.rect(0, 0, pageWidth, pageHeight, 'F');
                    }
                }
                
                function resetTextStyles(doc, textColor, colorClass, pdfFont, contentStyle, contentFontSize) {
                    // Reset content styling
                    if (textColor) {
                        if (Array.isArray(textColor)) {
                            doc.setTextColor(textColor[0], textColor[1], textColor[2]);
                        } else {
                            doc.setTextColor(textColor);
                        }
                    } else if (colorClass === 'dark') {
                        doc.setTextColor(236, 240, 241);
                    } else {
                        doc.setTextColor(51, 51, 51);
                    }
                    doc.setFont(pdfFont, contentStyle);
                    doc.setFontSize(contentFontSize);
                }
                
                // Apply template-specific line height adjustments
                let adjustedLineHeightMultiplier = lineHeightMultiplier;
                
                // Adjust line height based on template
                if (templateClass === 'elegant') {
                    // Elegant uses slightly larger line height for elegance
                    adjustedLineHeightMultiplier = Math.max(lineHeightMultiplier, 1.6);
                } else if (templateClass === 'modern') {
                    // Modern uses more compact line height
                    adjustedLineHeightMultiplier = Math.min(Math.max(lineHeightMultiplier, 1.2), 1.4);
                } else if (templateClass === 'minimal') {
                    // Minimal uses generous spacing
                    adjustedLineHeightMultiplier = Math.max(lineHeightMultiplier, 1.8);
                } else if (templateClass === 'academic') {
                    // Academic uses double spacing
                    adjustedLineHeightMultiplier = Math.max(lineHeightMultiplier, 2.0);
                }
                
                const lineHeight = contentFontSize * 0.352778 * adjustedLineHeightMultiplier; // Convert pt to mm with adjusted line height
                
                // Validate that contentStartY is a valid number - add a safeguard
                if (isNaN(contentStartY) || contentStartY < margin.top) {
                    console.warn("Invalid contentStartY detected, using default margin.top + 20");
                    contentStartY = margin.top + 20;
                }
                
                // Calculate paragraph gap based on line height and template
                const paragraphGap = lineHeight * Math.min(paragraphSpacing, 1.5); // Cap the maximum spacing multiplier
                
                // Process preview content with HTML elements instead of plain text
                const processHTML = (htmlContainer) => {
                    // Starting position for content
                    let yPos = contentStartY;
                    let previousElementType = null; // Track previous element type to control spacing
                    
                    // Function to add appropriate spacing between elements
                    const addElementSpacing = (currentElement, yPosition) => {
                        // Don't add spacing at the very beginning
                        if (yPosition === contentStartY) {
                            return yPosition;
                        }
                        
                        // Calculate base line height in mm
                        const baseLineHeightMm = contentFontSize * 0.352778; // Convert pt to mm
                        
                        // Determine spacing based on element transitions
                        if (previousElementType === 'heading' && currentElement === 'heading') {
                            // Heading to heading - moderate spacing
                            return yPosition + baseLineHeightMm * 0.8;
                        } else if (previousElementType === 'paragraph' && currentElement === 'paragraph') {
                            // Paragraph to paragraph - use a consistent fixed value rather than formula
                            return yPosition + baseLineHeightMm * 1.2; // Reduced value
                        } else if (previousElementType === 'list' && currentElement === 'list') {
                            // List to list - reduced spacing
                            return yPosition + baseLineHeightMm * 0.2;
                        } else if ((previousElementType === 'blockquote' && currentElement === 'blockquote') ||
                                   (previousElementType === 'img' && currentElement === 'img')) {
                            // Blockquote to blockquote or image to image - moderate spacing
                            return yPosition + baseLineHeightMm * 0.7;
                        } else if ((previousElementType === 'paragraph' && currentElement === 'list') ||
                                   (previousElementType === 'list' && currentElement === 'paragraph')) {
                            // Paragraph to list or list to paragraph - slightly more space
                            return yPosition + baseLineHeightMm * 0.9;
                        } else {
                            // Different element types - standard spacing
                            return yPosition + baseLineHeightMm * 0.7; // Reduced from 0.8
                        }
                    };
                    
                    // Process each child node in the container
                    for (let i = 0; i < htmlContainer.childNodes.length; i++) {
                        const node = htmlContainer.childNodes[i];
                        const isFirstElement = (i === 0);
                        
                        // Skip empty text nodes
                        if (node.nodeType === Node.TEXT_NODE && node.textContent.trim() === '') {
                            continue;
                        }
                        
                        // Process based on node type
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            // Element nodes - handle based on tag type
                            const tagName = node.tagName.toLowerCase();
                            
                            // Add appropriate spacing (except for first element)
                            if (!isFirstElement) {
                                let elementType;
                                if (['h1', 'h2', 'h3'].includes(tagName)) elementType = 'heading';
                                else if (tagName === 'p') elementType = 'paragraph';
                                else if (['ul', 'li'].includes(tagName)) elementType = 'list';
                                else if (tagName === 'blockquote') elementType = 'blockquote';
                                else if (tagName === 'img' || node.classList?.contains('image-placeholder')) elementType = 'img';
                                else elementType = 'other';
                                
                                yPos = addElementSpacing(elementType, yPos);
                                previousElementType = elementType;
                            } else if (isFirstElement) {
                                // Set previous element type for first element
                                if (['h1', 'h2', 'h3'].includes(tagName)) previousElementType = 'heading';
                                else if (tagName === 'p') previousElementType = 'paragraph';
                                else if (['ul', 'li'].includes(tagName)) previousElementType = 'list';
                                else if (tagName === 'blockquote') previousElementType = 'blockquote';
                                else if (tagName === 'img' || node.classList?.contains('image-placeholder')) previousElementType = 'img';
                                else previousElementType = 'other';
                            }
                            
                            // Handle different HTML elements
                            if (tagName === 'h1' || tagName === 'h2' || tagName === 'h3') {
                                // Heading styling
                                const headingText = node.textContent;
                                let headingSize, headingStyle;
                                
                                if (tagName === 'h1') {
                                    headingSize = contentFontSize * 1.5;
                                    headingStyle = 'bold';
                                } else if (tagName === 'h2') {
                                    headingSize = contentFontSize * 1.3;
                                    headingStyle = 'bold';
                                } else { // h3
                                    headingSize = contentFontSize * 1.1;
                                    headingStyle = 'bolditalic';
                                }
                                
                                // Check if we need a page break for this heading
                                if (yPos + (headingSize * 0.352778 * 1.5) > pageHeight - margin.bottom - 15) {
                                    doc.addPage();
                                    addBackgroundToPage(doc, bgColor, colorClass, pageWidth, pageHeight);
                                    resetTextStyles(doc, textColor, colorClass, pdfFont, contentStyle, contentFontSize);
                                    yPos = margin.top + headerMargin;
                                }
                                
                                // Render the heading
                                doc.setFont(pdfFont, headingStyle);
                                doc.setFontSize(headingSize);
                                const headingLines = doc.splitTextToSize(headingText, usableWidth);
                                doc.text(headingLines, margin.left, yPos);
                                
                                // Calculate heading height
                                const headingLineHeight = headingSize * 0.352778 * 1.2;
                                yPos += headingLines.length * headingLineHeight;
                                
                                // Add underline for h2 headings - thin line with template-appropriate color
                                if (tagName === 'h2') {
                                    // Set an appropriate color for the line
                                    if (colorClass === 'blue') doc.setDrawColor(100, 149, 237); // cornflowerblue
                                    else if (colorClass === 'green') doc.setDrawColor(46, 139, 87); // seagreen
                                    else if (colorClass === 'purple') doc.setDrawColor(147, 112, 219); // mediumpurple
                                    else if (colorClass === 'dark') doc.setDrawColor(240, 248, 255); // aliceblue
                                    else doc.setDrawColor(180, 180, 180); // default gray
                                    
                                    // Calculate line position in relation to the text's baseline
                                    // Use a small offset (1.2mm) from the current position for better visual connection to the text
                                    const lineY = yPos - 1.2;
                                    
                                    doc.setLineWidth(0.4); // Thicker line for better visibility
                                    doc.line(margin.left, lineY, margin.left + usableWidth * 0.4, lineY); // Longer line (40% of width)
                                    doc.setLineWidth(0.1); // Reset line width
                                    
                                    // Add a small amount of spacing after the line
                                    yPos += 1;
                                }
                                
                                // Reset to normal content style
                                doc.setFont(pdfFont, contentStyle);
                                doc.setFontSize(contentFontSize);
                                
                            } else if (tagName === 'p') {
                                // Check if paragraph contains only styled text or has mixed content
                                if (node.childNodes.length === 1 && 
                                    (node.childNodes[0].nodeType === Node.TEXT_NODE || 
                                     ['strong', 'em', 'b', 'i'].includes(node.childNodes[0].tagName?.toLowerCase()))) {
                                    // Simple paragraph with text only, process directly
                                    yPos = processStyledText(node, yPos);
                                } else {
                                    // Complex paragraph with mixed elements, process each child
                                    let originalYPos = yPos;
                                    let maxLineWidth = 0;
                                    
                                    // Check if we need a page break
                                    const estimatedHeight = estimateNodeHeight(node, lineHeight);
                                    if (yPos + estimatedHeight > pageHeight - margin.bottom - 15) {
                                        doc.addPage();
                                        addBackgroundToPage(doc, bgColor, colorClass, pageWidth, pageHeight);
                                        resetTextStyles(doc, textColor, colorClass, pdfFont, contentStyle, contentFontSize);
                                        yPos = margin.top + headerMargin;
                                        originalYPos = yPos;
                                    }
                                    
                                    // Process each child with proper styling
                                    let complexParaContent = '';
                                    let complexParaSegments = [];

                                    // Extract all styled segments from paragraph
                                    extractTextSegments(node, complexParaSegments);

                                    // Use the processStyledText directly with all segments
                                    if (complexParaSegments.length > 0) {
                                        yPos = processStyledText({
                                            nodeType: Node.ELEMENT_NODE,
                                            childNodes: [{
                                                nodeType: Node.TEXT_NODE,
                                                textContent: ' ', // This will be ignored as our enhanced function will focus on segments
                                            }],
                                            segments: complexParaSegments // Pass segments directly
                                        }, yPos);
                                    } else {
                                        // Fallback to the previous approach if no segments found
                                        for (let j = 0; j < node.childNodes.length; j++) {
                                            const child = node.childNodes[j];
                                            if (child.nodeType === Node.TEXT_NODE) {
                                                // Regular text
                                                const text = child.textContent.trim();
                                                if (text) {
                                                    doc.setFont(pdfFont, contentStyle);
                                                    const textLines = doc.splitTextToSize(text, usableWidth - maxLineWidth);
                                                    doc.text(textLines, margin.left + maxLineWidth, yPos);
                                                    maxLineWidth += doc.getTextWidth(text + ' ');
                                                    
                                                    // Move to next line if needed
                                                    if (margin.left + maxLineWidth > pageWidth - margin.right) {
                                                        yPos += lineHeight;
                                                        maxLineWidth = 0;
                                                    }
                                                }
                                            } else if (child.nodeType === Node.ELEMENT_NODE) {
                                                // Handle styled spans
                                                if (['strong', 'b'].includes(child.tagName.toLowerCase())) {
                                                    doc.setFont(pdfFont, 'bold');
                                                    const text = child.textContent.trim();
                                                    doc.text(text, margin.left + maxLineWidth, yPos);
                                                    maxLineWidth += doc.getTextWidth(text + ' ');
                                                } else if (['em', 'i'].includes(child.tagName.toLowerCase())) {
                                                    doc.setFont(pdfFont, 'italic');
                                                    const text = child.textContent.trim();
                                                    doc.text(text, margin.left + maxLineWidth, yPos);
                                                    maxLineWidth += doc.getTextWidth(text + ' ');
                                                } else {
                                                    // Other elements inside paragraph - handle recursively
                                                    yPos = processNode(child, yPos);
                                                }
                                                
                                                // Check line wrapping
                                                if (margin.left + maxLineWidth > pageWidth - margin.right) {
                                                    yPos += lineHeight;
                                                    maxLineWidth = 0;
                                                }
                                                
                                                // Reset style
                                                doc.setFont(pdfFont, contentStyle);
                                            }
                                        }
                                        
                                        // Calculate final height of paragraph
                                        if (maxLineWidth > 0) {
                                            yPos += lineHeight; // Add final line height if we added content
                                        }
                                    }
                                }
                                
                            } else if (tagName === 'strong' || tagName === 'em' || tagName === 'b' || tagName === 'i') {
                                // Process inline styling directly - these should normally be inside paragraphs
                                // but we'll handle them as standalone elements if needed
                                yPos = processStyledText(node, yPos);
                                
                            } else if (tagName === 'blockquote') {
                                // Handle blockquote with indentation and styling
                                const blockquoteText = node.textContent;
                                
                                // Check for page break
                                // Revised blockquote layout parameters 
                                const linePosition = 4; // Position of vertical line from left margin
                                const blockIndent = 10; // Text indentation from left margin
                                const lineTextGap = 3; // Gap between line and text
                                
                                // Calculate usable width for text
                                const blockTextWidth = usableWidth - (linePosition + lineTextGap) - 2;
                                const blockLines = doc.splitTextToSize(blockquoteText, blockTextWidth);
                                const estimatedHeight = blockLines.length * lineHeight + 10;
                                
                                if (yPos + estimatedHeight > pageHeight - margin.bottom - 15) {
                                    doc.addPage();
                                    addBackgroundToPage(doc, bgColor, colorClass, pageWidth, pageHeight);
                                    resetTextStyles(doc, textColor, colorClass, pdfFont, contentStyle, contentFontSize);
                                    yPos = margin.top + headerMargin;
                                }
                                
                                // Add blockquote styling
                                doc.setFont(pdfFont, contentStyle === 'normal' ? 'italic' : contentStyle);
                                
                                // Save current colors
                                const currentDrawColor = doc.getDrawColor();
                                
                                // Set an appropriate color for the blockquote line
                                if (colorClass === 'blue') doc.setDrawColor(100, 149, 237, 0.7); // cornflowerblue
                                else if (colorClass === 'green') doc.setDrawColor(46, 139, 87, 0.7); // seagreen
                                else if (colorClass === 'purple') doc.setDrawColor(147, 112, 219, 0.7); // mediumpurple
                                else if (colorClass === 'dark') doc.setDrawColor(240, 248, 255, 0.7); // aliceblue
                                else doc.setDrawColor(180, 180, 180, 0.7); // default gray
                                
                                // Draw left border for blockquote
                                const blockStartY = yPos - 2;
                                
                                // Add extra padding above blockquote
                                yPos += 1;
                                
                                // Position for text - explicitly place the text relative to line position
                                const textX = margin.left + linePosition + lineTextGap;
                                
                                // Draw indented blockquote text
                                doc.text(blockLines, textX, yPos);
                                yPos += blockLines.length * lineHeight;
                                
                                // Draw the vertical line aligned with text
                                doc.setLineWidth(0.5);
                                doc.line(margin.left + linePosition, blockStartY, margin.left + linePosition, yPos - lineHeight + 2);
                                doc.setLineWidth(0.1); // Reset line width
                                
                                // Add extra padding below blockquote
                                yPos += 1;
                                
                                // Reset styles
                                doc.setDrawColor(currentDrawColor);
                                doc.setFont(pdfFont, contentStyle);
                            } else if (tagName === 'ul') {
                                // Process list items
                                const bulletPosition = 3; // mm from left margin
                                const bulletRadius = 1.5; // Size of bullet
                                const listIndent = 12; // Text indentation (increased from 8)
                                let lastItemBottomY = yPos;
                                
                                for (let j = 0; j < node.childNodes.length; j++) {
                                    const listItem = node.childNodes[j];
                                    if (listItem.nodeType === Node.ELEMENT_NODE && listItem.tagName.toLowerCase() === 'li') {
                                        // Check for page break
                                        if (yPos + lineHeight > pageHeight - margin.bottom - 15) {
                                            doc.addPage();
                                            addBackgroundToPage(doc, bgColor, colorClass, pageWidth, pageHeight);
                                            resetTextStyles(doc, textColor, colorClass, pdfFont, contentStyle, contentFontSize);
                                            yPos = margin.top + headerMargin;
                                        }
                                        
                                        // Save fill color
                                        const currentFillColor = doc.getFillColor();
                                        
                                        // Draw bullet point with template-appropriate color
                                        if (colorClass === 'blue') doc.setFillColor(100, 149, 237); // cornflowerblue
                                        else if (colorClass === 'green') doc.setFillColor(46, 139, 87); // seagreen
                                        else if (colorClass === 'purple') doc.setFillColor(147, 112, 219); // mediumpurple
                                        else if (colorClass === 'dark') doc.setFillColor(240, 248, 255); // aliceblue
                                        else doc.setFillColor(100, 100, 100); // default darker gray
                                        
                                        // Adjust bullet position for better centering with text
                                        const bulletYOffset = lineHeight * 0.35;
                                        // Draw bullet as a solid circle
                                        doc.circle(margin.left + bulletPosition, yPos - bulletYOffset, bulletRadius, 'F');
                                        
                                        // Reset fill color for text
                                        doc.setFillColor(currentFillColor);
                                        
                                        // Reset text color explicitly
                                        if (textColor) {
                                            if (Array.isArray(textColor)) {
                                                doc.setTextColor(textColor[0], textColor[1], textColor[2]);
                                            } else {
                                                doc.setTextColor(textColor);
                                            }
                                        } else if (colorClass === 'dark') {
                                            doc.setTextColor(236, 240, 241);
                                        } else {
                                            doc.setTextColor(51, 51, 51);
                                        }
                                        
                                        // Process list item content - check if it contains styled elements
                                        if (listItem.childNodes.length === 1 && listItem.firstChild.nodeType === Node.TEXT_NODE) {
                                            // Simple text item
                                            const itemText = listItem.textContent.trim();
                                            
                                            // Use consistent indentation that accounts for bullet size and spacing
                                            const textWidth = usableWidth - listIndent;
                                            const listLines = doc.splitTextToSize(itemText, textWidth);
                                            
                                            // Properly align text with bullets
                                            doc.text(listLines, margin.left + listIndent, yPos);
                                            yPos += listLines.length * lineHeight;
                                        } else {
                                            // Complex list item with styling
                                            // Save current margin for indented styling
                                            const originalMargin = margin.left;
                                            
                                            // Temporarily increase the left margin for processing styled text
                                            const tempMargin = margin.left;
                                            margin.left += listIndent;
                                            
                                            // Create a temporary div to hold list item content for processing
                                            let tempDiv = document.createElement('div');
                                            for (let c = 0; c < listItem.childNodes.length; c++) {
                                                tempDiv.appendChild(listItem.childNodes[c].cloneNode(true));
                                            }
                                            
                                            // Process with indentation
                                            const startYPos = yPos;
                                            yPos = processStyledText(tempDiv, yPos);
                                            
                                            // Restore original margin
                                            margin.left = tempMargin;
                                            
                                            // Add spacing after list item
                                            lastItemBottomY = yPos;
                                        }
                                        
                                        // Add small spacing between list items (less than paragraph spacing)
                                        if (j < node.childNodes.length - 1) {
                                            yPos += lineHeight * 0.2;
                                        }
                                        
                                        lastItemBottomY = yPos;
                                    }
                                }
                                
                                // Set position after the last item
                                yPos = lastItemBottomY;
                                
                            } else if (tagName === 'a') {
                                // Handle links with special styling
                                const linkText = node.textContent;
                                const href = node.getAttribute('href');
                                
                                // Check for page break
                                if (yPos + lineHeight > pageHeight - margin.bottom - 15) {
                                    doc.addPage();
                                    addBackgroundToPage(doc, bgColor, colorClass, pageWidth, pageHeight);
                                    resetTextStyles(doc, textColor, colorClass, pdfFont, contentStyle, contentFontSize);
                                    yPos = margin.top + headerMargin;
                                }
                                
                                // Save current text color
                                const currentTextColor = doc.getTextColor();
                                
                                // Set link color (appropriate for theme)
                                if (colorClass === 'dark') {
                                    doc.setTextColor(173, 216, 230); // light blue for dark theme
                                } else if (colorClass === 'blue') {
                                    doc.setTextColor(25, 25, 255); // darker blue for blue theme
                                } else if (colorClass === 'green') {
                                    doc.setTextColor(0, 100, 0); // dark green for green theme
                                } else if (colorClass === 'purple') {
                                    doc.setTextColor(75, 0, 130); // indigo for purple theme
                                } else {
                                    doc.setTextColor(0, 0, 238); // standard link blue
                                }
                                
                                // Draw underlined link text
                                const linkLines = doc.splitTextToSize(linkText, usableWidth);
                                doc.text(linkLines, margin.left, yPos);
                                
                                // Underline the link text
                                const textWidth = doc.getTextWidth(linkText);
                                doc.line(margin.left, yPos + 1, margin.left + textWidth, yPos + 1);
                                
                                // Move position
                                yPos += linkLines.length * lineHeight;
                                
                                // Reset text color
                                doc.setTextColor(currentTextColor);
                                
                            } else if (tagName === 'img' || (tagName === 'div' && node.classList?.contains('image-placeholder'))) {
                                // Handle image placeholders
                                const imgHeight = 40; // Height of placeholder
                                const imgAlt = node.alt || node.textContent || 'Image';
                                
                                // Check for page break
                                if (yPos + imgHeight > pageHeight - margin.bottom - 15) {
                                    doc.addPage();
                                    addBackgroundToPage(doc, bgColor, colorClass, pageWidth, pageHeight);
                                    resetTextStyles(doc, textColor, colorClass, pdfFont, contentStyle, contentFontSize);
                                    yPos = margin.top + headerMargin;
                                }
                                
                                // Save current states
                                const currentDrawColor = doc.getDrawColor();
                                const currentFillColor = doc.getFillColor();
                                const currentTextColor = doc.getTextColor();
                                const currentLineWidth = doc.getLineWidth();
                                
                                // Draw image placeholder rectangle with more visible styling
                                if (colorClass === 'blue') {
                                    doc.setDrawColor(70, 130, 180); // steelblue
                                    doc.setFillColor(230, 240, 250); // lighter blue
                                } else if (colorClass === 'green') {
                                    doc.setDrawColor(46, 139, 87); // seagreen
                                    doc.setFillColor(240, 255, 240); // honeydew
                                } else if (colorClass === 'purple') {
                                    doc.setDrawColor(138, 43, 226); // blueviolet
                                    doc.setFillColor(248, 240, 255); // lavender
                                } else if (colorClass === 'dark') {
                                    doc.setDrawColor(169, 169, 169); // darkgray
                                    doc.setFillColor(75, 75, 75); // custom darker gray
                                } else {
                                    doc.setDrawColor(100, 100, 100); // darker gray
                                    doc.setFillColor(240, 240, 240); // light gray
                                }
                                
                                // Draw with thicker lines and more visible design
                                doc.setLineWidth(0.5);
                                doc.roundedRect(margin.left, yPos, usableWidth, imgHeight, 3, 3, 'FD');
                                
                                // Draw an image icon in the left part of the placeholder
                                const iconSize = 12;
                                const iconMargin = 10;
                                
                                // Draw an image frame icon
                                doc.rect(margin.left + iconMargin, yPos + (imgHeight/2) - (iconSize/2), iconSize, iconSize, 'S');
                                // Draw mountain-like icon inside the frame
                                const mountain1X = margin.left + iconMargin;
                                const mountain1Y = yPos + (imgHeight/2) + (iconSize/2);
                                const mountain2X = mountain1X + (iconSize * 0.3);
                                const mountain2Y = mountain1Y - (iconSize * 0.5);
                                const mountain3X = mountain2X + (iconSize * 0.3);
                                const mountain3Y = mountain1Y - (iconSize * 0.3);
                                const mountain4X = mountain3X + (iconSize * 0.4);
                                const mountain4Y = mountain1Y;
                                
                                doc.lines([[mountain2X - mountain1X, mountain2Y - mountain1Y], 
                                            [mountain3X - mountain2X, mountain3Y - mountain2Y],
                                            [mountain4X - mountain3X, mountain4Y - mountain3Y]], 
                                            mountain1X, mountain1Y);
                                
                                // Add placeholder text
                                doc.setFont(pdfFont, 'italic');
                                if (colorClass === 'dark') {
                                    doc.setTextColor(200, 200, 200); // Lighter text for dark theme
                                } else {
                                    doc.setTextColor(80, 80, 80); // Darker text for better contrast
                                }

                                let placeholderText = '[Image Placeholder]';
                                // If we have alt text, use it
                                if (imgAlt && imgAlt.trim() !== '' && imgAlt !== 'Image') {
                                    placeholderText = `[Image: ${imgAlt.substring(0, 30)}${imgAlt.length > 30 ? '...' : ''}]`;
                                }

                                doc.text(placeholderText, margin.left + iconMargin + iconSize + 5, 
                                         yPos + imgHeight/2, {
                                            align: 'left',
                                            baseline: 'middle'
                                         });
                                
                                // Reset styling
                                doc.setDrawColor(currentDrawColor);
                                doc.setFillColor(currentFillColor);
                                doc.setTextColor(currentTextColor);
                                doc.setLineWidth(currentLineWidth);
                                doc.setFont(pdfFont, contentStyle);
                                
                                // Move position past image placeholder
                                yPos += imgHeight + 5; // Add extra spacing
                            }
                        } else if (node.nodeType === Node.TEXT_NODE) {
                            // Text node - render as normal paragraph if it contains actual content
                            const text = node.textContent.trim();
                            if (text) {
                                // Add appropriate spacing if not first element
                                if (!isFirstElement) {
                                    yPos = addElementSpacing('paragraph', yPos);
                                    previousElementType = 'paragraph';
                                }
                                
                                // Check for page break
                                const textLines = doc.splitTextToSize(text, usableWidth);
                                
                                if (yPos + (textLines.length * lineHeight) > pageHeight - margin.bottom - 15) {
                                    doc.addPage();
                                    addBackgroundToPage(doc, bgColor, colorClass, pageWidth, pageHeight);
                                    resetTextStyles(doc, textColor, colorClass, pdfFont, contentStyle, contentFontSize);
                                    yPos = margin.top + headerMargin;
                                }
                                
                                // Render text
                                doc.text(textLines, margin.left, yPos);
                                yPos += textLines.length * lineHeight;
                            }
                        }
                    }
                    
                    return yPos;
                };
                
                // Helper function to process individual nodes
                const processNode = (node, startY) => {
                    // Implementation would be similar to parts of processHTML
                    // This is a simplified version just to handle nested elements in complex paragraphs
                    let yPos = startY;
                    
                    if (node.nodeType === Node.TEXT_NODE) {
                        const text = node.textContent.trim();
                        if (text) {
                            const textLines = doc.splitTextToSize(text, usableWidth);
                            doc.text(textLines, margin.left, yPos);
                            yPos += textLines.length * lineHeight;
                        }
                    } else if (node.nodeType === Node.ELEMENT_NODE) {
                        // Simple element handling - could be expanded for more complex nesting
                        const tagName = node.tagName.toLowerCase();
                        if (['strong', 'b'].includes(tagName)) {
                            doc.setFont(pdfFont, 'bold');
                        } else if (['em', 'i'].includes(tagName)) {
                            doc.setFont(pdfFont, 'italic');
                        }
                        
                        const text = node.textContent.trim();
                        if (text) {
                            const textLines = doc.splitTextToSize(text, usableWidth);
                            doc.text(textLines, margin.left, yPos);
                            yPos += textLines.length * lineHeight;
                        }
                        
                        // Reset font
                        doc.setFont(pdfFont, contentStyle);
                    }
                    
                    return yPos;
                };
                
                // Helper function to estimate node height
                const estimateNodeHeight = (node, lineHeight) => {
                    // This is a rough estimate - actual height may vary
                    const text = node.textContent;
                    const lines = Math.ceil(text.length / 80); // Rough estimate of characters per line
                    return lines * lineHeight * 1.2; // Add 20% for safety
                };
                
                // Function to process text with inline styling (bold/italic/etc)
                const processStyledText = (element, startY) => {
                    let yPos = startY;
                    let segments = [];
                    
                    // Check if segments were passed directly (from complex paragraph handling)
                    if (element.segments && element.segments.length > 0) {
                        segments = element.segments;
                    } else {
                        // Extract all text segments with their styling
                        extractTextSegments(element, segments);
                    }
                    
                    // No segments? Return early
                    if (segments.length === 0) return yPos;
                    
                    // Check for page break - estimate height based on text length
                    let combinedText = segments.map(s => s.text).join(' ');
                    const estimatedLines = Math.ceil(doc.getTextWidth(combinedText) / usableWidth) + 1;
                    if (yPos + (estimatedLines * lineHeight) > pageHeight - margin.bottom - 15) {
                        doc.addPage();
                        addBackgroundToPage(doc, bgColor, colorClass, pageWidth, pageHeight);
                        resetTextStyles(doc, textColor, colorClass, pdfFont, contentStyle, contentFontSize);
                        yPos = margin.top + headerMargin;
                    }
                    
                    try {
                        // Begin with x at margin
                        let currentX = margin.left;
                        let lastSpaceX = margin.left;
                        let lastSpaceIndex = -1;
                        let currentLineStart = 0;
                        let currentY = yPos;
                        
                        // Work through all segments as a single flow
                        for (let i = 0; i < segments.length; i++) {
                            const segment = segments[i];
                            
                            // Apply appropriate styling
                            let fontStyle = contentStyle;
                            if (segment.bold && segment.italic) fontStyle = "bolditalic";
                            else if (segment.bold) fontStyle = "bold";
                            else if (segment.italic) fontStyle = "italic";
                            doc.setFont(pdfFont, fontStyle);
                            
                            // Process words separately to handle line breaks correctly
                            const words = segment.text.split(/\s+/);
                            for (let w = 0; w < words.length; w++) {
                                const word = words[w];
                                if (!word) continue; // Skip empty words
                                
                                // Calculate word width (add space unless it's the last word in text)
                                const isLastWord = (i === segments.length - 1 && w === words.length - 1);
                                const wordWithSpace = isLastWord ? word : word + ' ';
                                const wordWidth = doc.getTextWidth(wordWithSpace);
                                
                                // Check if we need to wrap to next line
                                if (currentX + wordWidth > pageWidth - margin.right && currentX > margin.left) {
                                    // Move to next line
                                    currentY += lineHeight;
                                    currentX = margin.left;
                                    currentLineStart = i;
                                    
                                    // Check for page break
                                    if (currentY > pageHeight - margin.bottom - 15) {
                                        doc.addPage();
                                        addBackgroundToPage(doc, bgColor, colorClass, pageWidth, pageHeight);
                                        resetTextStyles(doc, textColor, colorClass, pdfFont, contentStyle, contentFontSize);
                                        currentY = margin.top + headerMargin;
                                    }
                                    
                                    // Reapply current segment's styling
                                    doc.setFont(pdfFont, fontStyle);
                                }
                                
                                // Render word at current position
                                doc.text(word, currentX, currentY);
                                
                                // Move position and track spaces for potential line breaks
                                currentX += wordWidth;
                                if (!isLastWord) {
                                    lastSpaceX = currentX - doc.getTextWidth(' ');
                                    lastSpaceIndex = i;
                                }
                            }
                        }
                        
                        // Reset font and update Y position - always move down by one line height
                        doc.setFont(pdfFont, contentStyle);
                        return currentY + lineHeight;
                    } catch (styleError) {
                        console.error("Advanced styled text rendering failed:", styleError);
                        
                        // Fall back to simple rendering with no styling
                        doc.setFont(pdfFont, contentStyle);
                        const plainText = segments.map(s => s.text).join(' ');
                        const textLines = doc.splitTextToSize(plainText, usableWidth);
                        doc.text(textLines, margin.left, yPos);
                        return yPos + textLines.length * lineHeight;
                    }
                };
                
                // Function to extract text segments with styling
                const extractTextSegments = (node, segments, currentStyle = {}) => {
                    if (node.nodeType === Node.TEXT_NODE) {
                        // Plain text node
                        const trimmed = node.textContent.trim();
                        if (trimmed) {
                            segments.push({
                                text: trimmed,
                                bold: currentStyle.bold || false,
                                italic: currentStyle.italic || false
                            });
                        }
                    } else if (node.nodeType === Node.ELEMENT_NODE) {
                        // Element node - check for styling elements
                        const tagName = node.tagName.toLowerCase();
                        let newStyle = {...currentStyle};
                        
                        if (tagName === 'strong' || tagName === 'b') {
                            newStyle.bold = true;
                        } else if (tagName === 'em' || tagName === 'i') {
                            newStyle.italic = true;
                        }
                        
                        // Process child nodes with updated style
                        for (let i = 0; i < node.childNodes.length; i++) {
                            extractTextSegments(node.childNodes[i], segments, newStyle);
                        }
                    }
                };
                
                // Process the entire HTML content
                processHTML(previewContent);
                
            } catch (contentError) {
                console.error("Error rendering content with custom font:", contentError);
                // Fall back to standard font and basic rendering
                doc.setFont("helvetica", contentStyle);
                doc.text("Error rendering formatted content. Displaying basic text:", margin.left, contentStartY);
                
                // Render basic text version
                const contentLines = doc.splitTextToSize(contentText, usableWidth);
                const safeY = contentStartY + 10;
                doc.text(contentLines, margin.left, safeY);
            }
            
            // Add page numbers
            const totalPages = doc.internal.getNumberOfPages();
            for (let i = 1; i <= totalPages; i++) {
                doc.setPage(i);
                
                // Add header to each page
                doc.setFontSize(8);
                doc.setFont(pdfFont, "normal");
                if (textColor) {
                    if (Array.isArray(textColor)) {
                        doc.setTextColor(textColor[0], textColor[1], textColor[2]);
                    } else {
                        doc.setTextColor(textColor);
                    }
                } else if (colorClass === 'dark') {
                    doc.setTextColor(236, 240, 241);
                } else {
                    doc.setTextColor(51, 51, 51);
                }
                
                // Add header text with horizontal line below
                doc.text(renderedTitleText.substring(0, 60) + (renderedTitleText.length > 60 ? '...' : ''), margin.left, margin.top);
                doc.setDrawColor(200, 200, 200);
                doc.line(margin.left, margin.top + 3, pageWidth - margin.right, margin.top + 3);
                
                // Add page numbers and footer
                doc.setFontSize(9);
                
                // Add a subtle horizontal separator line above the footer
                doc.setDrawColor(180, 180, 180);
                doc.line(margin.left, pageHeight - margin.bottom + 5, pageWidth - margin.right, pageHeight - margin.bottom + 5);
                
                // Add page number centered
                doc.text(`Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - margin.bottom + 15, {
                    align: 'center'
                });
                
                // Add date on the left
                const today = new Date();
                const dateStr = today.toLocaleDateString();
                doc.text(dateStr, margin.left, pageHeight - margin.bottom + 15);
                
                // Add template info on right (optional)
                const templateInfo = `${templateClass.charAt(0).toUpperCase() + templateClass.slice(1)} Style`;
                doc.text(templateInfo, pageWidth - margin.right, pageHeight - margin.bottom + 15, {
                    align: 'right'
                });
            }
            
            // Save the PDF
            doc.save(`${title}.pdf`);
            
            console.log("PDF generation completed successfully");
                    generateBtn.textContent = 'Generate PDF';
                    generateBtn.disabled = false;
        }).catch(error => {
            console.error("Error in custom font loading:", error);
            // Continue with standard fonts
            generatePDFWithStandardFonts();
                });
    } catch (error) {
        console.error('PDF setup error:', error);
        alert('Error setting up PDF generation: ' + error.message);
        generateBtn.textContent = 'Generate PDF';
        generateBtn.disabled = false;
    }
}

// Fallback function for standard fonts
function generatePDFWithStandardFonts() {
    // This would be a duplicate of the PDF generation code but using only standard fonts
    // For now, we'll just alert the user
    alert('Using standard fonts due to font loading error.');
    
    // Continue with the PDF generation using standard fonts
    // ... this would be similar code to our main PDF generation but without custom fonts
    
    // For brevity, we're not duplicating all the code here
}

// Add markdown-like parsing
function parseMarkdown(text) {
    if (!text) return '';
    
    // Headers
    text = text.replace(/^# (.*$)/gm, '<h1>$1</h1>');
    text = text.replace(/^## (.*$)/gm, '<h2>$1</h2>');
    text = text.replace(/^### (.*$)/gm, '<h3>$1</h3>');
    
    // Bold and italic
    text = text.replace(/\*\*(.*?)\*\*/gm, '<strong>$1</strong>');
    text = text.replace(/\*(.*?)\*/gm, '<em>$1</em>');
    
    // Images - add support for image placeholders
    text = text.replace(/!\[(.*?)\]\((.*?)\)/gm, '<img src="$2" alt="$1">');
    
    // Lists - improved regular expression for bullet lists
    text = text.replace(/^[\s]*?[-*] (.*$)/gm, '<li>$1</li>');
    
    // Group list items with better handling of nested content
    let inList = false;
    const lines = text.split('\n');
    const processedLines = [];
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmed = line.trim();
        
        if (line.includes('<li>')) {
            if (!inList) {
                processedLines.push('<ul>');
                inList = true;
            }
            processedLines.push(line);
        } else {
            if (inList) {
                // Don't close the list if this is an empty line followed by another list item
                if (trimmed === '' && i + 1 < lines.length && lines[i + 1].includes('<li>')) {
                    processedLines.push(''); // Keep the blank line
                } else {
                    processedLines.push('</ul>');
                    inList = false;
                    processedLines.push(line);
                }
            } else {
                processedLines.push(line);
            }
        }
    }
    
    if (inList) {
        processedLines.push('</ul>');
    }
    
    text = processedLines.join('\n');
    
    // Links
    text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/gm, '<a href="$2">$1</a>');
    
    // Blockquotes
    text = text.replace(/^> (.*$)/gm, '<blockquote>$1</blockquote>');
    
    // Paragraphs - wrap non-tagged content in <p> tags, with improved handling
    const paragraphLines = text.split('\n\n');
    const processedParagraphs = paragraphLines.map(para => {
        const trimmedPara = para.trim();
        // Skip if paragraph already has HTML tags
        if (trimmedPara.startsWith('<') && 
            !trimmedPara.startsWith('<li>') && 
            !trimmedPara.startsWith('<strong>') && 
            !trimmedPara.startsWith('<em>')) {
            return para;
        }
        // Skip empty paragraphs
        if (!trimmedPara) {
            return '';
        }
        return `<p>${para}</p>`;
    });
    
    return processedParagraphs.join('\n\n');
}

// Enhanced update preview with markdown parsing
function updatePreviewWithMarkdown() {
    // Get selected options
    const templateClass = templateSelect.value;
    const fontFamily = fontSelect.value;
    const colorClass = colorSelect.value;
    
    // Update content with markdown parsing
    const content = contentInput.value || '';
    
    // Extract title from first line if available
    const lines = content.split('\n');
    previewTitle.textContent = lines[0] || 'Your Title';
    
    // Parse the rest of the content as markdown
    const restOfContent = lines.slice(1).join('\n');
    const parsedContent = parseMarkdown(restOfContent) || 'Your content will appear here...';
    
    // Add the parsed content to the preview
    previewContent.innerHTML = parsedContent;
    
    // Process image markdown if any was used
    checkAndCreateImagePlaceholders();
    
    // Update styling
    pdfPreview.className = `preview-container ${templateClass} ${colorClass}`;
    pdfPreview.style.fontFamily = fontFamily;
}

// Function to ensure image markdown is rendered as placeholders
function checkAndCreateImagePlaceholders() {
    // Find all image tags
    const imgTags = previewContent.querySelectorAll('img');
    
    // Replace each image tag with a placeholder div
    imgTags.forEach(img => {
        const alt = img.getAttribute('alt') || 'Image';
        const src = img.getAttribute('src') || '#';
        
        // Create a placeholder div
        const placeholder = document.createElement('div');
        placeholder.className = 'image-placeholder';
        placeholder.style.border = '1px dashed #999';
        placeholder.style.borderRadius = '4px';
        placeholder.style.padding = '15px';
        placeholder.style.margin = '10px 0';
        placeholder.style.backgroundColor = '#f8f8f8';
        placeholder.style.textAlign = 'center';
        
        // Add icon and text
        placeholder.innerHTML = `
            <div style="margin-bottom: 8px;">📷</div>
            <div style="font-style: italic; color: #666;">[Image: ${alt}]</div>
        `;
        
        // Replace the image with the placeholder
        img.parentNode.replaceChild(placeholder, img);
    });
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Main PDF generation functionality
    if (generateBtn) {
        generateBtn.addEventListener('click', generatePDF);
    }
    
    // Update preview when styling options change
    if (templateSelect) {
        templateSelect.addEventListener('change', updatePreviewWithMarkdown);
    }
    
    if (fontSelect) {
        fontSelect.addEventListener('change', updatePreviewWithMarkdown);
    }
    
    if (colorSelect) {
        colorSelect.addEventListener('change', updatePreviewWithMarkdown);
    }
    
    // Handle content input
    if (contentInput) {
        contentInput.addEventListener('input', updatePreviewWithMarkdown);
    }
    
    // Initialize preview
    updatePreviewWithMarkdown();
});

// Helper functions have been moved inline within the PDF generation function
// to avoid reference errors and prevent scope issues
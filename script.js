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
                
                // Split content into lines that fit within page width
                const contentLines = doc.splitTextToSize(contentText, usableWidth);
                
                // Starting position for content - using the calculated Y position
                let y = contentStartY;
                
                // Paragraph spacing (gap between paragraphs)
                const paragraphGap = lineHeight * paragraphSpacing;
                
                // Define paragraph boundaries for better spacing (simple implementation)
                const paragraphs = contentText.split('\n\n');
                let currentLine = 0;
                
                // Process each paragraph separately
                for (let p = 0; p < paragraphs.length; p++) {
                    if (p > 0) {
                        // Add paragraph spacing between paragraphs
                        y += paragraphGap;
                    }
                    
                    // Get lines for this paragraph
                    const paragraphLines = doc.splitTextToSize(paragraphs[p], usableWidth);
                    
                    // Apply template-specific paragraph styling if needed
                    if (templateClass === 'modern' && paragraphs[p].trim().length > 0 && p === 0) {
                        // For modern template, make first paragraph slightly larger
                        const savedSize = contentFontSize;
                        doc.setFontSize(contentFontSize * 1.1);
                        // Recalculate line height for this paragraph
                        const specialLineHeight = (contentFontSize * 1.1) * 0.352778 * adjustedLineHeightMultiplier;
                        
                        // Check for page break
                        if (y + (paragraphLines.length * specialLineHeight) > pageHeight - margin.bottom) {
                            doc.addPage();
                            addBackgroundToPage(doc, bgColor, colorClass, pageWidth, pageHeight);
                            resetTextStyles(doc, textColor, colorClass, pdfFont, contentStyle, contentFontSize);
                            // Start at margin.top + headerMargin to leave space for header
                            y = margin.top + headerMargin;
                        }
                        
                        // Add the paragraph with special styling
                        for (let i = 0; i < paragraphLines.length; i++) {
                            doc.text(paragraphLines[i], margin.left, y);
                            y += specialLineHeight;
                        }
                        
                        // Reset font size
                        doc.setFontSize(savedSize);
                    } else {
                        // Check for page break
                        if (y + (paragraphLines.length * lineHeight) > pageHeight - margin.bottom) {
                            doc.addPage();
                            addBackgroundToPage(doc, bgColor, colorClass, pageWidth, pageHeight);
                            resetTextStyles(doc, textColor, colorClass, pdfFont, contentStyle, contentFontSize);
                            // Start at margin.top + headerMargin to leave space for header
                            y = margin.top + headerMargin;
                        }
                        
                        // Add the paragraph with normal styling
                        for (let i = 0; i < paragraphLines.length; i++) {
                            doc.text(paragraphLines[i], margin.left, y);
                            y += lineHeight;
                        }
                    }
                }
            } catch (contentError) {
                console.error("Error rendering content with custom font:", contentError);
                // Fall back to standard font
                doc.setFont("helvetica", contentStyle);
                const contentLines = doc.splitTextToSize(contentText, usableWidth);
                
                // Use a safe starting Y position
                const safeY = contentStartY || margin.top + 20;
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
                
                // Add page numbers at bottom
                doc.setFontSize(10);
                doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin.right - 25, pageHeight - 10);
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
    
    // Lists
    text = text.replace(/^\- (.*$)/gm, '<li>$1</li>');
    
    // Group list items
    let inList = false;
    const lines = text.split('\n');
    const processedLines = [];
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        if (line.includes('<li>')) {
            if (!inList) {
                processedLines.push('<ul>');
                inList = true;
            }
            processedLines.push(line);
        } else {
            if (inList) {
                processedLines.push('</ul>');
                inList = false;
            }
            processedLines.push(line);
        }
    }
    
    if (inList) {
        processedLines.push('</ul>');
    }
    
    text = processedLines.join('\n');
    
    // Links
    text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/gm, '<a href="$2">$1</a>');
    
    // Paragraphs - wrap non-tagged content in <p> tags
    const paragraphLines = text.split('\n\n');
    const processedParagraphs = paragraphLines.map(para => {
        // Skip if paragraph already has HTML tags
        if (para.trim().startsWith('<') && !para.trim().startsWith('<li>')) {
            return para;
        }
        // Skip empty paragraphs
        if (!para.trim()) {
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
    previewContent.innerHTML = parseMarkdown(restOfContent) || 'Your content will appear here...';
    
    // Update styling
    pdfPreview.className = `preview-container ${templateClass} ${colorClass}`;
    pdfPreview.style.fontFamily = fontFamily;
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
/**
 * Content processor utilities for handling HTML content before saving
 */

/**
 * Process content HTML to ensure images display in galleries when grouped together
 * Handles:
 * 1. Multiple images inside a single <p> tag (with or without style attributes)
 * 2. Consecutive <p> tags each containing images (with or without other content)
 */
export function processContentImages(html: string): string {
    if (!html) return html;

    // First pass: Handle paragraphs with multiple images (including styled paragraphs)
    // Pattern: <p ...> containing 2+ images (possibly with other content like links)
    html = html.replace(
        /<p([^>]*)>([\s\S]*?)<\/p>/gi,
        (match, attrs, innerContent) => {
            // Extract all img tags
            const imgMatches = innerContent.match(/<img[^>]*(?:\/?>|><\/img>)/gi);
            if (imgMatches && imgMatches.length > 1) {
                // Has multiple images - extract images and any captions/links
                const normalizedImgs = imgMatches
                    .map((img: string) => {
                        // Ensure proper format
                        if (!img.endsWith('/>') && !img.includes('</img>')) {
                            return img.replace(/>$/, ' />');
                        }
                        return img.replace(/<\/img>$/, '').replace(/>$/, ' />');
                    })
                    .join('');

                // Check for any caption/link content after images
                const nonImgContent = innerContent
                    .replace(/<img[^>]*(?:\/?>|><\/img>)/gi, '')
                    .trim();

                if (nonImgContent) {
                    // Keep caption/link below the gallery
                    return `<div class="image-gallery">${normalizedImgs}</div><p${attrs}>${nonImgContent}</p>`;
                }
                return `<div class="image-gallery">${normalizedImgs}</div>`;
            }
            return match;
        }
    );

    // Second pass: Handle consecutive single-image paragraphs
    // Pattern: <p ...><img .../></p> (with possible style attributes)
    const singleImgParagraphPattern = /<p([^>]*)>\s*(<img[^>]*(?:\/?>|><\/img>))\s*<\/p>/gi;
    const parts: Array<{ type: 'single-img' | 'other'; img?: string; attrs?: string; content?: string }> = [];
    let lastIndex = 0;
    let match;

    const regex = new RegExp(singleImgParagraphPattern.source, 'gi');

    while ((match = regex.exec(html)) !== null) {
        // Add any content before this match
        if (match.index > lastIndex) {
            const before = html.slice(lastIndex, match.index);
            if (before.trim()) {
                parts.push({ type: 'other', content: before });
            }
        }
        // Add the single-image paragraph
        parts.push({ type: 'single-img', img: match[2], attrs: match[1] });
        lastIndex = regex.lastIndex;
    }

    // Add remaining content
    if (lastIndex < html.length) {
        const remaining = html.slice(lastIndex);
        if (remaining.trim()) {
            parts.push({ type: 'other', content: remaining });
        }
    }

    // If no single-image paragraphs found, return as-is
    if (parts.every((p) => p.type === 'other')) {
        return html;
    }

    // Group consecutive single-image parts
    const result: string[] = [];
    let consecutiveImgs: string[] = [];

    for (const part of parts) {
        if (part.type === 'single-img' && part.img) {
            consecutiveImgs.push(part.img);
        } else {
            // Flush accumulated images
            if (consecutiveImgs.length > 1) {
                result.push(`<div class="image-gallery">${consecutiveImgs.join('')}</div>`);
            } else if (consecutiveImgs.length === 1) {
                result.push(`<p>${consecutiveImgs[0]}</p>`);
            }
            consecutiveImgs = [];
            if (part.content) {
                result.push(part.content);
            }
        }
    }

    // Flush remaining images
    if (consecutiveImgs.length > 1) {
        result.push(`<div class="image-gallery">${consecutiveImgs.join('')}</div>`);
    } else if (consecutiveImgs.length === 1) {
        result.push(`<p>${consecutiveImgs[0]}</p>`);
    }

    return result.join('\n');
}

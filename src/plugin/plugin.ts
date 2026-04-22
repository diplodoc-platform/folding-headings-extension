import type MarkdownIt from 'markdown-it';
import type {IDGenerator} from '@diplodoc/utils';

import {headingBlockRule} from './headingBlockRule';
import {createSectionsCoreRule} from './sectionsCoreRule';

/**
 * Creates a folding-heading plugin with an optional external ID generator.
 * When `generateID` is provided, all generated section IDs share the same counter
 * as other plugins, ensuring deterministic output regardless of --merge-includes.
 * When omitted, the plugin uses its internal fallback generator.
 *
 * @param generateID - Optional external ID generator shared with the rest of the transform pipeline.
 * @returns Markdown-it plugin that registers folding heading parsing and section wrapping rules.
 */
export function createFoldingHeadingPlugin(generateID?: IDGenerator) {
    return (md: MarkdownIt) => {
        md.block.ruler.at('heading', headingBlockRule, {
            alt: ['paragraph', 'reference', 'blockquote'],
        });
        md.core.ruler.push('heading_sections', createSectionsCoreRule(generateID));
    };
}

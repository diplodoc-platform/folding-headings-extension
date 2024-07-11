import type {PluginSimple} from 'markdown-it';

import {headingBlockRule} from './headingBlockRule';
import {sectionsCoreRule} from './sectionsCoreRule';

export const foldingHeadingPlugin: PluginSimple = (md) => {
    md.block.ruler.at('heading', headingBlockRule, {alt: ['paragraph', 'reference', 'blockquote']});
    md.core.ruler.push('heading_sections', sectionsCoreRule);
};

import type MarkdownIt from 'markdown-it';
import {PluginWithOptions} from 'markdown-it';

import {ENV_FLAG_NAME} from './const';
import {foldingHeadingPlugin} from './plugin';
import {type Runtime, copyRuntime, dynrequire, hidden} from './utils';

const registerTransform = (
    md: MarkdownIt,
    {
        runtime,
        bundle,
        output,
    }: Pick<NormalizedPluginOptions, 'bundle' | 'runtime'> & {
        output: string;
    },
) => {
    md.use(foldingHeadingPlugin);
    md.core.ruler.push('heading_sections_after', ({env}) => {
        hidden(env, 'bundled', new Set<string>());

        if (env?.[ENV_FLAG_NAME]) {
            env.meta = env.meta || {};
            env.meta.script = env.meta.script || [];
            env.meta.script.push(runtime.script);
            env.meta.style = env.meta.style || [];
            env.meta.style.push(runtime.style);

            if (bundle) {
                copyRuntime({runtime, output}, env.bundled);
            }
        }
    });
};

type NormalizedPluginOptions = Omit<PluginOptions, 'runtime'> & {
    runtime: Runtime;
};

export type PluginOptions = {
    runtime?:
        | string
        | {
              script: string;
              style: string;
          };
    bundle?: boolean;
};

type InputOptions = {
    destRoot: string;
};

export function transform(options: Partial<PluginOptions> = {}) {
    const {bundle = true} = options;

    if (bundle && typeof options.runtime === 'string') {
        throw new TypeError('Option `runtime` should be record when `bundle` is enabled.');
    }

    const runtime: Runtime =
        typeof options.runtime === 'string'
            ? {script: options.runtime, style: options.runtime}
            : options.runtime || {
                  script: '_assets/folding-headings-extension.js',
                  style: '_assets/folding-headings-extension.css',
              };

    const plugin: PluginWithOptions<{output?: string}> = function (
        md: MarkdownIt,
        {output = '.'} = {},
    ) {
        registerTransform(md, {
            runtime,
            bundle,
            output,
        });
    };

    Object.assign(plugin, {
        collect(input: string, {destRoot = '.'}: InputOptions) {
            const MdIt = dynrequire('markdown-it');
            const md = new MdIt().use((md: MarkdownIt) => {
                registerTransform(md, {
                    runtime,
                    bundle,
                    output: destRoot,
                });
            });

            md.parse(input, {});
        },
    });

    return plugin;
}

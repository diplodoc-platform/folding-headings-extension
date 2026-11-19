import type MarkdownItConstructor from 'markdown-it';
import type {Env, MarkdownIt} from 'markdown-it';
import type {IDGenerator} from '@diplodoc/utils';

import {ENV_FLAG_NAME} from './const';
import {createFoldingHeadingPlugin} from './plugin';
import {type Runtime, copyRuntime, dynrequire, hidden} from './utils';

type RuntimeEnv = Env & {meta?: {script?: string[]; style?: string[]}};

const registerTransform = (
    md: MarkdownIt,
    {
        runtime,
        bundle,
        output,
        generateID,
    }: Pick<NormalizedPluginOptions, 'bundle' | 'runtime'> & {
        output: string;
        generateID?: IDGenerator;
    },
) => {
    md.use(createFoldingHeadingPlugin(generateID));
    md.core.ruler.push('heading_sections_after', ({env}: {env: RuntimeEnv}) => {
        const runtimeEnv = hidden(env, 'bundled', new Set<string>());

        if (env?.[ENV_FLAG_NAME]) {
            env.meta = env.meta || {};
            env.meta.script = env.meta.script || [];
            env.meta.script.push(runtime.script);
            env.meta.style = env.meta.style || [];
            env.meta.style.push(runtime.style);

            if (bundle) {
                copyRuntime({runtime, output}, runtimeEnv.bundled);
            }
        }
    });
};

type NormalizedPluginOptions = Omit<TransformOptions, 'runtime'> & {
    runtime: Runtime;
};

export type TransformOptions = {
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

export function transform(options: Partial<TransformOptions> = {}) {
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

    const plugin = function (
        md: MarkdownIt,
        {output = '.', generateID}: {output?: string; generateID?: IDGenerator} = {},
    ) {
        registerTransform(md, {
            runtime,
            bundle,
            output,
            generateID,
        });
    };

    return Object.assign(plugin, {
        collect(input: string, {destRoot = '.'}: InputOptions) {
            const MdIt: typeof MarkdownItConstructor = dynrequire('markdown-it');
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
}

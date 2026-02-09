import {defineConfig} from 'vitest/config';

export default defineConfig({
    test: {
        environment: 'node',
        globals: true,
        include: ['test/**/*.test.ts', 'test/**/*.spec.ts'],
        exclude: ['node_modules', 'build'],
        snapshotFormat: {
            escapeString: true,
            printBasicPrototype: true,
        },
    },
});

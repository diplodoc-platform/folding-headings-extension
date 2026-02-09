import {defineConfig} from 'vitest/config';

export default defineConfig({
    test: {
        environment: 'node',
        globals: true,
        include: ['tests/**/*.test.ts', 'tests/**/*.spec.ts'],
        exclude: ['node_modules', 'build'],
        snapshotFormat: {
            escapeString: true,
            printBasicPrototype: true,
        },
    },
});

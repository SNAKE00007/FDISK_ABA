module.exports = {
    env: {
        node: true,
        es2021: true,
    },
    extends: [
        'eslint:recommended',
        'plugin:prettier/recommended'
    ],
    parserOptions: {
        ecmaVersion: 12,
        sourceType: 'module',
    },
    rules: {
        'no-console': 'warn',
        'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
        'prettier/prettier': [
            'error',
            {
                singleQuote: true,
                semi: true,
                tabWidth: 4,
                trailingComma: 'es5',
                printWidth: 100,
                bracketSpacing: true,
            },
        ],
    },
}; 
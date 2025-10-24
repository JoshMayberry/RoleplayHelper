/* eslint-disable */
import vuetify from 'eslint-config-vuetify'
import tsParser from '@typescript-eslint/parser'
import tsPlugin from '@typescript-eslint/eslint-plugin'

const config = vuetify()

config.rules = {
	...config.rules,
	quotes: ['error', 'double', { avoidEscape: true, allowTemplateLiterals: true }],
	indent: ['error', 'tab', { SwitchCase: 1 }],
	'newline-per-chained-call': ['error', { ignoreChainWithDepth: 0 }],
}

// Attach the TypeScript plugin so rules referencing @typescript-eslint/* are available
config.plugins = {
	...config.plugins,
	'@typescript-eslint': tsPlugin,
}

// Ensure ESLint can parse TypeScript files when the extension runs in VS Code.
// Use the actual parser module (not a string) so the ESLint server can resolve it.
config.overrides = [
	...(config.overrides || []),
	{
		files: ['**/*.ts', '**/*.tsx', '**/*.vue'],
		languageOptions: {
			parser: tsParser,
			parserOptions: {
				ecmaVersion: 'latest',
				sourceType: 'module',
				project: './tsconfig.json',
				// Use cwd so the ESLint server (VS Code) can resolve the tsconfig
				tsconfigRootDir: process.cwd(),
			},
		},
		// You can add TypeScript-specific rules here if desired
	},
]

export default config

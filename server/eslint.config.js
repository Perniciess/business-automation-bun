import antfu from '@antfu/eslint-config'

export default antfu({
    typescript: true,
    node: true,
    jsonc: true,

    stylistic: {
        indent: 4,
        quotes: 'single',
    },
})

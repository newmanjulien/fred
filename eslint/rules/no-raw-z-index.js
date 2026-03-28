const RAW_Z_UTILITY_PATTERN =
	/(^|[\s"'`])((?:[\w-]+:)*-?z-(?:\[[^\]\n]+\]|[a-z0-9-]+))(?=$|[\s"'`])/gm;
const INLINE_STYLE_Z_INDEX_PATTERN = /\bstyle\s*=\s*["'][^"'\n]*\bz-index\s*:/gm;
const STYLE_DIRECTIVE_Z_INDEX_PATTERN = /\bstyle:z-index\b/gm;
const SVELTE_STYLE_BLOCK_PATTERN = /<style(?:\s[^>]*)?>[\s\S]*?<\/style>/gm;

function getIgnoredRanges(sourceCode) {
	const ranges = sourceCode.getAllComments().map(({ range }) => range);

	for (const match of sourceCode.text.matchAll(SVELTE_STYLE_BLOCK_PATTERN)) {
		if (match.index === undefined) {
			continue;
		}

		ranges.push([match.index, match.index + match[0].length]);
	}

	return ranges;
}

function isIgnoredRange(start, end, ranges) {
	return ranges.some(([rangeStart, rangeEnd]) => start < rangeEnd && end > rangeStart);
}

function reportMatches(context, ignoredRanges, pattern, message, getRange) {
	const sourceCode = context.sourceCode;

	for (const match of sourceCode.text.matchAll(pattern)) {
		const range = getRange(match);

		if (!range) {
			continue;
		}

		const [start, end] = range;

		if (isIgnoredRange(start, end, ignoredRanges)) {
			continue;
		}

		context.report({
			loc: {
				start: sourceCode.getLocFromIndex(start),
				end: sourceCode.getLocFromIndex(end)
			},
			message
		});
	}
}

export default {
	meta: {
		type: 'problem',
		docs: {
			description:
				'Disallow raw z-index utilities and inline z-index declarations outside the shared layer system.'
		},
		schema: []
	},
	create(context) {
		const ignoredRanges = getIgnoredRanges(context.sourceCode);

		return {
			Program() {
				reportMatches(
					context,
					ignoredRanges,
					RAW_Z_UTILITY_PATTERN,
					'Use the shared layer system or component-local structure instead of raw z-* utilities.',
					(match) => {
						if (match.index === undefined) {
							return null;
						}

						const boundary = match[1] ?? '';
						const token = match[2];

						if (!token) {
							return null;
						}

						const start = match.index + boundary.length;
						return [start, start + token.length];
					}
				);

				reportMatches(
					context,
					ignoredRanges,
					INLINE_STYLE_Z_INDEX_PATTERN,
					'Do not set z-index in inline styles. Use the shared layer system instead.',
					(match) => {
						if (match.index === undefined) {
							return null;
						}

						const offset = match[0].indexOf('z-index');

						if (offset < 0) {
							return null;
						}

						const start = match.index + offset;
						return [start, start + 'z-index'.length];
					}
				);

				reportMatches(
					context,
					ignoredRanges,
					STYLE_DIRECTIVE_Z_INDEX_PATTERN,
					'Do not set z-index with a style directive. Use the shared layer system instead.',
					(match) => {
						if (match.index === undefined) {
							return null;
						}

						return [match.index, match.index + match[0].length];
					}
				);
			}
		};
	}
};

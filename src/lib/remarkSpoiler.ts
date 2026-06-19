import { visit } from 'unist-util-visit';
import type { Root, Text, Parent } from 'mdast';

const SPOILER_PATTERN =   /\|\|([^|]+?)\|\||\[spoiler]([\s\S]+?)\[\/spoiler]/gi;

export type SpoilerNode = {
    type: 'spoiler';
    children: Text[];
};

export function remarkSpoiler() {
    return (tree: Root) => {
        visit(tree, 'text', (node: Text, index, parent: Parent | undefined) => {
            if (!parent || index === undefined) return;
            const value = node.value;

            if (!SPOILER_PATTERN.test(value)) return;
            SPOILER_PATTERN.lastIndex = 0;

            const newNodes: (Text | SpoilerNode)[] = [];
            let lastEnd = 0;
            let match: RegExpExecArray | null;

            while ((match = SPOILER_PATTERN.exec(value)) !== null) {
                const matchStart = match.index;
                const matchEnd = matchStart + match[0].length;
                const inner = match[1] ?? match[2] ?? '';

                if (matchStart > lastEnd) {
                    newNodes.push({ type: 'text', value: value.slice(lastEnd, matchStart) });
                }

                newNodes.push({
                    type: 'spoiler',
                    children: [{ type: 'text', value: inner }],
                } as SpoilerNode);

                lastEnd = matchEnd;
            }

            if (lastEnd < value.length) {
                newNodes.push({ type: 'text', value: value.slice(lastEnd) });
            }

            parent.children.splice(index, 1, ...(newNodes as any));
            return index + newNodes.length;
        });
    };
}

export const spoilerHastHandler = (state: any, node: any) => {
    const result = {
        type: 'element',
        tagName: 'spoiler-text',
        properties: {},
        children: state.all(node),
    };
    state.patch(node, result);
    return result;
};
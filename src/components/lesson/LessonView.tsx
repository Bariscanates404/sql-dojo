'use client';

import { isValidElement, type ReactElement, type ReactNode, useMemo } from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';

import { stripTeacherSections } from '@lib/content/strip-teacher';
import { useRoleStore } from '@stores/roleStore';
import { useScratchpadStore } from '@stores/scratchpadStore';

type ElProps = { className?: string; children?: ReactNode };

function firstElement(children: ReactNode): ReactElement<ElProps> | null {
  const arr = Array.isArray(children) ? children : [children];
  for (const c of arr) if (isValidElement(c)) return c as ReactElement<ElProps>;
  return null;
}

function nodeText(node: ReactNode): string {
  if (typeof node === 'string') return node;
  if (typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(nodeText).join('');
  if (isValidElement(node)) return nodeText((node.props as ElProps).children);
  return '';
}

export function LessonView({ markdown }: { markdown: string }) {
  const role = useRoleStore((s) => s.role);
  const openPanel = useScratchpadStore((s) => s.openPanel);

  const processed = useMemo(
    () => (role === 'teacher' ? markdown : stripTeacherSections(markdown)),
    [markdown, role],
  );

  const components = useMemo<Components>(
    () => ({
      pre(props) {
        const code = firstElement(props.children);
        const isSql = /language-sql/.test(code?.props.className ?? '');
        const sqlText = isSql ? nodeText(code?.props.children).replace(/\n+$/, '') : '';
        return (
          <div className="group relative">
            <pre>{props.children}</pre>
            {isSql && (
              <button
                type="button"
                onClick={() => openPanel(sqlText)}
                className="absolute right-2 top-2 rounded-md border border-border bg-background px-2 py-1 text-xs text-foreground opacity-0 shadow-sm transition group-hover:opacity-100"
              >
                ▶ Editörde aç
              </button>
            )}
          </div>
        );
      },
    }),
    [openPanel],
  );

  return (
    <article className="prose-dojo max-w-none">
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]} components={components}>
        {processed}
      </ReactMarkdown>
    </article>
  );
}

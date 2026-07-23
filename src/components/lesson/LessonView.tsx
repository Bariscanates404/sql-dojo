'use client';

import {
  isValidElement,
  type ReactElement,
  type ReactNode,
  useCallback,
  useMemo,
  useRef,
} from 'react';
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

// Sentinel href used to turn the inline "[▶ Editörde dene]" markers into real buttons.
const TRY_HREF = '#deneme-tahtasi';

// Lesson tables double as a teaching aid: hovering a cell highlights its whole
// column and its row, so "sütun dikey, satır yatay" is something you can see.
function InteractiveTable({ children }: { children?: ReactNode }) {
  const tableRef = useRef<HTMLTableElement>(null);
  const active = useRef<{ col: number; row: HTMLTableRowElement | null; cells: HTMLElement[] }>({
    col: -1,
    row: null,
    cells: [],
  });

  const clear = useCallback(() => {
    for (const c of active.current.cells) c.classList.remove('cell-col-hl');
    active.current.row?.classList.remove('cell-row-hl');
    active.current = { col: -1, row: null, cells: [] };
  }, []);

  const onMove = useCallback(
    (e: React.MouseEvent) => {
      const table = tableRef.current;
      if (!table) return;
      const cell = (e.target as HTMLElement).closest('td,th') as HTMLTableCellElement | null;
      if (!cell || !table.contains(cell)) {
        clear();
        return;
      }
      const col = cell.cellIndex;
      const row = cell.parentElement as HTMLTableRowElement | null;
      if (col === active.current.col && row === active.current.row) return;
      clear();
      const cells: HTMLElement[] = [];
      for (const tr of Array.from(table.rows)) {
        const c = tr.cells.item(col);
        if (c) {
          c.classList.add('cell-col-hl');
          cells.push(c);
        }
      }
      row?.classList.add('cell-row-hl');
      active.current = { col, row, cells };
    },
    [clear],
  );

  return (
    <table ref={tableRef} className="lesson-table" onMouseMove={onMove} onMouseLeave={clear}>
      {children}
    </table>
  );
}

export function LessonView({ markdown }: { markdown: string }) {
  const role = useRoleStore((s) => s.role);
  const openPanel = useScratchpadStore((s) => s.openPanel);

  const processed = useMemo(() => {
    const base = role === 'teacher' ? markdown : stripTeacherSections(markdown);
    // "[▶ Editörde dene]" task markers -> markdown links we render as buttons below.
    return base.replace(/\[▶\s*Editörde dene\s*\]/g, `[▶ Editörde dene](${TRY_HREF})`);
  }, [markdown, role]);

  const components = useMemo<Components>(
    () => ({
      // Lesson tables become interactive: hover highlights the column + row.
      table: ({ children }) => <InteractiveTable>{children}</InteractiveTable>,
      // Inline task marker -> button that opens an empty Deneme Tahtası to solve the task.
      a({ href, children, ...props }) {
        if (href === TRY_HREF) {
          return (
            <button
              type="button"
              onClick={() => openPanel('')}
              className="mx-0.5 inline-flex items-center gap-1 rounded-md border border-accent/50 bg-accent/10 px-2 py-0.5 align-baseline text-xs font-medium text-accent transition hover:bg-accent/20"
            >
              {children}
            </button>
          );
        }
        const external = typeof href === 'string' && /^https?:/.test(href);
        return (
          <a
            href={href}
            className="text-primary underline"
            {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}
            {...props}
          >
            {children}
          </a>
        );
      },
      // SQL code blocks get an always-visible "Editörde aç" button that loads the query.
      pre(props) {
        const code = firstElement(props.children);
        const isSql = /language-sql/.test(code?.props.className ?? '');
        const sqlText = isSql ? nodeText(code?.props.children).replace(/\n+$/, '') : '';
        return (
          <div className="group relative">
            <pre>{props.children}</pre>
            {isSql && sqlText && (
              <button
                type="button"
                onClick={() => openPanel(sqlText)}
                className="absolute right-2 top-2 rounded-md border border-border bg-background px-2 py-1 text-xs text-foreground opacity-70 shadow-sm transition hover:opacity-100 group-hover:opacity-100"
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

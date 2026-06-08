'use client';

import { PostgreSQL, sql } from '@codemirror/lang-sql';
import { Prec } from '@codemirror/state';
import { keymap } from '@codemirror/view';
import CodeMirror from '@uiw/react-codemirror';
import { useMemo, useRef } from 'react';

import { usePrefersDark } from '@hooks/usePrefersDark';

interface SqlEditorProps {
  value: string;
  onChange: (value: string) => void;
  onRun?: () => void;
  fontSize?: number;
  minHeight?: string;
  readOnly?: boolean;
}

export function SqlEditor({
  value,
  onChange,
  onRun,
  fontSize = 14,
  minHeight = '110px',
  readOnly = false,
}: SqlEditorProps) {
  const onRunRef = useRef(onRun);
  onRunRef.current = onRun;
  const dark = usePrefersDark();

  // Stable extensions: Cmd/Ctrl+Enter runs the query via the latest callback.
  const extensions = useMemo(
    () => [
      sql({ dialect: PostgreSQL }),
      Prec.highest(
        keymap.of([
          {
            key: 'Mod-Enter',
            run: () => {
              onRunRef.current?.();
              return true;
            },
          },
        ]),
      ),
    ],
    [],
  );

  return (
    <div className="overflow-hidden rounded-xl border border-border" style={{ fontSize }}>
      <CodeMirror
        value={value}
        onChange={onChange}
        readOnly={readOnly}
        theme={dark ? 'dark' : 'light'}
        minHeight={minHeight}
        extensions={extensions}
        basicSetup={{
          lineNumbers: true,
          foldGutter: false,
          highlightActiveLine: !readOnly,
          autocompletion: true,
        }}
      />
    </div>
  );
}

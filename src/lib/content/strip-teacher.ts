// Role-visibility rule (CURRICULUM_MASTER 5b): any heading whose text contains
// the 🧑‍🏫 marker ("Öğretmen için" / "Öğretmen notu") starts a TEACHER-ONLY block.
// The block runs until the next heading at the same or higher level (or EOF).
// Students get the markdown with those blocks removed. Code fences are respected
// so a leading "#" inside a code block is never mistaken for a heading.
export function stripTeacherSections(md: string): string {
  const lines = md.split('\n');
  const out: string[] = [];
  let skipping = false;
  let skipLevel = 0;
  let inFence = false;

  for (const line of lines) {
    const isFence = /^\s*```/.test(line);
    if (isFence) inFence = !inFence;

    if (!inFence && !isFence) {
      const m = /^(#{1,6})\s+(.*)$/.exec(line);
      if (m) {
        const level = m[1].length;
        const text = m[2];
        // 🧑‍🏫 is a ZWJ sequence; match on both base emoji to survive any encoding variation.
        const isTeacher = text.includes('🧑') && text.includes('🏫');
        if (skipping && level <= skipLevel) skipping = false;
        if (!skipping && isTeacher) {
          skipping = true;
          skipLevel = level;
          continue; // drop the teacher heading itself
        }
      }
    }

    if (!skipping) out.push(line);
  }

  // collapse the runs of blank lines that removal can leave behind
  return out.join('\n').replace(/\n{3,}/g, '\n\n');
}

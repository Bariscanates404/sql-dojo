import rehypeRaw from 'rehype-raw';
import rehypeStringify from 'rehype-stringify';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { unified } from 'unified';

// Dışa aktarılan dosyanın markdown motoru.
//
// Eklenti dizisi, ekrandaki LessonView ile BİLEREK aynıdır (remark-gfm + rehype-raw):
// aynı markdown iki yerde farklı görünmesin. Tek fark, sonunda React yerine string
// üretmemiz; o yüzden rehype-stringify var, react-markdown yok.
export async function markdownToHtml(md: string): Promise<string> {
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(md);

  return String(file);
}

/** Geniş tabloların sayfayı yatay kaydırmaması için her tabloyu kendi kutusuna al. */
export function wrapTables(html: string): string {
  return html.replace(/<table>/g, '<div class="table-scroll"><table>').replace(/<\/table>/g, '</table></div>');
}

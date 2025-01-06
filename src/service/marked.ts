import { marked } from "marked";
import DOMPurify from "dompurify";
import hljs from "highlight.js";

// カスタムレンダラーを作成
const renderer = new marked.Renderer();

renderer.code = (code: string, lang: string | undefined) => {
  const highlighted =
    lang && hljs.getLanguage(lang)
      ? hljs.highlight(code, { language: lang }).value
      : hljs.highlightAuto(code).value;
  return `<pre><code class="hljs ${lang}">${highlighted}</code></pre>`;
};

marked.setOptions({
  renderer: renderer,
  gfm: true,
  breaks: true,
});

const sanitize = (markdown: string): string => {
  return DOMPurify.sanitize(marked(markdown));
};

export default sanitize;

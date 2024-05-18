import hljs from "highlight.js/lib/core"

// Import only the languages we use to minimize bundle size
import javascript from "highlight.js/lib/languages/javascript"
import typescript from "highlight.js/lib/languages/typescript"
import css from "highlight.js/lib/languages/css"
import html from "highlight.js/lib/languages/xml"
import python from "highlight.js/lib/languages/python"
import java from "highlight.js/lib/languages/java"

hljs.registerLanguage("javascript", javascript)
hljs.registerLanguage("typescript", typescript)
hljs.registerLanguage("css", css)
hljs.registerLanguage("html", html)
hljs.registerLanguage("python", python)
hljs.registerLanguage("java", java)

export default hljs

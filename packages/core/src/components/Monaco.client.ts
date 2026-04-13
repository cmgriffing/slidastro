import * as monaco from 'monaco-editor'
import { shikiToMonaco } from '@shikijs/monaco'
import { createHighlighter } from 'shiki'
import { setupTypeAcquisition } from '@typescript/ata'
import ts from 'typescript'

// @ts-ignore
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker'
// @ts-ignore
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker'
// @ts-ignore
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker'
// @ts-ignore
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker'
// @ts-ignore
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'

// Configure workers for Vite
// @ts-ignore
window.MonacoEnvironment = {
  getWorker(_moduleId: any, label: string) {
    if (label === 'json') {
      return new jsonWorker()
    }
    if (label === 'css' || label === 'scss' || label === 'less') {
      return new cssWorker()
    }
    if (label === 'html' || label === 'handlebars' || label === 'razor') {
      return new htmlWorker()
    }
    if (label === 'typescript' || label === 'javascript') {
      return new tsWorker()
    }
    return new editorWorker()
  }
}

let highlighter: any

async function getHighlighter() {
  if (highlighter) return highlighter
  highlighter = await createHighlighter({
    themes: ['vitesse-light', 'vitesse-dark'],
    langs: ['typescript', 'javascript', 'css', 'html', 'json', 'vue', 'svelte'],
  })
  return highlighter
}

export async function initMonaco() {
  const containers = document.querySelectorAll('.monaco-container')
  if (containers.length === 0) return

  const h = await getHighlighter()
  
  // Register Shiki for Monaco
  shikiToMonaco(h, monaco)

  for (const container of Array.from(containers)) {
    if ((container as any)._monaco) continue

    const lang = container.getAttribute('data-lang') || 'typescript'
    const content = container.getAttribute('data-content') || ''
    
    const editor = monaco.editor.create(container as HTMLElement, {
      value: content,
      language: lang,
      theme: document.documentElement.classList.contains('dark') ? 'vitesse-dark' : 'vitesse-light',
      automaticLayout: true,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      fontSize: 14,
      lineNumbers: 'on',
      roundedSelection: true,
      scrollbar: {
        vertical: 'auto',
        horizontal: 'auto',
      },
    })

    ;(container as any)._monaco = editor

    // Setup ATA for TypeScript/JavaScript
    if (lang === 'typescript' || lang === 'javascript') {
      const ata = setupTypeAcquisition({
        projectName: 'slidastro-monaco',
        typescript: ts,
        logger: console,
        delegate: {
          receivedFile: (code, path) => {
            monaco.languages.typescript.typescriptDefaults.addExtraLib(code, `file:///${path}`)
          },
        },
      })

      editor.onDidChangeModelContent(() => {
        ata(editor.getValue())
      })

      // Initial run
      ata(editor.getValue())
    }
  }

  // Handle theme changes
  const observer = new MutationObserver(() => {
    const isDark = document.documentElement.classList.contains('dark')
    monaco.editor.setTheme(isDark ? 'vitesse-dark' : 'vitesse-light')
  })
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
}

/**
 * Shared TypeScript interfaces for Slidastro
 */

export type FrontmatterStyle = 'frontmatter' | 'yaml'

export interface SlideInfoBase {
  revision?: string
  frontmatter: Record<string, any>
  content: string
  frontmatterRaw?: string
  note?: string
  title?: string
  level?: number
  /**
   * Image URLs extracted from the slide content
   */
  images?: string[]
}

export interface SourceSlideInfo extends SlideInfoBase {
  /**
   * The filepath of the markdown file
   */
  filepath: string
  /**
   * The index of the slide in the markdown file
   */
  index: number
  /**
   * The range of the slide in the markdown file
   */
  start: number
  contentStart: number
  end: number
  raw: string
  /**
   * Raw content before being processed by preparsers
   */
  contentRaw: string
  /**
   * Slides imported by this slide.
   */
  imports?: SourceSlideInfo[]
  frontmatterStyle?: FrontmatterStyle
}

export interface SlideInfo extends SlideInfoBase {
  /**
   * The index of the slide in the presentation
   */
  index: number
  /**
   * The importers of this slide. `[]` if this slide is the entry markdown file
   */
  importChain?: SourceSlideInfo[]
  /**
   * The source slide where the content is from
   */
  source: SourceSlideInfo
  noteHTML?: string
  contentHTML?: string
  slots?: Record<string, string>
}

export interface SlidastroThemeMeta {
  defaults?: Partial<SlidastroConfig>
  colorSchema?: 'dark' | 'light' | 'both'
  highlighter?: 'shiki'
}

export interface DetectedFeatures {
  katex: boolean
  monaco: false | {
    types: string[]
    deps: string[]
  }
  mermaid: boolean
}

export interface SlidastroMarkdown {
  filepath: string
  raw: string
  /**
   * All slides in this markdown file
   */
  slides: SourceSlideInfo[]
  errors?: { row: number; message: string }[]
}

export interface SlidastroConfig {
  theme: string
  title: string
  aspectRatio: number
  canvasWidth: number
  canvasHeight: number
  colorSchema: 'auto' | 'dark' | 'light'
  highlighter: 'shiki'
  themeCSS?: string
  drawings: {
    enabled: boolean
    persist: boolean | string
    presenterOnly: boolean
    syncAll: boolean
  }
  transition: string | null
}

export interface SlidastroData {
  /**
   * Slides that should be rendered (disabled slides excluded)
   */
  slides: SlideInfo[]
  entry: SlidastroMarkdown
  config: SlidastroConfig
  headmatter: Record<string, unknown>
  features: DetectedFeatures
  themeMeta?: SlidastroThemeMeta
  markdownFiles: Record<string, SlidastroMarkdown>
  /**
   * From watched files to indexes of slides that must be reloaded
   */
  watchFiles: Record<string, Set<number>>
  layoutsMap: Record<string, string>
}

import { marked } from "marked"

export function parseMarkdown(content) {
  return marked(content)
}
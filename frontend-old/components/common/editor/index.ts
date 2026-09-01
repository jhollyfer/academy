import { Editor as EditorRoot } from './editor'
import { EditorToolbar } from './toolbar'
import { ContentViewer } from './viewer'

export const Editor = Object.assign(EditorRoot, {
  Toolbar: EditorToolbar,
  Viewer: ContentViewer,
})

export type { EditorProps } from './editor'

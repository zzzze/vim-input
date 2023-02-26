export enum VimMode {
  GENERAL = 'general_mode',
  COMMAND = 'command_mode',
  EDIT = 'edit_mode',
  VISUAL = 'visual_mode',
}

export class VimBase {
  /**
   * default mode
   * @type {VimMode}
   */
  currentMode: VimMode = VimMode.EDIT

  /**
   * whether the request to replace a character
   */
  replaceRequest = false

  /**
   * whether the request to paste characters in new line
   */
  pasteInNewLineRequest = false

  /**
   * the starting position of selected text (visual mode)
   */
  visualPosition?: number = undefined

  /**
   * the end position of selected text (visual mode)
   */
  visualCursor?: number = undefined
}

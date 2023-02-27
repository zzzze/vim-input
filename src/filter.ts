import type { App as AppType } from './instance/app/app'
import { VimMode } from './instance/vim/init'
// const GENERAL = 'general_mode';
// const COMMAND = 'command_mode';
// const EDIT    = 'edit_mode';
// const VISUAL  = 'visual_mode';

export function code (App: AppType, code: number) {
  let passed = true
  if (code === 229) {
    if (App.vim.isMode(VimMode.GENERAL) || App.vim.isMode(VimMode.VISUAL)) {
      passed = false
      const msg = 'Execution failure! Please use the vim instructions in the English input method.'
      App._log(msg)
      App.config.showMsg(msg)
    }
  }
  return passed
}

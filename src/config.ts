export default {
  /**
   * whether to print debut messages
   */
  debug: true,

  /**
   * how to show msg from vim app
   * @param msg
   * @param code
   */
  showMsg (msg: string, _code?: string) {
    alert(msg)
  },

  /**
   * key codes white list of vim,
   * they are effective in general and visual mode
   */
  key_code_white_list: ['Tab', 'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12'].map(key => key.toLowerCase()),
}

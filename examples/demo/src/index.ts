import vim from 'vim-input'

vim.open({
  debug: true,
  showMsg: (msg: string) => {
    alert(`'msg: ${msg}`)
  },
})

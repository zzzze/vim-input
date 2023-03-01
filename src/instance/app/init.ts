import type { Router } from '../router/router'
import type { TextUtil } from '../text/text'
import type { Vim } from '../vim/vim'
import type config from '../../config'

export class AppBase {
  // /**
  //  * current element
  //  */
  // currentEle: HTMLInputElement | undefined = undefined

  /**
   * elements of vim.js app
   */
  boxes: Array<HTMLInputElement | HTMLTextAreaElement> = []

  // /**
  //  * app config
  //  */
  // config: typeof config | undefined = undefined

  // /**
  //  * Router instance
  //  */
  // router: Router | undefined = undefined

  // /**
  //  * Vim instance
  //  */
  // vim: Vim | undefined = undefined

  // /**
  //  * TextUtil instance
  //  */
  // textUtil: TextUtil | undefined = undefined

  // /**
  //  * clipboard of app
  //  */
  // clipboard?: string = undefined

  // /**
  //  * app do list
  //  */
  // doList = []

  /**
   * app do list deep
   */
  doListDeep = 100

  /**
   * previous key code
   */
  prevCode: string | undefined = undefined

  prevCodeTime = 0

  /**
   * numerical for vim command
   * @private
   */
  _number: number = 0

  /**
   * key codes white list of vim
   */
  key_code_white_list: string[] = []
}

// /**
//  * current element
//  * @type {undefined}
//  */
// exports.currentEle = undefined;
//
// /**
//  * elements of vim.js app
//  * @type {undefined}
//  */
// exports.boxes = undefined;
//
// /**
//  * app config
//  * @type {undefined}
//  */
// exports.config = undefined;
//
// /**
//  * Router instance
//  * @type {undefined}
//  */
// exports.router = undefined;
//
// /**
//  * Vim instance
//  * @type {undefined}
//  */
// exports.vim = undefined;
//
// /**
//  * TextUtil instance
//  * @type {undefined}
//  */
// exports.textUtil = undefined;
//
// /**
//  * clipboard of app
//  * @type {undefined}
//  */
// exports.clipboard = undefined;
//
// /**
//  * app do list
//  * @type {Array}
//  */
// exports.doList = [];
//
// /**
//  * app do list deep
//  * @type {number}
//  */
// exports.doListDeep = 100;
//
// /**
//  * previous key code
//  * @type {undefined}
//  */
// exports.prevCode = undefined;
//
// exports.prevCodeTime = 0;
//
// /**
//  * numerical for vim command
//  * @type {string}
//  * @private
//  */
// exports._number = '';
//
// /**
//  * key codes white list of vim
//  * @type {Array}
//  */
// exports.key_code_white_list = [];
//

const fs = require('fs')
const http = require('http')
const pathlib = require('path')
const process = require('process')
const showdown  = require('showdown')
const yargs = require('yargs')

showdown.setFlavor('github')

const argv = yargs
  .option('port',
    {
      alias: 'p',
      description: 'port number to listen on',
      type: 'number',
      default: 8000,
    }
  ).option('alias',
    {
      alias: 'a',
      description: 'add a url alias (i.e. /static -> ../assets)',
      type: 'string',
      nargs: 2
    }
  ).option('root',
    {
      alias: 'r',
      description: 'set the document root (defaults to cwd())',
      type: 'string',
      default: process.cwd(),
    }
  ).option('style',
    {
      alias: 's',
      description: 'set the stylesheet URL for Markdown files',
      type: 'string',
      default: '/_ehmdserver/md.css',
    }
  ).help().alias('help', 'h').argv


  console.log(argv.alias)
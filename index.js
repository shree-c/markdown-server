const http = require('http');
const pathlib = require('path');
const fs = require('fs');
const showdown = require('showdown');
const yargs = require('yargs')
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
function resolveUrl(url) {
    //resolves to absolute path
    return pathlib.resolve(`./${url}`);
}

function resolvePath(req, res, path) {
    //something relating to removing double slashes etc.
    path = pathlib.normalize(path)
    //checks whether a file exists
    if (fs.existsSync(path)) {
        //checking whether a normal file
        if (fs.lstatSync(path).isFile()) {
            return sendFile(req, res, path);
        } else if (fs.lstatSync(path).isDirectory()) {
            //if it is a directory
            //!!recursion
            //removing the last trailing slash
            resolvePath(req, res, `${path.replace(/\/$/, '')}/index.html`);
        }
    } else if (`${path}`.endsWith('.html')) {
        //if we have a file request ending with html and it doesn't exist
        //may be there is an md file which we need to convert
        return resolvePath(req, res, path.slice(0, -5) + '.md');
    } else {
        return sendError(req, res, 404);
    }
}

function sendError(req, res, code) {
    let messages = {
        404: 'Not Found'
    }
    res.writeHead(code, { 'Content-Type': 'text/html' })
    res.end(`<html><body><h1>${code} ${messages[code]}</h1></body</html>`)
}

function sendFile(req, rsp, path) {
  let ctype
  ext = path.split('/').slice(-1)[0].split('.').slice(-1)[0]
  switch (ext) {
    case 'css':
    case 'html':
      ctype = `text/${ext}`; break
    case 'gif':
    case 'jpeg':
    case 'png':
      ctype = `image/${ext}`; break
    case 'jpg':
      ctype = 'image/jpeg'; break
    case 'js':
      ctype = 'text/javascript'; break
    case 'md':
      return sendMarkdown(req, rsp, path)
    default:
      ctype = 'text/plain'
  }
  body = fs.readFileSync(path)
  rsp.writeHead(200,
    {
      'Content-Type': ctype,
      'Content-Length': Buffer.byteLength(body)
    }
  )
  rsp.end(body)
  logRequest(req, 200)

  return true
}

function sendFile(req, rsp, path) {
  let ctype
  ext = path.split('/').slice(-1)[0].split('.').slice(-1)[0]
  switch (ext) {
    case 'css':
    case 'html':
      ctype = `text/${ext}`; break
    case 'gif':
    case 'jpeg':
    case 'png':
      ctype = `image/${ext}`; break
    case 'jpg':
      ctype = 'image/jpeg'; break
    case 'js':
      ctype = 'text/javascript'; break
    case 'md':
      return sendMarkdown(req, rsp, path)
    default:
      ctype = 'text/plain'
  }
  body = fs.readFileSync(path)
  rsp.writeHead(200,
    {
      'Content-Type': ctype,
      'Content-Length': Buffer.byteLength(body)
    }
  )
  rsp.end(body)
  logRequest(req, 200)

  return true
}

function sendMarkdown(req, res, path) {
    const body = fs.readFileSync(path, 'utf-8');
    const converter = new showdown.Converter();
    let html = '<html><body>' + converter.makeHtml(body) + '</body></html>';
    res.writeHead(200,
        {
            'Content-Type': 'text/html',
            'Content-Length': Buffer.byteLength(html)
        }
    )
    res.end(html);
}

const server = http.createServer((req, res) => {
    let path = resolveUrl(req.url);
    return resolvePath(req, res, path);
})

server.listen(3000, 'localhost', () => {
    console.log('server running at 3000');
})
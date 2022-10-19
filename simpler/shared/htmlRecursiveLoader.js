const path = require("path");
const HTMLParser = require('node-html-parser');
const sass = require("sass")
const markdown = require("marked")


function getFileData(fileName) {
  const filePath = path.resolve(this.context, fileName)
  this.addDependency(filePath)

  // preprocess file data into html-compatible format
  if(fileName.match(/\.s[ac]ss$/i)) {
    const sassResult = sass.compile(filePath)
    // console.log({sassResult})

    sassResult.loadedUrls.map(this.addDependency)
    return sassResult.css
  }
  if(fileName.match(/\.md$/i)) {
    const markdownResult = markdown.marked(this.fs.readFileSync(filePath, 'utf8'))
    // console.log({markdownResult})

    return markdownResult
  }
  // default pass through
  return this.fs.readFileSync(filePath, 'utf8')
}

module.exports = async function loader(content, dir = null) {
  const callback = this.async()
  const dom = HTMLParser.parse(content)

  let element = dom.querySelector('import')
  while(element) {
    // console.log("---- element ----")
    // console.log(element.toString())

    // use src attribute for content
    if(!element.hasAttribute('src')) return;
    const src = element.getAttribute('src')
    const fileData = HTMLParser.parse(getFileData.call(this, src))

    if (element.hasAttribute('tag')) {
      // transform into new tag with remaining attributes
      const tag = element.getAttribute('tag')
      const newElement = new HTMLParser.HTMLElement(tag, element.attributes);
      newElement.removeAttribute('tag')
      newElement.removeAttribute('src')
      newElement.set_content(fileData)
      element.parentNode.exchangeChild(element, newElement)

      // console.log("---- newElement ----")
      // console.log(newElement.toString())

    } else {
      const newElement = HTMLParser.parse(fileData)
      element.parentNode.exchangeChild(element, newElement)

      // console.log("---- newElement ----")
      // console.log(newElement.toString())
    }

    // update loop
    element = dom.querySelector('import')
  }

  // console.log("---- dom ----")
  // console.log(dom.toString())

  callback(null, dom.toString(), null)
}

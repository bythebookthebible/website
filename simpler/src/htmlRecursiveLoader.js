const path = require("path");
const HTMLParser = require('node-html-parser');

module.exports = function loader(content, dir = null) {
  const dom = HTMLParser.parse(content)

  let element = dom.querySelector('import')
  while(element) {
    console.log("---- element ----")
    console.log(element.toString())

    // use src attribute for content
    if(!element.hasAttribute('src')) return;
    const src = element.getAttribute('src')
    const filePath = path.resolve(this.context, src)

    if (element.hasAttribute('tag')) {
      // transform into new tag with remaining attributes
      const tag = element.getAttribute('tag')
      const newElement = new HTMLParser.HTMLElement(tag, element.attributes);
      newElement.removeAttribute('tag')
      newElement.removeAttribute('src')
      newElement.innerHTML = this.fs.readFileSync(filePath, 'utf8')
      element.parentNode.exchangeChild(element, newElement)

      console.log("---- newElement ----")
      console.log(newElement.toString())

    } else {
      const newElement = HTMLParser.parse(this.fs.readFileSync(filePath, 'utf8'))
      element.parentNode.exchangeChild(element, newElement)

      console.log("---- newElement ----")
      console.log(newElement.toString())
    }

    // update loop
    element = dom.querySelector('import')
  }

  console.log("---- dom ----")
  console.log(dom.toString())

  return dom.toString()
}

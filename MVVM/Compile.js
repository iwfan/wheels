import Watcher from './Watcher'

// 将DOM节点缓存入文档片段中
function nodeToFragment(node) {
    const fragment = document.createDocumentFragment()
    let child = node.firstChild
    while (child) {
        fragment.appendChild(child)
        child = node.firstChild
    }
    return fragment
}

function compileElement(root, data, context) {
    const nodes = root.childNodes
    for (const node of Array.from(nodes)) {
        if (node.nodeType === Node.TEXT_NODE && /\{\{(.*?)\}\}/g.test(node.nodeValue)) {
            const attrVal = RegExp.$1
            const args = attrVal.split('.')
            let _data = data
            while (args.length) {
                _data = _data[args.shift()]
            }
            node.nodeValue = _data
            Watcher.create(context, node, attrVal, 'nodeValue')
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            // 处理普通的元素节点
            if (node.hasAttribute('v-click')) {
                const method = node.getAttribute('v-click')
                node.addEventListener('click', context._method[method].bind(context))
                node.removeAttribute('v-click')
            }
            if (node.hasAttribute('v-bind')) {
                const attrVal = node.getAttribute('v-bind')
                const args = attrVal.split('.')
                let _data = data
                while (args.length) {
                    _data = _data[args.shift()]
                }
                node.dataset.id = _data
                Watcher.create(context, node, attrVal, 'dataset.id')
                node.removeAttribute('v-bind')
            }
            if (node.hasAttribute('v-model')
                && (node.tagName.toUpperCase() === 'INPUT' || node.tagName.toUpperCase() === 'TEXTAREA')) {
                const attrVal = node.getAttribute('v-model')
                node.value = data[attrVal]
                Watcher.create(context, node, attrVal, 'value')
                node.addEventListener('input', () => { context._data[attrVal] = node.value })
                node.removeAttribute('v-model')
            }
            if (node.hasAttribute('v-for')) {
                const attrVal = node.getAttribute('v-for')
                const reg = /([\$\w]+)\s+of\s+([\$\w]+)/
                if (reg.test(attrVal)) {
                    const alias = RegExp.$1
                    const exp = RegExp.$2
                    const pNode = node.parentNode
                    const callback = () => {
                        while (pNode.firstChild) {
                            pNode.removeChild(pNode.firstChild)
                        }
                        if (data[exp] && data[exp].length) {
                            let index = 0
                            for (const itor of data[exp]) {
                                const cloneNode = node.cloneNode(true)
                                cloneNode.removeAttribute('v-for')
                                compile(cloneNode, { [alias]: itor, index }, context)
                                pNode.appendChild(cloneNode)
                                index += 1
                            }
                        }
                    }
                    callback()
                    Watcher.create(context, node, exp, callback)
                }
            } else if (node.hasChildNodes()) {
                compile(node, data, context)
            }
        }
    }
}

export default function compile(root, data, context) {
    if (!root || !(root instanceof Node)) {
        throw new Error('xx')
    }
    // const fragment = nodeToFragment(root)
    compileElement(root, data, context)
    // root.appendChild(fragment)
}
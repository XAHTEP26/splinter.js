class Splinter {
  constructor(el, props = {}) {
    if (!el || !(el instanceof Element || typeof el === 'string')) {
      console.error('The first argument must be an Element or a string.');
      return;
    }
    this._el = typeof el === 'string' ? document.querySelector(el) : el;
    this._elements = [];
    this._words = [];
    this._chars = [];
    const defaults = {
      mode: 'words', // (words|chars)
      ignore: undefined
    };
    this._props = {...defaults, ...props};
    this._init();
  }

  static get NODE_NAME() {
    return 'span';
  }

  get elements() {
    return this._elements;
  }

  get words() {
    return this._words;
  }

  get chars() {
    return this._chars;
  }

  _init() {

    const treeWalker = document.createTreeWalker(
      this._el,
      NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT,
      this._createNodeFilter(this._props.ignore),
      false
    );

    // Когда перебор DOM-дерева закончится свойство "currentNode" всеравно
    // будет хранить последнюю найденную ноду, поэтому узнать что обход
    // завершен можно только получив null от метода "nextNode".
    let walkIsOver = treeWalker.nextNode() === null;

    // При каждом запуске метода "nextNode" TreeWalker переходит на ноду,
    // следующую за той, что хранится в свойстве "currentNode", поэтому
    // прежде чем что-то делать с найденной нодой, надо сначала сдвинуть
    // TreeWalker дальше, иначе он может сработать некорректно.
    let tempNode = treeWalker.currentNode;
    while (!walkIsOver) {
      walkIsOver = treeWalker.nextNode() === null;
      this._transformNode(tempNode);
      tempNode = treeWalker.currentNode;
    }
  }

  _createNodeFilter(ignore) {
    let nodeFilter = {
      acceptNode: node => NodeFilter.FILTER_ACCEPT
    };
    if (typeof ignore === 'function') {
      nodeFilter.acceptNode = node => {
        if (node.nodeType === Node.TEXT_NODE) return NodeFilter.FILTER_ACCEPT;
        return ignore(node) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
      };
    }
    if (typeof ignore === 'string') {
      nodeFilter.acceptNode = node => {
        if (node.nodeType === Node.TEXT_NODE) return NodeFilter.FILTER_ACCEPT;
        return node.matches(ignore) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
      };
    }
    return nodeFilter;
  }

  _transformNode(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      this._transformTextNode(node)
    } else {
      this._transformElementNode(node);
    }
  }

  _transformElementNode(node) {
    this._elements.push(node);
  }

  static _splitText(text) {
    const regexp = /\s+/g;
    let space;
    let chunks = [];
    let lastEndIndex = 0;

    while (space = regexp.exec(text)) {
      // Если индекс пробелов изменился...
      if (lastEndIndex < space.index) {
        // Добавляем слово между пробелами
        chunks.push({
          type: 'word',
          text: text.substring(lastEndIndex, space.index)
        });
      }

      // Добавляем текстовую ноду с пробелами
      chunks.push({
        type: 'space',
        text: space[0]
      });

      // Запоминаем индекс конца подстроки пробелов
      lastEndIndex = space.index + space[0].length;
    }

    // Если строка не заканчивается пробелами, то добавляем последнее слово вручную
    if (lastEndIndex < text.length) {
      chunks.push({
        type: 'word',
        text: text.substring(lastEndIndex)
      });
    }

    return chunks;
  }

  _transformTextNode(node) {
    let chunks = Splinter._splitText(node.textContent);

    // Если текста нет, то ничего не делаем
    if (!chunks.length) return;

    // Если в тексте только пробелы, то ничего не делаем
    if (chunks.length === 1 && chunks[0].type === 'space') return;

    const fragment = document.createDocumentFragment();
    let chunk;
    while (chunk = chunks.shift()) {
      fragment.appendChild(chunk.type === 'word' ? this._buildWordNode(chunk.text) : document.createTextNode(chunk.text));
    }

    // Заменяем текстовую ноду
    node.parentNode.replaceChild(fragment, node);
  }

  static _buildNode(nodeName, content) {
    let node = document.createElement(nodeName);
    node.textContent = content;
    node.style.display = 'inline-block';
    return node;
  }

  _buildCharNode(char) {
    const node = Splinter._buildNode(Splinter.NODE_NAME, char);
    this._chars.push(node);
    return node;
  }

  _buildWordNode(word) {
    const node = Splinter._buildNode(Splinter.NODE_NAME)

    if (this._props.mode === 'words') {
      node.textContent = word;
      this._words.push(node);
      return node;
    }

    // Если в слове всего 1 символ то не создаем внутри него дополнительных нод,
    // а просто добавляем его в массивы chars и words
    if (word.length === 1) {
      node.textContent = word;
      this._words.push(node);
      this._chars.push(node);
      return node;
    }

    word.split('').forEach(char => node.appendChild(this._buildCharNode(char)));
    this._words.push(node);
    return node;
  }
}

export default Splinter;

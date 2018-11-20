(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.splinter = factory());
}(this, (function () { 'use strict';

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  }

  function _objectSpread(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i] != null ? arguments[i] : {};
      var ownKeys = Object.keys(source);

      if (typeof Object.getOwnPropertySymbols === 'function') {
        ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) {
          return Object.getOwnPropertyDescriptor(source, sym).enumerable;
        }));
      }

      ownKeys.forEach(function (key) {
        _defineProperty(target, key, source[key]);
      });
    }

    return target;
  }

  var Splinter =
  /*#__PURE__*/
  function () {
    function Splinter(el) {
      var props = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      _classCallCheck(this, Splinter);

      if (!el || !(el instanceof Element || typeof el === 'string')) {
        console.error('The first argument must be an Element or a string.');
        return;
      }

      this._el = typeof el === 'string' ? document.querySelector(el) : el;
      this._elements = [];
      this._words = [];
      this._chars = [];
      var defaults = {
        mode: 'words',
        // (words|chars)
        ignore: undefined
      };
      this._props = _objectSpread({}, defaults, props);

      this._init();
    }

    _createClass(Splinter, [{
      key: "_init",
      value: function _init() {
        var treeWalker = document.createTreeWalker(this._el, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, this._createNodeFilter(this._props.ignore), false); // Когда перебор DOM-дерева закончится свойство "currentNode" всеравно
        // будет хранить последнюю найденную ноду, поэтому узнать что обход
        // завершен можно только получив null от метода "nextNode".

        var walkIsOver = treeWalker.nextNode() === null; // При каждом запуске метода "nextNode" TreeWalker переходит на ноду,
        // следующую за той, что хранится в свойстве "currentNode", поэтому
        // прежде чем что-то делать с найденной нодой, надо сначала сдвинуть
        // TreeWalker дальше, иначе он может сработать некорректно.

        var tempNode = treeWalker.currentNode;

        while (!walkIsOver) {
          walkIsOver = treeWalker.nextNode() === null;

          this._transformNode(tempNode);

          tempNode = treeWalker.currentNode;
        }
      }
    }, {
      key: "_createNodeFilter",
      value: function _createNodeFilter(ignore) {
        var nodeFilter = {
          acceptNode: function acceptNode(node) {
            return NodeFilter.FILTER_ACCEPT;
          }
        };

        if (typeof ignore === 'function') {
          nodeFilter.acceptNode = function (node) {
            if (node.nodeType === Node.TEXT_NODE) return NodeFilter.FILTER_ACCEPT;
            return ignore(node) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
          };
        }

        if (typeof ignore === 'string') {
          nodeFilter.acceptNode = function (node) {
            if (node.nodeType === Node.TEXT_NODE) return NodeFilter.FILTER_ACCEPT;
            return node.matches(ignore) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
          };
        }

        return nodeFilter;
      }
    }, {
      key: "_transformNode",
      value: function _transformNode(node) {
        if (node.nodeType === Node.TEXT_NODE) {
          this._transformTextNode(node);
        } else {
          this._transformElementNode(node);
        }
      }
    }, {
      key: "_transformElementNode",
      value: function _transformElementNode(node) {
        this._elements.push(node);
      }
    }, {
      key: "_transformTextNode",
      value: function _transformTextNode(node) {
        var chunks = Splinter._splitText(node.textContent); // Если текста нет, то ничего не делаем


        if (!chunks.length) return; // Если в тексте только пробелы, то ничего не делаем

        if (chunks.length === 1 && chunks[0].type === 'space') return;
        var fragment = document.createDocumentFragment();
        var chunk;

        while (chunk = chunks.shift()) {
          fragment.appendChild(chunk.type === 'word' ? this._buildWordNode(chunk.text) : document.createTextNode(chunk.text));
        } // Заменяем текстовую ноду


        node.parentNode.replaceChild(fragment, node);
      }
    }, {
      key: "_buildCharNode",
      value: function _buildCharNode(char) {
        var node = Splinter._buildNode(Splinter.NODE_NAME, char);

        this._chars.push(node);

        return node;
      }
    }, {
      key: "_buildWordNode",
      value: function _buildWordNode(word) {
        var _this = this;

        var node = Splinter._buildNode(Splinter.NODE_NAME);

        if (this._props.mode === 'words') {
          node.textContent = word;

          this._words.push(node);

          return node;
        } // Если в слове всего 1 символ то не создаем внутри него дополнительных нод,
        // а просто добавляем его в массивы chars и words


        if (word.length === 1) {
          node.textContent = word;

          this._words.push(node);

          this._chars.push(node);

          return node;
        }

        word.split('').forEach(function (char) {
          return node.appendChild(_this._buildCharNode(char));
        });

        this._words.push(node);

        return node;
      }
    }, {
      key: "elements",
      get: function get() {
        return this._elements;
      }
    }, {
      key: "words",
      get: function get() {
        return this._words;
      }
    }, {
      key: "chars",
      get: function get() {
        return this._chars;
      }
    }], [{
      key: "_splitText",
      value: function _splitText(text) {
        var regexp = /\s+/g;
        var space;
        var chunks = [];
        var lastEndIndex = 0;

        while (space = regexp.exec(text)) {
          // Если индекс пробелов изменился...
          if (lastEndIndex < space.index) {
            // Добавляем слово между пробелами
            chunks.push({
              type: 'word',
              text: text.substring(lastEndIndex, space.index)
            });
          } // Добавляем текстовую ноду с пробелами


          chunks.push({
            type: 'space',
            text: space[0]
          }); // Запоминаем индекс конца подстроки пробелов

          lastEndIndex = space.index + space[0].length;
        } // Если строка не заканчивается пробелами, то добавляем последнее слово вручную


        if (lastEndIndex < text.length) {
          chunks.push({
            type: 'word',
            text: text.substring(lastEndIndex)
          });
        }

        return chunks;
      }
    }, {
      key: "_buildNode",
      value: function _buildNode(nodeName, content) {
        var node = document.createElement(nodeName);
        node.textContent = content;
        node.style.display = 'inline-block';
        return node;
      }
    }, {
      key: "NODE_NAME",
      get: function get() {
        return 'span';
      }
    }]);

    return Splinter;
  }();

  return Splinter;

})));

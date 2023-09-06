function mapColor(color) {
    const colorMap = {
      //"rgb(212, 212, 212)": "light-gray",
      "rgb(219, 76, 105)": "orange",
      "rgb(86, 156, 214)": "blue",
      "rgb(156, 220, 254)": "skyblue",
      "rgb(106, 153, 85)": "green",
      "rgb(181, 206, 168)": "mint",
      "rgb(206, 145, 120)": "orange",
      "rgb(197, 134, 192)": "pink",
      "rgb(220, 220, 170)": "lemon",
      "rgb(209, 105, 105)": "orange",
      "rgb(78, 201, 176)": "mint",
      "rgb(215, 186, 125)": "orange",
      "rgb(128, 128, 128)": "gray"
    };
    
    if (color in colorMap) {
      return {
        first: "<" + colorMap[color] + ">",
        second: "</" + colorMap[color] + ">"
      }
    }
    return {
      first: "",
      second: ""
    }
}

function checkPosition(position, diff) {
    let index = 0;
    for (item of diff) {
      if (position == item[1]) {
        return index;
      }
      if (position == item[0]) {
        return -1;
      }
      if (position >= item[0] && position <= item[1]) {
        return -2;
      }
      index++;
    }
    return -3;
}

function loopNodes(nodes, color, sanitizedText, diff, position) {
    let result = "";

    if (nodes.length == 0) {
      return {
        result: result,
        position: position
      };
    }

    for (const node of nodes) {
      if (node.nodeType == 3) {
        const {first, second} = color;
        let text = node.nodeValue;
        let selection = "";
        const deleteList = [];

        if (sanitizedText == "" || sanitizedText === undefined) {
          sanitizedText = text;
        }

        for (let i = 0; i < text.length; i++) {
          const status = checkPosition(position, diff);
          if (status > -3) {
            deleteList.push(i);
          }
          if (status >= 0) {
            selection = "<blank id='" + (status + 1).toString() + "'size='5'></blank>";
          }
          position++;
        }

        let i = text.length - 1;
        let j = sanitizedText.length - 1;
        let originalText = "";
        while (i >= 0 && j >= 0) {
          if (text[i] == sanitizedText[j]) {
            if (deleteList.includes(i)) {
              sanitizedText = sanitizedText.slice(0, j) + sanitizedText.slice(j + 1);
            }
          }
          else {
            while (j >= 0 && sanitizedText[j] != '&') {
              if (deleteList.includes(i)) {
                sanitizedText = sanitizedText.slice(0, j) + sanitizedText.slice(j + 1);
              }
              j--;
            }

            if (sanitizedText[j] == '&') {
              if (deleteList.includes(i)) {
                sanitizedText = sanitizedText.slice(0, j) + sanitizedText.slice(j + 1);
              }
            }
          }
          if (deleteList.includes(i)) {
            originalText = "□" + originalText;
            text = text.slice(0, i) + text.slice(i + 1);
          }
          else {
            originalText = text[i] + originalText;
          }
          i--;
          j--;
        }

        node.nodeValue = originalText;

        if (text.length > 0) {
          result += (selection + first + sanitizedText + second);
        }
        else {
          if (selection.length > 0) {
            result += selection;
          }
        }
        sanitizedText = "";
      }
      else {
        let nSanitizedText = "";
        if (node.childNodes.length == 1 && node.firstChild.nodeType == 3 && node.firstChild.nodeValue !== node.innerHTML) {
          nSanitizedText = node.innerHTML;
        }

        let results = loopNodes(node.childNodes, mapColor(window.getComputedStyle(node).color), nSanitizedText, diff, position);
        result += results.result;
        position = results.position
      }
    }

    return {
      result: result,
      position: position
    }
}

function replaceLeadingSpaces(code) {
    const lines = code.split("\n");
    let nLines = [];
    for (line of lines) {
      let spaceCount = 0;
      for (let i = 0; i < line.length; i++) {
        if (line.charAt(i) == " ") {
          spaceCount++;
        }
        else {
          break;
        }
      }
      const embp = Math.floor(spaceCount / 2);
      const space = spaceCount % 2;
      nLine = "&emsp;".repeat(embp) + " ".repeat(space) + line.slice(spaceCount, line.length);
      nLines.push(nLine);
    }
    return nLines.join("\n")
}

function getLanguge() {
    var selected_language = document.querySelector('input[name="btnradio"]:checked').value;

    let languagePrism = null;
    let languageString = "";
    switch (selected_language) {
      case "python":
        languagePrism = Prism.languages.python;
        languageString = "python";
        break;
      case "html":
        languagePrism = Prism.languages.html;
        languageString = "html";
        break;
      case "javascript":
        languagePrism = Prism.languages.javascript;
        languageString = "javascript";
        break;
      case "css":
        languagePrism = Prism.languages.css;
        languageString = "css";
        break;
      case "c":
        languagePrism = Prism.languages.c;
        languageString = "c";
        break;
      case "git":
        languagePrism = Prism.languages.git;
        languageString = "git";
        break;
      case "bash":
        languagePrism = Prism.languages.bash;
        languageString = "bash";
        break;
      case "sql":
        languagePrism = Prism.languages.sql;
        languageString = "sql";
        break;
      case "typescript":
        languagePrism = Prism.languages.typescript;
        languageString = "typescript";
        break;
      case "react jsx":
        languagePrism = Prism.languages.jsx;
        languageString = "jsx";
        break;
      case "react tsx":
        languagePrism = Prism.languages.tsx;
        languageString = "tsx";
        break;
      default:
        languagePrism = Prism.languages.python;
        languageString = "python";
        break;
    }

    return {
      languagePrism: languagePrism,
      languageString: languageString
    }
}

function calculateDiff(inputCode, inputCodeOptions) {
    let diff = [];
    for (let i = 0; i < inputCode.length && i < inputCodeOptions.length; i++) {
      if (inputCode.charAt(i) !== inputCodeOptions.charAt(i)) {
        var diffElement = [i, 0];
        while (i < inputCode.length && i < inputCodeOptions.length && inputCode.charAt(i) !== inputCodeOptions.charAt(i)) {
          i++;
        }
        i--;
        diffElement[1] = i;
        diff.push(diffElement);
      }
    }
    return diff;
}

function replaceText() {
  const replaceText = document.getElementById("replaceText").value;
  document.getElementById("replaceText").value = "¿".repeat(replaceText.length);
}

function formatCode() {
    const inputCode = document.getElementById("inputCode").value;
    let inputCodeOptions = document.getElementById("inputCodeOptions").value;
    if (inputCodeOptions == "") {
      inputCodeOptions = inputCode
    }
    const diff = calculateDiff(inputCode, inputCodeOptions);
    var selected_language = document.querySelector('input[name="btnradio"]:checked').value;

    const {languagePrism, languageString} = getLanguge()
    const formattedCode = Prism.highlight(inputCode, languagePrism, languageString);

    var myDiv = document.getElementById("sample");
    myDiv.innerHTML = formattedCode
    let {result, position} = loopNodes(myDiv.childNodes, mapColor(""), "", diff, 0);
    result = replaceLeadingSpaces(result);
    document.getElementById("outputCode").value = result;
}

function copyCode() {
  var myDiv = document.getElementById("sample");
  const formattedCode = myDiv.innerHTML;
  console.log(window.getComputedStyle(myDiv));

  const parser = new DOMParser();
  const doc = parser.parseFromString(formattedCode, "text/html");
  let {first, position} = loopNodes(myDiv.childNodes, mapColor(""), "", diff, 0);
  result = replaceLeadingSpaces(first);
  console.log(result)
  navigator.clipboard.writeText(result)
}

async function pasteInputCode(input) {
  const text = await navigator.clipboard.readText();
  document.getElementById("inputCode").value = text;
  formatCode();
}

async function pasteInputCodeOptions(input) {
  const text = await navigator.clipboard.readText();
  document.getElementById("inputCodeOptions").value = text;
  formatCode();
}
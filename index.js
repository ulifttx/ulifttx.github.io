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

function loopNodes(nodes, color, sanitizedText) {
    result = ""
    if (nodes.length == 0) {
      return result
    }
    for (const node of nodes) {
      if (node.nodeType == 3) {
        const {first, second} = color
        if (sanitizedText == "" || sanitizedText === undefined) {
          result += (first + node.nodeValue + second)
        }
        else {
          result += (first + sanitizedText + second)
        }
      }
      else {
        let nSanitizedText = "";
        if (node.childNodes.length == 1 && node.firstChild.nodeType == 3 && node.firstChild.nodeValue !== node.innerHTML) {
          nSanitizedText = node.innerHTML
        }
        result += loopNodes(node.childNodes, mapColor(window.getComputedStyle(node).color), nSanitizedText)
      }
    }
    return result
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

function formatCode() {
    const inputCode = document.getElementById("inputCode").value;
    var selected_language = document.querySelector('input[name="btnradio"]:checked').value;

    const {languagePrism, languageString} = getLanguge()
    const formattedCode = Prism.highlight(inputCode, languagePrism, languageString);

    var myDiv = document.getElementById("sample");
    myDiv.innerHTML = formattedCode
    result = loopNodes(myDiv.childNodes, mapColor(""));
    result = replaceLeadingSpaces(result);
    document.getElementById("outputCode").value = result;
}

function copyCode() {
  var myDiv = document.getElementById("sample");
  const formattedCode = myDiv.innerHTML;
  const {languagePrism, languageString} = getLanguge()
  console.log(window.getComputedStyle(myDiv))

  const parser = new DOMParser();
  const doc = parser.parseFromString(formattedCode, "text/html");
  result = loopNodes(myDiv.childNodes, mapColor(""));
  result = replaceLeadingSpaces(result);
  console.log(result)
  navigator.clipboard.writeText(result)
}

async function pasteCode(input) {
  const text = await navigator.clipboard.readText();
  document.getElementById("inputCode").value = text;
  formatCode();
}
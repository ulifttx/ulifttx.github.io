$("#languageList li a").click(function(){
  $('#languageSelect').text($(this).text())
  $('#languageSelect').val($(this).text())
});

$('#languageList li a').click(function(){
  formatCode();
});

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
        prepend: "<" + colorMap[color] + ">",
        append: "</" + colorMap[color] + ">"
      };
    }
    return {
      prepend: "",
      append: ""
    };
}


function checkPosition(position, diff) {
    let index = 0;
    for (item of diff) {
      if (position == item[0]) {
        const emptyIndex = document.getElementById("emptyIndex").value;
        const emptyIndexNum = parseInt(emptyIndex);
        return index + emptyIndexNum;
      }
      if (position == item[1]) {
        return 0;
      }
      if (position >= item[0] && position <= item[1]) {
        return -1;
      }
      index++;
    }
    return -2;
}

function removeStringIndex(text, index) {
  return text.slice(0, index) + text.slice(index + 1);
}

function replaceStringIndex(color, selections, text, index) {
  const {prepend, append} = color;
  if (text.length > 1) {
    return text.slice(0, index) + append + selections[index] + prepend + text.slice(index + 1);
  }
  else {
    return selections[index];
  }
}

function replaceOrRemoveIfExists(color, deleteSet, selections, text, index) {
  if (index in selections) {
    return replaceStringIndex(color, selections, text, index);
  }
  if (deleteSet.has(index)) {
    return removeStringIndex(text, index);
  }
  return text;
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
        const {prepend, append} = color;
        let text = node.nodeValue;
        let deleteSet = new Set();
        let selections = {};
        let hasSelection = false;
        let originalText = "";

        if (sanitizedText === undefined || sanitizedText == "")  {
          sanitizedText = text;
        }

        for (let i = 0; i < text.length; i++) {
          const status = checkPosition(position, diff);
          if (status > -2) {
            deleteSet.add(i);
          }
          if (status > 0) {
            selection = "<blank id='" + status.toString() + "'size='5'></blank>";
            selections[i] = selection;
            hasSelection = true;
          }
          position++;
        }

        for (let i = text.length - 1, j = sanitizedText.length - 1; i >= 0 && j >= 0; i--, j--) {
          if (text[i] == sanitizedText[j]) {
            sanitizedText = replaceOrRemoveIfExists(color, deleteSet, selections, sanitizedText, j);
          }
          else {
            for (; j > -2 && sanitizedText[j + 1] != '&'; j--) {
              sanitizedText = replaceOrRemoveIfExists(color, deleteSet, selections, sanitizedText, j);
            }
            j++;
          }

          if (deleteSet.has(i)) {
            originalText = '□' + originalText;
            text = text.slice(0, i) + text.slice(i + 1);
          }
          else {
            originalText = text[i] + originalText;
          }
        }

        if (text.length > 0) {
          result += (prepend + sanitizedText + append);
        }
        else {
          if (hasSelection) {
            result += sanitizedText;
          }
        }

        node.nodeValue = originalText;
        sanitizedText = "";
      }
      else {
        let nSanitizedText = "";
        if (node.childNodes.length == 1 && node.firstChild.nodeType == 3 && node.firstChild.nodeValue !== node.innerHTML) {
          nSanitizedText = node.innerHTML;
        }

        console.log(node);
        console.log(window.getComputedStyle(node).getPropertyValue("--hygraph"));
        let results = loopNodes(node.childNodes, mapColor(window.getComputedStyle(node).color), nSanitizedText, diff, position);
        result += results.result;
        position = results.position;
      }
    }

    return {
      result: result,
      position: position
    };
}

function replaceLeadingTabs(code) {
  const lines = code.split("\n");
  let nLines = [];
  for (line of lines) {
    let tabCount = 0;
    for (let i = 0; i < line.length; i++) {
      if (line.charAt(i) == "\t") {
        tabCount++;
      }
      else {
        break;
      }
    }
    const spaces = tabCount * 4;
    nLine = " ".repeat(spaces) + line.slice(tabCount, line.length);
    nLines.push(nLine);
  }
  return nLines.join('\n');
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
    return nLines.join('\n');
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

function getLanguge() {
  let selected_language = $('#languageSelect').text();

  const languageMap = {
    "Python": {languagePrism: Prism.languages.python, languageString: "python"},
    "HTML": {languagePrism: Prism.languages.html, languageString: "html"},
    "JavaScript": {languagePrism: Prism.languages.javascript, languageString: "javascript"},
    "CSS": {languagePrism: Prism.languages.css, languageString: "css"},
    "C": {languagePrism: Prism.languages.c, languageString: "c"},
    "Git": {languagePrism: Prism.languages.git, languageString: "git"},
    "Bash": {languagePrism: Prism.languages.bash, languageString: "bash"},
    "SQL": {languagePrism: Prism.languages.sql, languageString: "sql"},
    "TypeScript": {languagePrism: Prism.languages.typescript, languageString: "typescript"},
    "React JSX": {languagePrism: Prism.languages.jsx, languageString: "jsx"},
    "React TSX": {languagePrism: Prism.languages.tsx, languageString: "tsx"}
  };

  if (selected_language in languageMap) {
    return languageMap[selected_language];
  }

  return languageMap["Python"];
}

function formatCode() {
    let inputCode = document.getElementById("inputCode").value;
    inputCode = replaceLeadingTabs(inputCode);
    let inputCodeOptions = document.getElementById("inputCodeOptions").value;
    inputCodeOptions = replaceLeadingTabs(inputCodeOptions);
    if (inputCodeOptions == "") {
      inputCodeOptions = inputCode;
    }

    const diff = calculateDiff(inputCode, inputCodeOptions);
    const {languagePrism, languageString} = getLanguge();
    const formattedCode = Prism.highlight(inputCode, languagePrism, languageString);

    let myDiv = document.getElementById("sample");
    myDiv.innerHTML = formattedCode;
    let {result, position} = loopNodes(myDiv.childNodes, mapColor(""), "", diff, 0);
    result = replaceLeadingSpaces(result);
    document.getElementById("outputCode").value = result;
}

function changeEmptyIndex() {
  const emptyIndex = document.getElementById("emptyIndex").value;
  const isnum = /^\d+$/.test(emptyIndex);
  if (isnum && emptyIndex !== "0") {
    formatCode();
  }
  else {
    document.getElementById("emptyIndex").value = "1";
  }
}

function replaceText() {
  const replaceText = document.getElementById("replaceText").value;
  document.getElementById("replaceText").value = "□".repeat(replaceText.length);
}

function copyCode() {
  let result = document.getElementById("outputCode").value;
  navigator.clipboard.writeText(result);
}

async function pasteInputCode() {
  const text = await navigator.clipboard.readText();
  document.getElementById("inputCode").value = text;
  formatCode();
}

async function pasteInputCodeOptions() {
  const text = await navigator.clipboard.readText();
  document.getElementById("inputCodeOptions").value = text;
  formatCode();
}
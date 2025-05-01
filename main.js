const numbers = document.querySelectorAll(".btn-number");
const operators = document.querySelectorAll(".btn-operator");
const display = document.querySelector(".display");
const removeBtn = document.querySelector(".btn-remove");

const percentage = document.getElementById("percentage");

let operation = [];
let result = 0;

numbers.forEach((number) => {
  number.addEventListener("click", (e) => {
    const last = operation[operation.length - 1];
    let element = e.target.innerText;
    if (isNaN(Number(element)) && element !== ".") return;

    if (operation.length > 0) {
      if (!isNaN(last) && element !== ".") {
        let newElement = `${operation[operation.length - 1]}${element}`;
        operation[operation.length - 1] = Number(newElement);
      } else if (
        typeof last == "string" &&
        last[-1] === "." &&
        isNaN(Number(element))
      ) {
        let newElement = `${operation[operation.length - 1]}${Number(element)}`;
        operation[operation.length - 1] = Number(newElement);
      } else if (
        !isNaN(last) &&
        element == "." &&
        !String(last).includes(".")
      ) {
        let newElement = `${operation[operation.length - 1]}${element}`;
        operation[operation.length - 1] = newElement;
      } else if (!String(last).includes(".") || isOperator(last)) {
        operation.push(element === "." ? "0." : Number(element));
      }
    } else {
      operation.push(element === "." ? "0." : Number(element));
    }

    displayOperation();
  });
});

operators.forEach((operator) => {
  operator.addEventListener("click", (e) => {
    const last = operation[operation.length - 1];
    let oper = e.target.innerText;
    if (oper != "(" && oper != ")" && oper != "%") {
      if (!display.innerText) return;
      if (isOperator(last) || last == ")") {
        operation[operation.length - 1] = oper;
        displayOperation();
        return;
      }
    }

    operation.push(oper);

    displayOperation();
  });
});

removeBtn.addEventListener("click", () => {
  const last = operation[operation.length - 1];
  if (typeof last == "number" && Math.abs(last) >= 10) {
    let str = String(last);
    let newStr = str.slice(0, -1);
    operation[operation.length - 1] = Number(newStr);
  } else {
    operation.pop();
  }

  displayOperation();
});

function displayOperation() {
  display.innerHTML = operation.join(" ");
}

function isOperator(ele) {
  return ele == "*" || ele == "/" || ele == "+" || ele == "-" || ele == "%";
}

function equalTo() {
  const last = operation[operation.length - 1];
  if (operation.length < 2 && typeof last == "number") operation.pop();
  let itr = 20;
  while (operation.includes("(") && itr-- > 0) {
    parethesisCal(operation, calculation);
  }
  calculation(operation);

  if (isOperator(last)) {
    display.innerHTML = operation[0];
  } else {
    displayOperation();
  }
}

function parethesisCal(array, callback) {
  if (!array.includes(")")) return;
  let index1 = array.indexOf("("),
    index2 = array.indexOf(")");
  let newOperation = array.slice(index1 + 1, index2);

  let endIndex = -1;
  let arrayLength = newOperation.length;
  if (newOperation.includes("(")) {
    for (let i = index2 + 1; i < array.length; i++) {
      if (array[i] == ")") {
        endIndex = i;
        break;
      }
    }

    if (endIndex > index2 + 1) {
      let additionalPart = array.slice(index2, endIndex);
      arrayLength += additionalPart.length;

      newOperation.push(...additionalPart);
    }
    parethesisCal(newOperation, callback);
  }

  callback(newOperation);

  const replacement = [newOperation[0]];
  const beforePar = index1 > 0 ? array[index1 - 1] : null;
  const afterPar =
    index1 + arrayLength + 2 < array.length
      ? array[index1 + arrayLength + 2]
      : null;
  if (typeof beforePar == "number") replacement.unshift("*");
  if (typeof afterPar == "number") replacement.push("*");
  array.splice(index1, arrayLength + 2, ...replacement);
}
const sigPrecision = (newArray, myIndex, newresult, isPercentage) => {
  let myResult = newresult;
  let sig1 = 0,
    sig2 = 0;
  if (newArray[myIndex - 1] % 1 != 0) {
    let str1 = String(newArray[myIndex - 1]);
    if (str1.includes(".")) sig1 = str1.length - 1 - str1.indexOf(".");
    if (isPercentage) sig1 += 2;
  }

  if (newArray[myIndex + 1] % 1 != 0 && !isPercentage) {
    let str2 = String(newArray[myIndex + 1]);
    if (str2.includes(".")) sig2 = str2.length - 1 - str2.indexOf(".");

    if (sig1 > 0 || sig2 > 0) {
      myResult =
        sig1 > sig2
          ? parseFloat(newresult).toFixed(sig1)
          : parseFloat(newresult).toFixed(sig2);
    }
  }

  return myResult;
};
function calculation(array) {
  const myLast = array[array.length - 1];
  let isPercentage = false;
  while (array.includes("*") && myLast != "*") {
    let index = array.indexOf("*");
    result = array[index - 1] * array[index + 1];

    result = sigPrecision(array, index, result, isPercentage);
    array.splice(index - 1, 3, result);
  }

  while (array.includes("÷") && myLast != "÷") {
    let index = array.indexOf("÷");
    result = array[index - 1] / array[index + 1];

    result = sigPrecision(array, index, result, isPercentage);
    array.splice(index - 1, 3, result);
  }

  while (array.includes("+") && myLast != "+") {
    let index = array.indexOf("+");
    result = array[index - 1] + array[index + 1];

    result = sigPrecision(array, index, result, isPercentage);
    array.splice(index - 1, 3, result);
  }

  while (array.includes("-") && myLast != "-") {
    let index = array.indexOf("-");
    result = array[index - 1] - array[index + 1];

    result = sigPrecision(array, index, result, isPercentage);
    array.splice(index - 1, 3, result);
  }

  if (array.includes("%")) {
    isPercentage = true;
    const index = array.indexOf("%");
    const isLast = index == array.length - 1;
    const left = array[index - 1];
    if (isLast && typeof left == "number") {
      let num = sigPrecision(array, index, left / 100, isPercentage);
      array.splice(index - 1, 2, num);
    } else {
      display.innerHTML = "Error";
    }
  }
}


const form = document.getElementById("purchaseForm");
const result = document.getElementById("result");
const resultTitle = document.getElementById("resultTitle");
const resultText = document.getElementById("resultText");
const resultStats = document.getElementById("resultStats");
const extraChecks = document.getElementById("extraChecks");
const resetButton = document.getElementById("resetButton");

const money = value =>
  new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 2
  }).format(value);

function getValue(id) {
  return document.getElementById(id).value.trim();
}

function makeStat(label, value) {
  const card = document.createElement("div");
  card.className = "stat";

  const heading = document.createElement("strong");
  heading.textContent = label;

  const content = document.createElement("p");
  content.textContent = value;
  content.style.marginBottom = "0";

  card.append(heading, content);
  return card;
}

function getProduct(letter, budget) {
  const name = getValue("name" + letter);
  const price = Number(getValue("price" + letter));
  const uses = Number(getValue("uses" + letter));
  const returns = getValue("return" + letter);

  return {
    name,
    price,
    uses,
    costPerUse: price / uses,
    withinBudget: price <= budget,
    returns
  };
}

function addCheck(title, message) {
  const item = document.createElement("p");
  item.style.padding = "12px";
  item.style.background = "#ffffff";
  item.style.borderRadius = "10px";
  item.style.margin = "10px 0";

  const strong = document.createElement("strong");
  strong.textContent = title + ": ";

  item.append(strong, document.createTextNode(message));
  extraChecks.appendChild(item);
}

form.addEventListener("submit", function(event) {
  event.preventDefault();

  const item = getValue("item");
  const budget = Number(getValue("budget"));
  const priority = getValue("priority");
  const payment = getValue("payment");
  const alreadyOwn = getValue("alreadyOwn");

  const a = getProduct("A", budget);
  const b = getProduct("B", budget);

  if (
    !item ||
    !Number.isFinite(budget) ||
    budget <= 0 ||
    !a.name ||
    !b.name ||
    !Number.isFinite(a.price) ||
    !Number.isFinite(b.price) ||
    a.price <= 0 ||
    b.price <= 0 ||
    !Number.isFinite(a.uses) ||
    !Number.isFinite(b.uses) ||
    a.uses <= 0 ||
    b.uses <= 0
  ) {
    result.hidden = false;
    result.style.display = "block";
    resultTitle.textContent = "Check your information";
    resultText.textContent =
      "Enter a budget greater than zero, positive product prices, and estimated uses greater than zero.";
    resultStats.replaceChildren();
    extraChecks.replaceChildren();
    result.scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }

  const cheaper = a.price <= b.price ? a : b;
  const betterValue = a.costPerUse <= b.costPerUse ? a : b;
  const bothOverBudget = !a.withinBudget && !b.withinBudget;
  const bothWithinBudget = a.withinBudget && b.withinBudget;
  const sameProduct = a.name.toLowerCase() === b.name.toLowerCase();

  let recommendation;
  let explanation;

  if (alreadyOwn === "yes") {
    recommendation = "WAIT BEFORE BUYING";
    explanation =
      "You already own something similar that still works. Consider whether replacing it is necessary before spending more money.";
  } else if (bothOverBudget) {
    recommendation = "WAIT — BOTH EXCEED YOUR BUDGET";
    explanation =
      "Neither option fits your stated budget. Consider saving, finding a less expensive alternative, or reassessing whether the purchase is necessary.";
  } else if (priority === "essential" && alreadyOwn !== "replace") {
    recommendation = "CHECK YOUR NEED FIRST";
    explanation =
      "You selected that this purchase is essential. Confirm what problem it solves and whether either option meets that need without exceeding your budget.";
  } else if (priority === "price") {
    const affordable = [a, b].filter(product => product.withinBudget);
    const choice = affordable.sort((x, y) => x.price - y.price)[0];

    if (!choice) {
      recommendation = "WAIT";
      explanation = "Neither option fits your budget.";
    } else {
      recommendation = "CONSIDER " + choice.name.toUpperCase();
      explanation =
        choice.name +
        " is the least expensive option within your budget. Check its quality, warranty, and return conditions before deciding.";
    }
  } else if (priority === "quality") {
    if (!bothWithinBudget) {
      const choice = a.withinBudget ? a : b;
      recommendation = "CONSIDER " + choice.name.toUpperCase();
      explanation =
        choice.name +
        " is the only option within your budget. Compare its durability and warranty before purchasing.";
    } else {
      recommendation = "COMPARE LONG-TERM VALUE";
      explanation =
        "Your priority is quality and durability, but the information entered does not independently verify product quality. Compare warranties, materials, and credible reviews before deciding.";
    }
  } else if (priority === "essential" && alreadyOwn === "replace") {
    const choice = a.withinBudget ? a : b;
    recommendation = "COMPARE REPLACEMENT OPTIONS";
    explanation =
      "You indicated that your existing product needs replacing. " +
      choice.name +
      " is within budget; verify that it meets your needs before buying.";
  } else if (bothWithinBudget) {
    recommendation = "COMPARE TOTAL VALUE";
    explanation =
      betterValue.name +
      " has the lower estimated cost per use (" +
      money(betterValue.costPerUse) +
      " per use). " +
      cheaper.name +
      " has the lower upfront price. The best choice depends on whether the use estimates are realistic and whether the products offer comparable quality.";
  } else {
    const choice = a.withinBudget ? a : b;
    recommendation = "CONSIDER " + choice.name.toUpperCase();
    explanation =
      choice.name +
      " is the only option within your stated budget. Confirm that it meets your needs and review its full cost before purchasing.";
  }

  if (sameProduct) {
    explanation +=
      " Both options have the same product name. Make sure you are comparing distinct offers or versions.";
  }

  if (payment === "installments") {
    explanation +=
      " You selected installments or financing. Check the total amount payable, interest, fees, and payment dates before committing.";
  } else if (payment === "credit") {
    explanation +=
      " You selected a credit card. Make sure you can pay the full statement balance to avoid interest.";
  }

  result.hidden = false;
  result.style.display = "block";
  resultTitle.textContent = recommendation;
  resultText.textContent = explanation;
  resultStats.replaceChildren();
  extraChecks.replaceChildren();

  resultStats.append(
    makeStat(a.name + " · cost per use", money(a.costPerUse)),
    makeStat(b.name + " · cost per use", money(b.costPerUse)),
    makeStat(a.name + " · budget", a.withinBudget ? "Within budget" : "Over budget"),
    makeStat(b.name + " · budget", b.withinBudget ? "Within budget" : "Over budget")
  );

  const warning = document.createElement("div");
  warning.className = "note";
  warning.textContent =
    "IMPORTANT: These prices may exclude shipping, taxes, or other charges. Add those costs before deciding. This tool does not verify sellers, product quality, warranties, or return policies.";
  extraChecks.appendChild(warning);

  addCheck(
    "Returns",
    "Option A: " + a.returns + ". Option B: " + b.returns +
    ". Verify the actual policy and deadlines with each seller."
  );

  addCheck(
    "Total cost",
    "Check shipping, additional fees, taxes, and the final amount payable for both options."
  );

  addCheck(
    "Warranty and seller",
    "Confirm the seller's identity, warranty coverage, and product specifications independently."
  );

  addCheck(
    "Your decision",
    "This is a recommendation based on your inputs, not a guarantee. Review the details and make the final decision yourself."
  );

  result.scrollIntoView({ behavior: "smooth", block: "start" });
});

resetButton.addEventListener("click", function() {
  result.hidden = true;
  result.style.display = "none";
  resultTitle.textContent = "";
  resultText.textContent = "";
  resultStats.replaceChildren();
  extraChecks.replaceChildren();
});


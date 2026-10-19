const $ = (id) => document.getElementById(id);

const money = (value) =>
  new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);

const form = $("purchaseForm");

if (form) {
  form.addEventListener("submit", function (event) {
    event.preventDefault();

    const item = $("item").value.trim();
    const priority = $("priority").value;
    const budget = Number($("budget").value);
    const nameA = $("nameA").value.trim();
    const nameB = $("nameB").value.trim();
    const priceA = Number($("priceA").value);
    const priceB = Number($("priceB").value);
    const usesA = Number($("usesA").value);
    const usesB = Number($("usesB").value);
    const payment = $("payment").value;
    const alreadyOwn = $("alreadyOwn").value;
    const returnA = $("returnA").value;
    const returnB = $("returnB").value;

    if (
      !item || !nameA || !nameB ||
      !Number.isFinite(budget) || budget < 0 ||
      !Number.isFinite(priceA) || priceA < 0 ||
      !Number.isFinite(priceB) || priceB < 0 ||
      !Number.isFinite(usesA) || usesA < 1 ||
      !Number.isFinite(usesB) || usesB < 1
    ) {
      alert("Please enter valid information in all required fields.");
      return;
    }

    const withinA = priceA <= budget;
    const withinB = priceB <= budget;
    const costA = priceA / usesA;
    const costB = priceB / usesB;

    let title = "WAIT — compare before buying";
    let explanation =
      "Review your needs, the total cost, and the return policy before deciding.";

    if (payment === "debt") {
      title = "WAIT — protect your essential expenses";
      explanation =
        "You indicated that buying could require borrowing or missing another payment. Protect essential expenses first.";
    } else if (alreadyOwn === "yes" && priority !== "essential") {
      title = "SKIP — consider using what you own";
      explanation =
        "You already have something similar. Unless it no longer meets your needs, buying another item may be unnecessary.";
    } else if (!withinA && !withinB) {
      title = "WAIT — both options exceed your budget";
      explanation =
        "Neither option fits the available budget you entered. Consider a lower-cost alternative or wait.";
    } else if (priority === "essential" && !withinA && !withinB) {
      title = "WAIT — find an affordable essential option";
      explanation =
        "Both options exceed your budget. Look for a suitable alternative that fits your available money.";
    } else if (payment === "installments") {
      title = "WAIT — check the full cost of installments";
      explanation =
        "Review interest, fees, total payments, and due dates before committing to a payment plan.";
    } else if (priority === "want") {
      title = "WAIT — give the decision 24 hours";
      explanation =
        "Because this is mainly a want, pause before buying. Revisit the decision tomorrow and check whether it still feels worthwhile.";
    } else {
      let preferred = null;

      if (withinA && !withinB) {
        preferred = "A";
      } else if (!withinA && withinB) {
        preferred = "B";
      } else if (costA < costB) {
        preferred = "A";
      } else if (costB < costA) {
        preferred = "B";
      }

      if (preferred === "A") {
        title = "CONSIDER — " + nameA;
        explanation = withinA
          ? nameA + " fits your budget and has the lower estimated cost per use."
          : nameA + " has the lower cost per use, but exceeds your budget.";
      } else if (preferred === "B") {
        title = "CONSIDER — " + nameB;
        explanation = withinB
          ? nameB + " fits your budget and has the lower estimated cost per use."
          : nameB + " has the lower cost per use, but exceeds your budget.";
      } else {
        title = "WAIT — compare quality and durability";
        explanation =
          "The estimated costs per use are equal. Compare quality, fit, durability, and how well each option meets your need.";
      }
    }

    const checks = [];

    if (returnA !== "yes") {
      checks.push("Check the return policy for " + nameA + ".");
    }

    if (returnB !== "yes") {
      checks.push("Check the return policy for " + nameB + ".");
    }

    if (alreadyOwn === "partial") {
      checks.push("Consider whether your current item can still meet the need.");
    }

    checks.push("Confirm that shipping, taxes, and fees are included.");

    $("resultTitle").textContent = title;
    $("resultText").textContent = "For " + item + ": " + explanation;

    $("resultStats").textContent =
      "Cost per use — " + nameA + ": " + money(costA) +
      "; " + nameB + ": " + money(costB) +
      ". Budget remaining — " + nameA + ": " + money(budget - priceA) +
      "; " + nameB + ": " + money(budget - priceB) + ".";

    $("extraChecks").textContent = checks.join(" ");

    $("result").classList.add("show");
    $("result").scrollIntoView({
      behavior: "smooth",
      block: "nearest"
    });
  });

  const resetButton = $("resetButton");

  if (resetButton) {
    resetButton.addEventListener("click", function () {
      $("result").classList.remove("show");
    });
  }
}

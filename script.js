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
    const budget = Number($("budget").value);
    const nameA = $("nameA").value.trim();
    const nameB = $("nameB").value.trim();
    const priceA = Number($("priceA").value);
    const priceB = Number($("priceB").value);
    const usesA = Number($("usesA").value);
    const usesB = Number($("usesB").value);

    if (
      !item ||
      !nameA ||
      !nameB ||
      !Number.isFinite(budget) ||
      !Number.isFinite(priceA) ||
      !Number.isFinite(priceB) ||
      !Number.isFinite(usesA) ||
      !Number.isFinite(usesB) ||
      budget < 0 ||
      priceA < 0 ||
      priceB < 0 ||
      usesA < 1 ||
      usesB < 1
    ) {
      alert("Please check all fields and enter valid amounts.");
      return;
    }

    const costPerUseA = priceA / usesA;
    const costPerUseB = priceB / usesB;

    const remainingA = budget - priceA;
    const remainingB = budget - priceB;

    $("resultTitle").textContent = "Comparison completed";
    $("resultText").textContent =
      "Your purchase: " + item +
      ". Option A: " + nameA +
      ". Option B: " + nameB + ".";

    $("resultStats").textContent =
      "Cost per use — " + nameA + ": " + money(costPerUseA) +
      "; " + nameB + ": " + money(costPerUseB) +
      ". Budget remaining — " + nameA + ": " + money(remainingA) +
      "; " + nameB + ": " + money(remainingB) + ".";

    $("extraChecks").textContent =
      "These figures use your estimates. Confirm shipping, taxes, quality, and return policies before buying.";

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

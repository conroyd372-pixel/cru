const routes = document.querySelectorAll("[data-route]");
const pages = document.querySelectorAll(".page");
const menuButton = document.querySelector(".menu-button");
const topNav = document.querySelector(".top-nav");
const panelButtons = document.querySelectorAll("[data-panel]");
const panels = document.querySelectorAll(".panel-view");
const serviceButtons = document.querySelectorAll("[data-service]");
const serviceTitle = document.getElementById("service-title");
const serviceCopy = document.getElementById("service-copy");
const demoLoginButton = document.querySelector("[data-demo-login]");
const loginStatus = document.getElementById("login-status");
const agentTierInput = document.getElementById("agent-tier");
const agentCountInput = document.getElementById("agent-count");
const serviceModelInput = document.getElementById("service-model");
const serviceMonthsInput = document.getElementById("service-months");
const monthlyTotal = document.getElementById("monthly-total");
const quoteBreakdown = document.getElementById("quote-breakdown");
const strategySubmit = document.getElementById("strategy-submit");
const strategyStatus = document.getElementById("strategy-status");

const pricing = {
  base: 10,
  tiers: {
    english: { label: "English Only", rate: 10 },
    spanish: { label: "Spanish Only", rate: 10 },
    bilingual: { label: "Bilingual English & Spanish", rate: 12 }
  }
};

const serviceGuide = {
  support: {
    title: "Customer support",
    copy: "Choose this if you need help answering customers, managing inboxes, booking appointments, or keeping customers updated in English, Spanish, or both."
  },
  bilingual: {
    title: "Bilingual support capabilities",
    copy: "Choose this if your customers need English and Spanish coverage from professionals who can fit into your existing workflow."
  },
  sales: {
    title: "Sales follow-up",
    copy: "Choose this if you need help following up with leads, keeping your CRM updated, or booking sales conversations."
  },
  tech: {
    title: "Tech support",
    copy: "Choose this if customers need help with software, accounts, onboarding, troubleshooting, or support tickets."
  },
  social: {
    title: "Social media",
    copy: "Choose this if you need help posting, responding to messages, organizing content, or keeping your online presence active."
  },
  workflow: {
    title: "Workflow setup",
    copy: "Choose this if your business needs clearer tasks, handoffs, reports, onboarding steps, or team processes."
  }
};

function showRoute(route) {
  pages.forEach((page) => page.classList.toggle("active", page.id === route));
  routes.forEach((link) => link.classList.toggle("active", link.dataset.route === route));
  topNav.classList.remove("open");
}

function showPanel(panel) {
  panels.forEach((view) => view.classList.toggle("active", view.id === panel));
  panelButtons.forEach((button) => button.classList.toggle("active", button.dataset.panel === panel));
}

routes.forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    const route = link.dataset.route;
    history.replaceState(null, "", `#${route}`);
    showRoute(route);
  });
});

panelButtons.forEach((button) => {
  button.addEventListener("click", () => showPanel(button.dataset.panel));
});

serviceButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const service = serviceGuide[button.dataset.service];
    serviceButtons.forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    serviceTitle.textContent = service.title;
    serviceCopy.textContent = service.copy;
  });
});

menuButton.addEventListener("click", () => topNav.classList.toggle("open"));

if (demoLoginButton && loginStatus) {
  demoLoginButton.addEventListener("click", () => {
    loginStatus.textContent = "Email sign-in will connect here. Clients go to payment first; talent goes to the application.";
  });
}

function updateQuote() {
  if (!agentTierInput || !agentCountInput || !monthlyTotal || !quoteBreakdown) return;

  const tier = pricing.tiers[agentTierInput.value] || pricing.tiers.english;
  const count = Math.max(0, Number.parseInt(agentCountInput.value, 10) || 0);
  const serviceModel = serviceModelInput?.value || "fixed";
  const months = Math.max(1, Number.parseInt(serviceMonthsInput?.value, 10) || 1);
  const total = pricing.base + count * tier.rate;
  const duration = serviceModel === "ongoing" ? "ongoing month-to-month service" : `${months} month fixed term`;

  monthlyTotal.textContent = `$${total}/month`;
  quoteBreakdown.textContent = `$10 platform + ${count} ${tier.label} agent${count === 1 ? "" : "s"} at $${tier.rate}/agent/month. Contract: ${duration}.`;
}

[agentTierInput, agentCountInput, serviceModelInput, serviceMonthsInput].forEach((input) => {
  input?.addEventListener("input", updateQuote);
  input?.addEventListener("change", updateQuote);
});
updateQuote();

if (strategySubmit && strategyStatus) {
  strategySubmit.addEventListener("click", async () => {
    const form = strategySubmit.closest("form");
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());
    strategyStatus.textContent = "Sending request...";

    try {
      const response = await fetch("/api/strategy-call", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      strategyStatus.textContent = result.ok
        ? "Request sent. CariReps will follow up through your preferred contact method."
        : result.message;
    } catch (error) {
      strategyStatus.textContent = "We could not send this request. Please email CariReps directly.";
    }
  });
}

const requestedRoute = location.hash.replace("#", "") || "home";
const initialRoute = requestedRoute;
showRoute(document.getElementById(initialRoute) ? initialRoute : "home");

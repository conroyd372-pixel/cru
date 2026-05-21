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

const serviceGuide = {
  support: {
    title: "Customer support",
    copy: "Choose this if you need help answering customers, managing inboxes, booking appointments, or keeping customers updated."
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
    loginStatus.textContent = "Google sign-in will connect here. Clients go to payment first; talent goes to the application.";
  });
}

const requestedRoute = location.hash.replace("#", "") || "home";
const initialRoute = requestedRoute;
showRoute(document.getElementById(initialRoute) ? initialRoute : "home");

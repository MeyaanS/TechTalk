const TITLE = [
  "✔ No alert",
  "⚠ Stage 1: Fire Weather Watch",
  "⚠⚠ Stage 2: Red Flag Warning",
  "⛔ Stage 3: Evacuation"
];

function add(parent, tag, text = "") {
  const el = document.createElement(tag);
  el.textContent = text;
  parent.append(el);
  return el;
}

async function check(sim) {
  const out = document.getElementById("out");
  out.textContent = "Checking official sources...";

  const params = new URLSearchParams({
    zip: document.getElementById("zip").value,
    pets: document.getElementById("pets").value
  });
  if (sim !== undefined) params.set("sim", sim);

  try {
    const res = await fetch("/api?" + params.toString());
    const d = await res.json();

    out.textContent = "";

    const box = add(out, "div");
    box.className = "box s" + d.stage;

    add(box, "h2", TITLE[d.stage]);

    if (d.simulated) {
      const p = add(box, "p", "SIMULATED FOR DEMO. This is not a real alert.");
      p.style.fontWeight = "700";
    }

    if (!d.ok) {
      add(box, "p", "Data unavailable. We could not reach the weather service or find that ZIP code. This does NOT mean you are safe.");
    } else if (!d.stage) {
      add(box, "p", "No fire weather watch or warning for " + d.place + " right now.");
    }

    if (d.actions && d.actions.length) {
      add(box, "h3", "Do these first");
      const ol = add(box, "ol");
      d.actions.forEach(a => add(ol, "li", a));
    }

    if (d.alerts) {
      d.alerts.forEach(a => {
        const card = add(out, "div");
        card.className = "box";
        add(card, "b", a.event);
        add(card, "p", "Expires " + (a.expires || "n/a") + " · Source: " + a.senderName + " via api.weather.gov");
        add(card, "pre", a.description);
      });
    }

    if (d.ok) {
      add(out, "p", "Source: National Weather Service (api.weather.gov), checked " + d.time + ".");
    }
  } catch (err) {
    out.textContent = "Error connecting to server.";
  }
}
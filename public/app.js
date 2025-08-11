const API = "/api/tasks";
const $ = (id) => document.getElementById(id);

async function load() {
  const res = await fetch(API);
  const data = await res.json();
  render(data);
}

function render(tasks) {
  $("list").innerHTML = tasks
    .map(
      (t) => `<li>
        <span class="${t.done ? "done" : ""}">${t.title}</span>
        <button onclick="toggle('${t._id}')">✓</button>
        <button onclick="removeTask('${t._id}')">✖</button>
      </li>`
    )
    .join("");
}

$("addForm").onsubmit = async (e) => {
  e.preventDefault();
  const title = $("title").value.trim();
  if (!title) return;
  await fetch(API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
  });
  $("title").value = "";
  load();
};

async function toggle(id) {
  await fetch(`${API}?id=${id}`, { method: "PUT" });
  load();
}

async function removeTask(id) {
  await fetch(`${API}?id=${id}`, { method: "DELETE" });
  load();
}

load();

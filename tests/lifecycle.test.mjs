import test from "node:test";
import assert from "node:assert/strict";
import { ApiWidget } from "../dist/js/ApiWidget.js";
import { ToDoWidget } from "../dist/js/ToDoWidget.js";

class ProbeWidget extends ApiWidget {
  constructor() {
    super({ title: "Probe" });
    this.states = [];
  }
  setStatus(state, message) {
    this.states.push({ state, message });
  }
}

test("API exposes loading, success, empty and HTTP-error states", async () => {
  const original = globalThis.fetch;
  try {
    const widget = new ProbeWidget();
    globalThis.fetch = async () => ({
      ok: true,
      json: async () => ({ value: 18 }),
    });
    await widget.request("https://example.test", (data) => data.value === 18);
    assert.deepEqual(
      widget.states.map((s) => s.state),
      ["loading", "success"],
    );
    await widget.request("https://example.test", () => false);
    assert.equal(widget.states.at(-1).state, "empty");
    globalThis.fetch = async () => ({ ok: false });
    await widget.request("https://example.test", () => true);
    assert.equal(widget.states.at(-1).state, "error");
    widget.destroy();
  } finally {
    globalThis.fetch = original;
  }
});

test("superseded request and destroy abort pending requests and listeners", async () => {
  const original = globalThis.fetch;
  try {
    const calls = [];
    globalThis.fetch = (_url, { signal }) =>
      new Promise((resolve, reject) => {
        calls.push({ signal, resolve });
        signal.addEventListener(
          "abort",
          () => reject(new DOMException("Aborted", "AbortError")),
          { once: true },
        );
      });
    const widget = new ProbeWidget();
    let consumed = 0;
    const first = widget.request("https://example.test/one", () => {
      consumed++;
      return true;
    });
    const second = widget.request("https://example.test/two", () => {
      consumed++;
      return true;
    });
    assert.equal(calls[0].signal.aborted, true);
    calls[1].resolve({ ok: true, json: async () => ({}) });
    await Promise.all([first, second]);
    assert.equal(consumed, 1);
    const target = new EventTarget();
    let clicks = 0;
    widget.listen(target, "click", () => clicks++);
    target.dispatchEvent(new Event("click"));
    const third = widget.request("https://example.test/three", () => true);
    widget.destroy();
    await third;
    target.dispatchEvent(new Event("click"));
    assert.equal(calls[2].signal.aborted, true);
    assert.equal(clicks, 1);
    assert.equal(widget.disposed, true);
  } finally {
    globalThis.fetch = original;
  }
});

test("ToDo widgets own independent arrays and serialize their own tasks", () => {
  const a = new ToDoWidget({ state: { tasks: [] } });
  const b = new ToDoWidget({ state: { tasks: [] } });
  a.paint = () => {};
  b.paint = () => {};
  a.addTask("  Проверить документы  ");
  b.addTask("Выбрать жильё");
  assert.equal(a.tasks[0].text, "Проверить документы");
  assert.equal(b.tasks[0].text, "Выбрать жильё");
  a.tasks[0].done = true;
  assert.equal(b.tasks[0].done, false);
  assert.equal(a.serialize().state.tasks.length, 1);
  assert.notEqual(a.tasks, b.tasks);
  a.destroy();
  b.destroy();
});

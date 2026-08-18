import { strict as assert } from "node:assert";
import { test } from "vitest";
import { createTabNavigationHistory, moveInTabNavigationHistory, recordTabVisit } from "../../apps/desktop/src/lib/tabs/tabNavigationHistory.ts";

test("按实际查看顺序后退和前进", () => {
  let history = createTabNavigationHistory();
  history = recordTabVisit(history, "A");
  history = recordTabVisit(history, "D");
  history = recordTabVisit(history, "B");
  const openTabs = new Set(["A", "B", "C", "D"]);

  const backToD = moveInTabNavigationHistory(history, -1, openTabs);
  assert.equal(backToD?.tabId, "D");
  history = backToD!.history;

  const backToA = moveInTabNavigationHistory(history, -1, openTabs);
  assert.equal(backToA?.tabId, "A");
  history = backToA!.history;

  const forwardToD = moveInTabNavigationHistory(history, 1, openTabs);
  assert.equal(forwardToD?.tabId, "D");
  history = forwardToD!.history;

  assert.equal(moveInTabNavigationHistory(history, 1, openTabs)?.tabId, "B");
});

test("后退后手动查看标签会清除前进分支", () => {
  let history = createTabNavigationHistory();
  history = recordTabVisit(history, "A");
  history = recordTabVisit(history, "D");
  history = recordTabVisit(history, "B");

  history = moveInTabNavigationHistory(history, -1, new Set(["A", "B", "C", "D"]))!.history;
  history = recordTabVisit(history, "C");

  assert.deepEqual(history, { entries: ["A", "D", "C"], index: 2 });
  assert.equal(moveInTabNavigationHistory(history, 1, new Set(["A", "B", "C", "D"])), null);
});

test("导航时跳过已经关闭的标签页", () => {
  let history = createTabNavigationHistory();
  history = recordTabVisit(history, "A");
  history = recordTabVisit(history, "B");
  history = recordTabVisit(history, "C");
  const openTabs = new Set(["A", "C"]);

  const backToA = moveInTabNavigationHistory(history, -1, openTabs);
  assert.equal(backToA?.tabId, "A");
  assert.equal(moveInTabNavigationHistory(backToA!.history, 1, openTabs)?.tabId, "C");
});

test("导航时跳过与当前标签相同的历史记录", () => {
  let history = createTabNavigationHistory();
  history = recordTabVisit(history, "A");
  history = recordTabVisit(history, "D");
  history = recordTabVisit(history, "B");
  history = recordTabVisit(history, "D");

  assert.equal(moveInTabNavigationHistory(history, -1, new Set(["A", "D"]), "D")?.tabId, "A");
});

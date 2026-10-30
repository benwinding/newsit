/** @jest-environment jsdom */
import { ButtonResult } from "../shared/models";

jest.doMock("react", () => {
  const actual: typeof import("react") = jest.requireActual("react");
  return { ...actual, __esModule: true, default: actual };
});
const React: typeof import("react") = jest.requireActual("react");
const ReactDOM: typeof import("react-dom") = jest.requireActual("react-dom");
const { act }: typeof import("react-dom/test-utils") = jest.requireActual("react-dom/test-utils");
const { BtnItem }: typeof import("./buttons") = jest.requireActual("./buttons");

let container: HTMLDivElement;
beforeEach(() => {
  container = document.createElement("div");
  document.body.appendChild(container);
});
afterEach(() => {
  act(() => { ReactDOM.unmountComponentAtNode(container); });
  container.remove();
  jest.restoreAllMocks();
  jest.useRealTimers();
});

function render(result: ButtonResult, disableTargetBlank = false, onRetry?: () => void) {
  act(() => {
    ReactDOM.render(<BtnItem
      title="Lobsters" logoUrl="lobsters.png" submitLink="https://lobste.rs/stories/new"
      reverseLayout={false} disableTargetBlank={disableTargetBlank}
      result={result} sizeChanged={() => {}}
      onRetry={onRetry}
    />, container);
  });
}

test("shows loading and failure messages without claiming there are no submissions", () => {
  render({ text: "...", status: "Checking Lobsters…" });
  expect(container.querySelector('[role="status"]').textContent).toBe("Checking Lobsters…");
  render({ text: "!", status: "Lobsters: rate-limited. Try again later." });
  expect(container.textContent).toContain("rate-limited");
  expect(container.querySelector("a")).toBeNull();
  render({ text: "-" });
  expect(container.querySelector("a").href).toBe("https://lobste.rs/stories/new");
});

test("shows a cooldown countdown and only allows retry after it expires", () => {
  jest.useFakeTimers();
  const now = jest.spyOn(Date, "now").mockReturnValue(1000000);
  const retry = jest.fn();
  render({ text: "!", status: "Lobsters: rate-limited.", retryAt: 1060000 }, false, retry);
  expect(container.textContent).toContain("Try again in 1:00");
  expect(container.querySelector("button").disabled).toBe(true);
  act(() => { container.querySelector("button").click(); });
  expect(retry).not.toHaveBeenCalled();
  now.mockReturnValue(1060000);
  act(() => { jest.advanceTimersByTime(1000); });
  expect(container.textContent).toContain("Ready to retry.");
  expect(container.querySelector("button").disabled).toBe(false);
  act(() => { container.querySelector("button").click(); });
  expect(retry).toHaveBeenCalledTimes(1);
});

test.each([false, true])("discussion, expanded results and submission respect current-tab=%s", (currentTab) => {
  render({
    text: "2", link: "https://lobste.rs/s/abc123",
    other_results: [{
      post_url: "https://example.com/", post_title: "An article", post_by: "alice",
      post_date: "1 day ago", post_upvotes: 5, comments_count: 2,
      comments_link: "https://lobste.rs/s/abc123",
    }],
  }, currentTab);
  const target = currentTab ? "_self" : "_blank";
  expect(container.querySelector("a").target).toBe(target);
  act(() => {
    container.querySelector("#i-chevron-top").dispatchEvent(new MouseEvent("click", { bubbles: true }));
  });
  expect(container.textContent).toContain("All Lobsters Results");
  const links = Array.from(container.querySelectorAll("a"));
  expect(links).toHaveLength(4);
  links.forEach((link) => expect(link.target).toBe(target));
});

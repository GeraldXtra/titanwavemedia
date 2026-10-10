import shell from "@/content/console/shell";

const ROWS = ["92%", "84%", "88%", "70%"];

export default function ConsoleLoading() {
  return (
    <div data-skeleton="" aria-busy="true">
      <h1 className="sr-only" aria-live="polite">
        {shell.loading}
      </h1>
      <div aria-hidden="true">
        <div className="c-head">
          <div className="skel-grow">
            <span className="skel skel--h" />
            <span className="skel skel--lede" />
          </div>
        </div>
        <div className="c-stats c-stats--3">
          {[0, 1, 2].map((i) => (
            <div className="c-stat" key={i}>
              <span className="skel skel--label" />
              <span className="skel skel--num" />
              <span className="skel skel--sub" />
            </div>
          ))}
        </div>
        <div className="c-sec c-card">
          <span className="skel skel--h2" />
          {ROWS.map((w) => (
            <span className="skel skel--row" style={{ width: w }} key={w} />
          ))}
        </div>
      </div>
    </div>
  );
}

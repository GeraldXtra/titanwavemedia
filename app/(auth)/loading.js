import copy from "@/content/console/signin";

export default function AuthLoading() {
  return (
    <div data-skeleton="" aria-busy="true">
      <h1 className="sr-only" aria-live="polite">
        {copy.loading}
      </h1>
      <div aria-hidden="true">
        <span className="skel skel--mark" />
        <span className="skel skel--si-h" />
        <span className="skel skel--si-sub" />
        <div className="si__form">
          <span className="skel skel--si-label" />
          <span className="skel skel--si-field" />
          <span className="skel skel--si-btn" />
        </div>
      </div>
    </div>
  );
}

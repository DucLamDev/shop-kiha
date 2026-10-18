export default function Loading() {
  return (
    <main
      id="main-content"
      className="container loading-page"
      aria-busy="true"
      aria-label="Đang tải nội dung"
    >
      <div className="skeleton skeleton-title" />
      <div className="skeleton skeleton-subtitle" />
      <div className="product-grid">
        {[1, 2, 3].map((i) => (
          <div key={i}>
            <div className="skeleton skeleton-image" />
            <div className="skeleton skeleton-subtitle" />
          </div>
        ))}
      </div>
    </main>
  );
}

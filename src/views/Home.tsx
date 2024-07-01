import type { FC } from "hono/jsx";
import { html } from "hono/html";
import Layout from "./Layout.js";

const Home: FC = () => {
  return (
    <Layout title="DailyHot API">
      <main className="home">
        <div className="img">
          <img
            src="data:image/png;base64,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"
            alt="logo"
          />
        </div>
        <div className="title">
          <h1 className="title-text">DailyHot API</h1>
          <span className="title-tip">服务已正常运行</span>
        </div>
        <div class="control">
          <button id="all-button">
            <svg
              className="btn-icon"
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
            >
              <path
                fill="currentColor"
                d="M7.71 6.71a.996.996 0 0 0-1.41 0L1.71 11.3a.996.996 0 0 0 0 1.41L6.3 17.3a.996.996 0 1 0 1.41-1.41L3.83 12l3.88-3.88c.38-.39.38-1.03 0-1.41m8.58 0a.996.996 0 0 0 0 1.41L20.17 12l-3.88 3.88a.996.996 0 1 0 1.41 1.41l4.59-4.59a.996.996 0 0 0 0-1.41L17.7 6.7c-.38-.38-1.02-.38-1.41.01M8 13c.55 0 1-.45 1-1s-.45-1-1-1s-1 .45-1 1s.45 1 1 1m4 0c.55 0 1-.45 1-1s-.45-1-1-1s-1 .45-1 1s.45 1 1 1m4-2c-.55 0-1 .45-1 1s.45 1 1 1s1-.45 1-1s-.45-1-1-1"
              />
            </svg>
            <span className="btn-text">全部接口</span>
          </button>
          <button id="docs-button">
            <svg
              className="btn-icon"
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
            >
              <path
                fill="currentColor"
                d="M3 6c-.55 0-1 .45-1 1v13c0 1.1.9 2 2 2h13c.55 0 1-.45 1-1s-.45-1-1-1H5c-.55 0-1-.45-1-1V7c0-.55-.45-1-1-1m17-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2m-2 9h-8c-.55 0-1-.45-1-1s.45-1 1-1h8c.55 0 1 .45 1 1s-.45 1-1 1m-4 4h-4c-.55 0-1-.45-1-1s.45-1 1-1h4c.55 0 1 .45 1 1s-.45 1-1 1m4-8h-8c-.55 0-1-.45-1-1s.45-1 1-1h8c.55 0 1 .45 1 1s-.45 1-1 1"
              />
            </svg>
            <span className="btn-text">项目文档</span>
          </button>
        </div>
      </main>
      {html`
        <script>
          document.getElementById("all-button").addEventListener("click", () => {
            window.location.href = "/all";
          });
          document.getElementById("docs-button").addEventListener("click", () => {
            window.open("https://blog.imsyy.top/posts/2024/0408");
          });
        </script>
      `}
    </Layout>
  );
};

export default Home;

export const Badge = () => (
  <a href="https://transitapp.com" target="_blank">
    <picture>
      <source srcset="/transit-api-badge.svg" type="image/svg+xml" />
      <source srcset="/transit-api-badge@3x.png" type="image/png" />
      <img src="/transit-api-badge.svg" alt="Powered by Transit badge" />
    </picture>
  </a>
);

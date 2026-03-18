/** コーポレートサイトの各セクションHTML生成 */

export function renderNav(): string {
  return `
    <nav class="corp-nav">
      <div class="logo-text">株式会社ノーマル</div>
      <ul class="nav-links">
        <li>ホーム</li>
        <li>事業内容</li>
        <li>会社概要</li>
        <li>チーム</li>
        <li>お知らせ</li>
        <li>お問い合わせ</li>
      </ul>
    </nav>
  `;
}

export function renderHero(): string {
  return `
    <section class="corp-section hero-section">
      <div class="section-inner">
        <div class="section-label">Welcome</div>
        <h1 class="section-title">未来をつくる、<br>確かなテクノロジー</h1>
        <p class="section-text">
          株式会社ノーマルは、最先端のテクノロジーで社会課題を解決する企業です。
          私たちは「普通」を超え、新しい価値を創造し続けます。
        </p>
      </div>
    </section>
  `;
}

export function renderAbout(): string {
  return `
    <section class="corp-section">
      <div class="section-inner">
        <div class="section-label">About Us</div>
        <h2 class="section-title">会社概要</h2>
        <p class="section-text">
          2015年の設立以来、私たちは常にイノベーションの最前線に立ち続けてきました。
          東京を拠点に、グローバルな視点でビジネスを展開しています。
        </p>
        <p class="section-text">
          社名の「ノーマル」には、非凡な技術を誰もが当たり前に使える世界を目指すという
          想いが込められています。
        </p>
      </div>
    </section>
  `;
}

export function renderServices(): string {
  return `
    <section class="corp-section">
      <div class="section-inner">
        <div class="section-label">Services</div>
        <h2 class="section-title">事業内容</h2>
        <p class="section-text">幅広いソリューションで、ビジネスの成長をサポートします。</p>
        <div class="service-grid">
          <div class="service-card">
            <span class="service-icon" aria-hidden="true">&#9741;</span>
            <h3>DXコンサルティング</h3>
            <p>デジタルトランスフォーメーションの戦略立案から実行支援まで</p>
          </div>
          <div class="service-card">
            <span class="service-icon" aria-hidden="true">&#9878;</span>
            <h3>AIソリューション</h3>
            <p>機械学習・深層学習を活用した業務効率化と意思決定支援</p>
          </div>
          <div class="service-card">
            <span class="service-icon" aria-hidden="true">&#9729;</span>
            <h3>クラウド基盤構築</h3>
            <p>スケーラブルで安全なクラウドインフラの設計と運用</p>
          </div>
        </div>
      </div>
    </section>
  `;
}

export function renderStats(): string {
  return `
    <section class="corp-section">
      <div class="section-inner">
        <div class="section-label">Numbers</div>
        <h2 class="section-title">数字で見るノーマル</h2>
        <div class="stats-grid">
          <div class="stat-item">
            <span class="stat-number">150+</span>
            <span class="stat-label">プロジェクト実績</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">98%</span>
            <span class="stat-label">顧客満足度</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">45</span>
            <span class="stat-label">社員数</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">10</span>
            <span class="stat-label">年の実績</span>
          </div>
        </div>
      </div>
    </section>
  `;
}

export function renderTeam(): string {
  return `
    <section class="corp-section">
      <div class="section-inner">
        <div class="section-label">Team</div>
        <h2 class="section-title">メンバー紹介</h2>
        <p class="section-text">多彩なバックグラウンドを持つプロフェッショナルが集結しています。</p>
        <div class="team-grid">
          <div class="team-member">
            <div class="team-avatar" aria-hidden="true">田</div>
            <h3>田中 太郎</h3>
            <p>代表取締役 CEO</p>
          </div>
          <div class="team-member">
            <div class="team-avatar" aria-hidden="true">鈴</div>
            <h3>鈴木 花子</h3>
            <p>取締役 CTO</p>
          </div>
          <div class="team-member">
            <div class="team-avatar" aria-hidden="true">佐</div>
            <h3>佐藤 健一</h3>
            <p>デザインリード</p>
          </div>
        </div>
      </div>
    </section>
  `;
}

export function renderNews(): string {
  return `
    <section class="corp-section">
      <div class="section-inner">
        <div class="section-label">News</div>
        <h2 class="section-title">お知らせ</h2>
        <p class="section-text">2025.03.01 — 新オフィスを東京・渋谷に移転しました。</p>
        <p class="section-text">2025.02.15 — AI事業部を新設し、体制を強化しました。</p>
        <p class="section-text">2025.01.10 — 年間売上が前年比150%を達成しました。</p>
      </div>
    </section>
  `;
}

export function renderCta(): string {
  return `
    <section class="corp-section">
      <div class="section-inner">
        <div class="cta-box">
          <h3>お気軽にご相談ください</h3>
          <p>ビジネスの課題、私たちと一緒に解決しませんか？</p>
          <button type="button" class="cta-button">お問い合わせ</button>
        </div>
      </div>
    </section>
  `;
}

export function renderFooter(): string {
  return `
    <footer class="corp-footer">
      &copy; 2025 株式会社ノーマル All Rights Reserved.
    </footer>
  `;
}

/** 1ループ分の全セクションHTMLを返す */
export function renderLoop(): string {
  return [
    renderNav(),
    renderHero(),
    renderAbout(),
    renderServices(),
    renderStats(),
    renderTeam(),
    renderNews(),
    renderCta(),
    renderFooter(),
  ].join("");
}

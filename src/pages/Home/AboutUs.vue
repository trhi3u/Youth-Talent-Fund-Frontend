<template>
  <div class="about">
    <section class="about-hero" :style="heroStyle">
      <div class="hero-overlay" />
      <div class="hero-inner">
        <div class="hero-title">
          <h1>Về quỹ tài năng trẻ</h1>
          <p class="hero-sub">Chúng tôi tin rằng mọi tài năng trẻ đều có tiềm năng vô hạn.</p>
          <p class="hero-sub">Sứ mệnh của chúng tôi là tạo ra những cơ hội công bằng, giúp các em phát triển tài năng và đóng góp tích cực cho xã hội.</p>
        </div>
        <div class="hero-stats">
          <div class="stat">
            <div class="stat-number">2020</div>
            <div class="stat-label">Năm thành lập</div>
          </div>
          <div class="stat">
            <div class="stat-number">3000+</div>
            <div class="stat-label">Tài năng trẻ được hỗ trợ</div>
          </div>
          <div class="stat">
            <div class="stat-number">34</div>
            <div class="stat-label">Tỉnh thành có mặt</div>
          </div>
        </div>
      </div>
    </section>

    <section class="about-section mission">
      <div class="section-inner">
        <div class="mission-text">
          <p class="section-kicker">Sứ mệnh của chúng tôi</p>
          <h2>Hành trình đồng hành cùng tài năng trẻ</h2>
          <p>
            Quỹ Tài Năng Trẻ được thành lập với mục tiêu cao cả: tạo ra một tương lai tươi sáng cho thế hệ trẻ thông qua giáo dục và phát triển kỹ năng. Chúng tôi không chỉ hỗ trợ tài chính mà còn đồng hành cùng các em trong suốt hành trình phát triển.
          </p>
          <p>
            Với đội ngũ chuyên gia giàu kinh nghiệm và mạng lưới đối tác rộng khắp, chúng tôi cam kết mang đến những chương trình hỗ trợ chất lượng cao, phù hợp với nhu cầu thực tế của từng cá nhân.
          </p>
        </div>
        <div class="mission-media">
          <img :src="aboutDetail" alt="Hoạt động cộng đồng" />
        </div>
      </div>
    </section>

    <section class="about-section values">
      <div class="section-inner">
        <h2>Giá trị cốt lõi</h2>
        <div class="values-grid">
          <div class="value-card">
            <span class="value-icon" aria-hidden="true">❤️</span>
            <h3>Tận tâm</h3>
            <p>Chúng tôi đặt trọn tâm huyết vào mọi hoạt động, luôn lắng nghe và thấu hiểu nhu cầu của các em nhỏ và thanh niên.</p>
          </div>
          <div class="value-card">
            <span class="value-icon" aria-hidden="true">🤝</span>
            <h3>Đồng hành</h3>
            <p>Không chỉ hỗ trợ tài chính, chúng tôi đồng hành cùng các tài năng trẻ trong suốt hành trình phát triển của các em.</p>
          </div>
          <div class="value-card">
            <span class="value-icon" aria-hidden="true">🌱</span>
            <h3>Phát triển</h3>
            <p>Nuôi dưỡng và mở rộng cơ hội học tập, rèn luyện kỹ năng để tài năng trẻ có thể vươn xa và bền vững.</p>
          </div>
          <div class="value-card">
            <span class="value-icon" aria-hidden="true">🔍</span>
            <h3>Minh bạch</h3>
            <p>Hoạt động công khai, minh bạch trong mọi giao dịch và báo cáo định kỳ để xây dựng lòng tin với cộng đồng.</p>
          </div>
        </div>
      </div>
    </section>

    <section class="about-section cta">
      <div class="cta-inner">
        <div class="cta-copy">
          <h2>Chung tay ươm mầm tài năng trẻ</h2>
          <p>Hãy cùng chúng tôi tạo nên những cơ hội mới, giúp các em phát triển tiềm năng và đóng góp tích cực cho xã hội.</p>
        </div>
        <div class="cta-media">
          <img :src="aboutHero" alt="Cộng đồng tài năng trẻ" />
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import aboutHero from '@/assets/image/aboutus.png';
import aboutDetail from '@/assets/image/aboutus1.png';

const heroStyle = {
  backgroundImage: `linear-gradient(180deg, rgba(6, 70, 86, 0.35) 0%, rgba(6, 70, 86, 0.65) 100%), url(${aboutHero})`
};
</script>

<style scoped lang="scss">
.about {
  display: grid;
  gap: 48px;
  padding-bottom: 56px;
}

.about-hero {
  position: relative;
  border-radius: 0 0 28px 28px;
  overflow: hidden;
  min-height: 420px;
  background-size: cover;
  background-position: center;
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.25) 0%, rgba(0, 0, 0, 0.55) 70%);
}

.hero-inner {
  position: relative;
  z-index: 1;
  max-width: 1180px;
  margin: 0 auto;
  padding: 48px 24px 56px;
  display: grid;
  gap: 28px;
  color: #fff;
  text-align: center;
}

.hero-title h1 {
  font-size: 36px;
  font-weight: 800;
  letter-spacing: -0.3px;
}

.hero-sub {
  margin-top: 10px;
  font-size: 15px;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.9);
}

.hero-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
  justify-items: center;
}

.stat {
  display: grid;
  gap: 6px;
  padding: 14px 18px;
  border-radius: 14px;
  min-width: 180px;
  text-align: center;
}

.stat-number {
  font-size: 22px;
  font-weight: 800;
}

.stat-label {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
}

.about-section {
  max-width: 1180px;
  margin: 0 auto;
  padding: 0 24px;
}

.section-inner {
  background: #f6f9fb;
  border: 1px solid rgba(12, 100, 120, 0.08);
  border-radius: 20px;
  padding: 28px;
  display: grid;
  gap: 20px;
  align-items: center;
  box-shadow: 0 16px 32px rgba(0, 0, 0, 0.04);
}

.mission .section-inner {
  grid-template-columns: 1fr 0.9fr;
}

.mission-text h2 {
  font-size: 24px;
  color: #0b6c7f;
  margin-bottom: 12px;
}

.mission-text p {
  color: #35516d;
  line-height: 1.6;
  margin-top: 10px;
}

.section-kicker {
  font-weight: 700;
  color: rgba(12, 100, 120, 0.7);
  margin-bottom: 6px;
  letter-spacing: 0.2px;
}

.mission-media img {
  width: 100%;
  border-radius: 16px;
  object-fit: cover;
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.08);
}

.values .section-inner {
  display: grid;
  gap: 18px;
}

.values-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 18px;
}

.value-card {
  background: #fff;
  border: 1px solid #09D1C7;
  border-radius: 16px;
  padding: 16px;
  display: grid;
  gap: 8px;
  text-align: center;
  color: #35516d;
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.04);
}

.value-icon {
  font-size: 20px;
}

.value-card h3 {
  color: #0b6c7f;
  font-size: 16px;
  font-weight: 700;
}

.value-card p {
  font-size: 14px;
  line-height: 1.55;
}

.cta .cta-inner {
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 18px;
  align-items: center;
  background: #0b6c7f;
  color: #fff;
  padding: 24px;
  border-radius: 18px;
  box-shadow: 0 16px 28px rgba(0, 0, 0, 0.08);
}

.cta-copy h2 {
  font-size: 22px;
  margin-bottom: 8px;
}

.cta-copy p {
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.6;
}

.cta-media img {
  width: 100%;
  border-radius: 14px;
  object-fit: cover;
  background: rgba(255, 255, 255, 0.1);
}

@media (max-width: 960px) {
  .mission .section-inner,
  .cta .cta-inner {
    grid-template-columns: 1fr;
  }

  .hero-title h1 {
    font-size: 30px;
  }
}

@media (max-width: 640px) {
  .about {
    gap: 32px;
  }

  .hero-inner {
    padding: 36px 16px 44px;
  }

  .stat {
    width: 100%;
  }

  .section-inner {
    padding: 20px;
  }
}
</style>

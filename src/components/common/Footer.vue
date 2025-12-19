<template>
  <footer class="footer">
    <div class="block brand">
      <div class="logo">Quỹ tài năng trẻ</div>
      <p class="desc">Kết nối nhà hảo tâm và các chiến dịch giáo dục minh bạch.</p>
    </div>
    <div class="block">
      <h4>Điều hướng</h4>
      <RouterLink to="/">Trang chủ</RouterLink>
      <RouterLink to="/about">Giới thiệu</RouterLink>
      <RouterLink to="/campaigns">Chiến dịch</RouterLink>
    </div>
    <div class="block">
      <h4>Liên hệ</h4>
      <a href="mailto:contact@youthtalentfund.org">contact@youthtalentfund.org</a>
      <a href="tel:+84900000000">+84 900 000 000</a>
      <span>Văn phòng: TP. Hồ Chí Minh</span>
    </div>
    <div class="block">
      <h4>Kết nối</h4>
      <a href="#">Facebook</a>
      <a href="#">LinkedIn</a>
      <a href="#">YouTube</a>
    </div>
    <div class="block terms">
      <RouterLink to="/terms">Điều khoản</RouterLink>
      <RouterLink to="/privacy">Chính sách bảo mật</RouterLink>
    </div>
    <div class="copy">© 2025 Quỹ tài năng trẻ</div>
  </footer>
</template>

<script setup>
import { RouterLink } from 'vue-router';
</script>

<style scoped lang="scss">
.footer {
  padding: 32px;
  background: #ffffff;
  border-top: 1px solid rgba(12, 100, 120, 0.1);
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  color: var(--primary-strong);
}

.block {
  display: grid;
  gap: 8px;

  h4 {
    font-size: 14px;
    font-weight: 700;
    letter-spacing: 0.02em;
  }

  a, span {
    color: #35516d;
    font-size: 14px;
  }
}

.brand .logo {
  font-weight: 700;
  font-size: 20px;
  color: var(--primary-strong);
}

.brand .desc {
  color: #35516d;
}

.terms {
  align-self: end;
}

.copy {
  grid-column: 1 / -1;
  text-align: right;
  font-size: 14px;
  color: rgba(33, 58, 88, 0.7);
}
</style>

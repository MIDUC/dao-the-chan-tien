/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "dao-bg": "#1a1a2e", // Nền tối
        "dao-card": "#16213e", // Nền thẻ bài
        "dao-gold": "#ffd700", // Màu chữ vàng
        "dao-qi": "#0f3460", // Màu linh khí
        "dao-silver": "#C0C0C0", // Màu bạc
        "dao-qi-light": "#B0E0E6", // Màu linh khí pastel xanh
        "dao-qi-silver": "#B8D4E3", // Kết hợp bạc + xanh pastel
      },
      fontFamily: {
        // Loại A: Font thư pháp Việt hóa cho tiêu đề
        "thu-phap": ['"UTM ThuPhap Thien An"', "serif"],
        // Loại B: Font nội dung
        sans: ['"Noto Sans"', "system-ui", "sans-serif"],
      },
      animation: {
        shimmer: 'shimmer 2s infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
    },
  },
  plugins: [],
};

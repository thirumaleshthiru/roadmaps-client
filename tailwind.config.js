import daisyui from "daisyui";
import lineClamp from "@tailwindcss/line-clamp";

export default {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [daisyui, lineClamp],
  daisyui:{
    themes:["light"],
  }
};

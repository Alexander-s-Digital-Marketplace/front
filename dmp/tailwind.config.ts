import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",

        //фоны
        LightIceBlue: '#CEE5F2',  //  DarkAquamarine
        PastelBlue: '#ACCBE1',    //  DarkOceanBlue
        GrayishBlue: '#7C98B3',   //  SoftSunsetOrange

        //кнопка
        DarkSlateBlue: '#637081', //  WarmSand
        DeepTealBlue: '#536B78 ', //  GoldenYellow

        //текст
        DarkAquamarine: '#084C61',
        DarkOceanBlue: '#0B3C5D',
        SoftSunsetOrange: '#F4A259',
        WarmSand: '#E8DAB2',
        GoldenYellow: '#FFD275',
        CharcoalGray: '#2B2D42',
        CrimsonBlaze: '#D7263D',

        // зеленая кнопка
        EmeraldGreen: '#57CC99',  //   CharcoalGray
        MintGreen: '#80ED99',     //   CharcoalGray


        //для дефолт кнопок bg-DarkSlateBlue hover:bg-DeepTealBlue

      },
    },
  },
  plugins: [],
} satisfies Config;

/** @type {import('tailwindcss').Config} */
module.exports = {
  // ১. কনটেন্ট পাথ সেটআপ (যাতে Tailwind আপনার কোড ফাইলগুলো স্ক্যান করতে পারে)
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  
  // ২. কাস্টম ডিজাইন বা থিম এক্সটেন্ড করা (ডার্ক মোডের জন্য)
  darkMode: "class", // ক্লাস ভিত্তিক ডার্ক মোড এনাবল করার জন্য
  
  theme: {
    extend: {
      // এখানে আপনি চাইলে নিজের মতো করে কাস্টম কালার বা অ্যানিমেশন যোগ করতে পারেন
      colors: {
        slate: {
          750: '#1e293b', // ডায়ালপ্যাডের জন্য কাস্টম মিড-টোন কালার
        }
      }
    },
  },
  plugins: [],
};

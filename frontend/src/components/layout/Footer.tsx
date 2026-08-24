import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-primary text-on-primary w-full bottom-0 flat shrink-0 py-8 px-6 border-t border-outline-variant/30 mt-auto">
      <div className="w-full max-w-container-max mx-auto flex flex-col items-center justify-center space-y-4 text-center">
        {/* Policy Links */}
        <div className="flex flex-wrap justify-center gap-6 font-sans text-sm text-on-primary/90">
          <a className="hover:text-tertiary-fixed transition-colors hover:underline" href="#">Website Policies</a>
          <a className="hover:text-tertiary-fixed transition-colors hover:underline" href="#">Help</a>
          <a className="hover:text-tertiary-fixed transition-colors hover:underline" href="#">Contact Us</a>
          <a className="hover:text-tertiary-fixed transition-colors hover:underline" href="#">Sitemap</a>
        </div>

        {/* Development Attribution */}
        <div className="font-sans text-xs text-on-primary/80">
          Website designed and developed by National Informatics Centre
        </div>

        {/* Official Logos */}
        <div className="flex items-center gap-4 my-2">
          <img
            alt="National Informatics Centre (NIC) Logo"
            className="h-8 object-contain bg-white/10 p-1 rounded"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuA1s1AqMdK1jP5S7XLfzLw3-QXEs2HlrIGUaKmq6CIZ7Rxak_daWztr0nreXqZDgJpwznyPEqt0AQ4VsyDXRPYrhhXnl3f9_ZLl4SLKHcJBr0bMdj0gpTh9hlXQQKCoOyooGmaGFUL-bLQVwQ0LOEmDWM5MYQSb_Yt3pacDNo9cO0qgAQXC2HV-xyrYY_1R1sZIuGE_faxARdBZDZS7DzsChIIjkWY68yEkesFvWkrpZ7J-Sp8MYHI"
          />
          <img
            alt="Digital India Campaign Logo"
            className="h-8 object-contain bg-white/10 p-1 rounded"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuALpL3CwSYf7XXdIxF--TwfyUJA5h7f80cGy__AETGfSTPkDSaXTj3jRmZ4p5gy-Blsy5ssCUXEzoR2UOZ59zRo0XE0spJry7rLwBSwRRtVUTwYgpBwSK5dHP9fFJbXRNZ2aiGFBCN3OeZ-Jfkttu6rsG2dBhzBaazZthhC1Ju23otuei9suXeAeGoxRDFztgM3K7gGBT_iGHb7SyX6wps4TSltpqGyKcxv-gSbDy6mmFr1kgmRnhc"
          />
        </div>

        {/* Copyright */}
        <div className="text-on-primary font-bold text-xs">
          © 2024 Ministry of Home Affairs, Government of India
        </div>

        {/* Visitor Stats */}
        <div className="font-mono text-[11px] text-on-primary/60">
          Last Updated: 24 Oct 2024 | Visitors: 1,452,890
        </div>
      </div>
    </footer>
  );
};

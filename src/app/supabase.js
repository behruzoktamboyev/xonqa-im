import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://hisgsqlcxyhvzysyxque.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhpc2dzcWxjeHlodnp5c3l4cXVlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgzMjY4NDUsImV4cCI6MjEwMzkwMjg0NX0.0kL6Wd8hE6H98s0sZ32j3W8y_e1JzX5yU";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Client-side Canvas Image Resizer & Compressor to WebP (< 150KB, max 1200px)
 */
export async function compressImageToWebP(file, maxWidth = 1200, quality = 0.8) {
  if (!file || !file.type.startsWith('image/')) return file;

  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.src = url;

    img.onload = () => {
      URL.revokeObjectURL(url);
      let width = img.width;
      let height = img.height;

      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const newFile = new File([blob], file.name.replace(/\.[^/.]+$/, '.webp'), {
                type: 'image/webp',
                lastModified: Date.now(),
              });
              resolve(newFile);
            } else {
              resolve(file);
            }
          },
          'image/webp',
          quality
        );
      } else {
        resolve(file);
      }
    };

    img.onerror = () => resolve(file);
  });
}

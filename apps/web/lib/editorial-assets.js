import images from '../../../data/editorial-media.json';
export const editorialImages = Object.fromEntries(images.map((image) => [image.role, image]));
export function illustrationCaption(src) {
  return images.some((image) => image.src === src) ? 'Không gian cảm hứng · Hình minh họa AI' : '';
}

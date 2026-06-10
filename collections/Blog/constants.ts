import { type Option } from 'payload'

export enum BlogType {
  DeepDive = 'deep-dive',
  ProductReview = 'product-review',
  News = 'news',
  Guide = 'guide',
  Research = 'research',
  Other = 'other',
}

const blogTypeLabel = {
  [BlogType.DeepDive]: 'Deep Dive',
  [BlogType.ProductReview]: 'Product Review',
  [BlogType.News]: 'News',
  [BlogType.Guide]: 'Guide',
  [BlogType.Research]: 'Research',
  [BlogType.Other]: 'Other',
}

export const blogTypeOptions: Option[] = [
  { label: blogTypeLabel[BlogType.DeepDive], value: BlogType.DeepDive },
  {
    label: blogTypeLabel[BlogType.ProductReview],
    value: BlogType.ProductReview,
  },
  { label: blogTypeLabel[BlogType.News], value: BlogType.News },
  { label: blogTypeLabel[BlogType.Guide], value: BlogType.Guide },
  { label: blogTypeLabel[BlogType.Research], value: BlogType.Research },
  { label: blogTypeLabel[BlogType.Other], value: BlogType.Other },
] as const satisfies Option[]

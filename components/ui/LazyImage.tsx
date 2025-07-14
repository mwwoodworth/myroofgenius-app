'use client'
import Image, { ImageProps } from 'next/image'

export default function LazyImage({ alt, ...rest }: ImageProps & { alt: string }) {
  return <Image loading="lazy" alt={alt} {...rest} />
}

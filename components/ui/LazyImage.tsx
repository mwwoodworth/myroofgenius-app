'use client'
import Image, { ImageProps } from 'next/image'

export default function LazyImage({ alt, ...rest }: ImageProps) {
  return <Image loading="lazy" alt={alt} {...rest} />
}

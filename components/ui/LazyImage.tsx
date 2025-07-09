'use client'
import Image, { ImageProps } from 'next/image'

export default function LazyImage(props: ImageProps) {
  return <Image loading="lazy" {...props} />
}

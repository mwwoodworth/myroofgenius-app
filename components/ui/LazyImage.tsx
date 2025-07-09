'use client'
interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {}
export default function LazyImage(props: LazyImageProps) {
  return <img loading="lazy" decoding="async" {...props} />
}

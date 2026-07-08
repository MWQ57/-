interface TransparentImageProps {
  src: string
  alt: string
  className?: string
  containerClassName?: string
}

export function TransparentImage({ src, alt, className = '', containerClassName = '' }: TransparentImageProps) {
  return (
    <div
      className={`checkerboard ${containerClassName}`}
      style={{
        backgroundImage: `
          linear-gradient(45deg, #e8e4df 25%, transparent 25%),
          linear-gradient(-45deg, #e8e4df 25%, transparent 25%),
          linear-gradient(45deg, transparent 75%, #e8e4df 75%),
          linear-gradient(-45deg, transparent 75%, #e8e4df 75%)
        `,
        backgroundSize: '12px 12px',
        backgroundPosition: '0 0, 0 6px, 6px -6px, -6px 0',
        backgroundColor: '#f5f2ef',
      }}
    >
      <img src={src} alt={alt} className={className} draggable={false} />
    </div>
  )
}

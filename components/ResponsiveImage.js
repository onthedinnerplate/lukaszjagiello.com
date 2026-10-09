/**
 * Pre-encoded picture. next/image stays off this path: with `unoptimized` it
 * drops srcSet and sizes, which is what made the collage download 1600px fulls
 * for a ~220px tile. Width and height are the fallback file's real pixels.
 */
export default function ResponsiveImage({
  src,
  alt,
  width,
  height,
  sizes,
  srcSet,
  avifSrcSet,
  className,
  pictureClassName,
  style,
  loading,
  fetchPriority,
  decoding = 'async',
}) {
  return (
    <picture className={pictureClassName}>
      {avifSrcSet ? <source type="image/avif" srcSet={avifSrcSet} sizes={sizes} /> : null}
      {srcSet ? <source type="image/webp" srcSet={srcSet} sizes={sizes} /> : null}
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        sizes={sizes}
        srcSet={srcSet || undefined}
        className={className}
        style={style}
        loading={loading}
        fetchPriority={fetchPriority}
        decoding={decoding}
      />
    </picture>
  );
}

import styles from '@/styles/Journal.module.css';

export default function ShapeMosaic({ shape, src, alt, companionSrc, onClick }) {
  if (!shape) return null;
  const style = { aspectRatio: `${shape.gridW} / ${shape.gridH}` };
  const pieces = (
    <>
      {shape.blocks.map((block, i) => (
        <span
          key={`block-${i}`}
          className={styles.block}
          style={{
            left: block.left,
            top: block.top,
            width: block.width,
            height: block.height,
            background: block.color,
            clipPath: block.clip,
          }}
          aria-hidden="true"
        />
      ))}
      {shape.pieces.map((piece, i) => {
        const image = piece.companion && companionSrc ? companionSrc : src;
        return (
          <span
            key={`piece-${i}`}
            className={styles.slice}
            style={{
              left: piece.left,
              top: piece.top,
              width: piece.width,
              height: piece.height,
              clipPath: piece.clip,
              backgroundImage: `url("${image}")`,
              backgroundSize: piece.bgSize,
              backgroundPosition: piece.bgPos,
              zIndex: i + 1,
            }}
          >
            {piece.overlay ? <span className={styles.veil} style={{ background: shape.overlay }} /> : null}
          </span>
        );
      })}
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        className={`${styles.stage} ${styles.stageBtn}`}
        style={style}
        onClick={onClick}
        aria-label={`View full image: ${alt}`}
      >
        {pieces}
      </button>
    );
  }

  return (
    <div className={styles.stage} style={style} aria-hidden="true">
      {pieces}
    </div>
  );
}

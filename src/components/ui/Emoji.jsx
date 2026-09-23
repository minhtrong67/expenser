// Renders an emoji glyph at a given size. Kept separate from Icon (which
// forces the Material Symbols font) so emojis always render with the
// platform's native emoji font/colours.
export default function Emoji({ children, size = 20, className = '', style, ...rest }) {
  return (
    <span
      role="img"
      className={`inline-block leading-none ${className}`}
      style={{ fontSize: size, fontStyle: 'normal', ...style }}
      {...rest}
    >
      {children}
    </span>
  );
}

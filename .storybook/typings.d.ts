declare module '*.md' {
  const content: string;
  export default content;
}

// Image imports in docs blocks (Vite resolves them to URLs).
declare module '*.png' {
  const url: string;
  export default url;
}
declare module '*.svg' {
  const url: string;
  export default url;
}

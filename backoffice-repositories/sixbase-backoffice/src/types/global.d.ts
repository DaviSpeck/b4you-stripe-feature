// Tipos globais para o projeto
declare module '*.scss' {
  const content: { [className: string]: string };
  export default content;
}

declare module '*.svg' {
  const content: string;
  export default content;
}

declare module '*.png' {
  const content: string;
  export default content;
}

declare module '*.jpg' {
  const content: string;
  export default content;
}

declare module '*.jpeg' {
  const content: string;
  export default content;
}

declare module '*.gif' {
  const content: string;
  export default content;
}

// Tipos para bibliotecas sem definições TypeScript
declare module 'apexcharts-clevision';
declare module 'bs-stepper';
declare module 'nouislider';
declare module 'cleave.js';
declare module 'prismjs';
declare module 'screenfull';
declare module 'wnumb';

// Extensões globais do Window
declare global {
  interface Window {
    // Adicione propriedades globais do window aqui se necessário
  }
}

export {};

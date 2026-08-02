"use client";

import { useEffect } from "react";

// Componente invisível — só registra o Service Worker no navegador,
// requisito técnico para o app poder ser instalado na tela inicial.
export default function ServiceWorkerRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Falha ao registrar o SW não deve travar o app — o site
        // continua funcionando normalmente, só sem a opção de
        // instalação/uso offline básico.
      });
    }
  }, []);

  return null;
}

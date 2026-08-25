// Biblioteca — modelos de documento com preenchimento automático.
//
// Decisão de escopo: sem integração com armazenamento de arquivos
// (OneDrive/S3 — nunca validada), não há "estrutura automática de
// pastas". O que entrega valor real hoje: modelos de texto prontos,
// preenchidos com dados do projeto e cliente, para copiar e usar.

export interface DocumentTemplate {
  id: string;
  name: string;
  description: string;
  content: string;
}

export const DOCUMENT_TEMPLATES: DocumentTemplate[] = [
  {
    id: "termo-aprovacao",
    name: "Termo de Aprovação de Etapa",
    description: "Documento de aceite formal do cliente para uma etapa do projeto.",
    content: `TERMO DE APROVAÇÃO DE ETAPA

Projeto: {{projeto}}
Cliente: {{cliente}}
Tipo de projeto: {{tipo}}
Data: {{data}}

Declaro que revisei e aprovo a etapa apresentada, conforme discutido em reunião.
Alterações adicionais além das rodadas de revisão incluídas no contrato serão
tratadas como um novo orçamento (aditivo).

_______________________________
Assinatura do cliente`,
  },
  {
    id: "documento-entrega",
    name: "Documento de Entrega Final",
    description: "Registro formal de entrega do projeto ao cliente.",
    content: `DOCUMENTO DE ENTREGA FINAL

Projeto: {{projeto}}
Cliente: {{cliente}}
Tipo de projeto: {{tipo}}
Data de entrega: {{data}}

Confirmamos a entrega final do projeto acima, incluindo toda a documentação
técnica e materiais acordados em contrato.

Agradecemos a confiança no nosso trabalho.

_______________________________
Assinatura do cliente`,
  },
];

export function findDocumentTemplate(id: string): DocumentTemplate | undefined {
  return DOCUMENT_TEMPLATES.find((t) => t.id === id);
}
